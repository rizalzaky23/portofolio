import { useRef, useCallback, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  useGLTF,
  MeshTransmissionMaterial,
  Environment,
  Lightformer,
  Text,
  Image as DreiImage,
} from '@react-three/drei';
import { Physics, RigidBody, BallCollider, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { useUIStore } from '@/store/uiStore';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

// ─── Lanyard Rope Segment ────────────────────────────────────────────────────
function RopeSegment({
  position,
  radius = 0.06,
}: {
  position: [number, number, number];
  radius?: number;
}) {
  return (
    <RigidBody position={position} type="dynamic" colliders={false} linearDamping={0.8} angularDamping={0.8}>
      <BallCollider args={[radius]} />
      <mesh castShadow>
        <sphereGeometry args={[radius, 8, 8]} />
        <meshStandardMaterial color="#B45309" roughness={0.4} metalness={0.6} />
      </mesh>
    </RigidBody>
  );
}

// ─── ID Card Texture ──────────────────────────────────────────────────────────
const CARD_WIDTH  = 2.4;
const CARD_HEIGHT = 3.4;

function IdCard({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <RigidBody ref={groupRef as never} position={position} type="dynamic" linearDamping={2} angularDamping={4} colliders="cuboid">
      <group>
        {/* Card body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, 0.02]} />
          <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.4} />
        </mesh>

        {/* Card surface (color overlay) */}
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} />
        </mesh>

        {/* Accent stripe */}
        <mesh position={[0, CARD_HEIGHT / 2 - 0.3, 0.012]}>
          <planeGeometry args={[CARD_WIDTH, 0.5]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.2} />
        </mesh>

        {/* Clip hole */}
        <mesh position={[0, CARD_HEIGHT / 2 - 0.1, 0.015]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </RigidBody>
  );
}

// ─── Lanyard Physics Scene ────────────────────────────────────────────────────
const SEGMENT_COUNT = 10;

function LanyardPhysics() {
  const refs = useRef<Array<{ current: { applyImpulse?: (v: object, w: boolean) => void } | null }>>([]);
  const { pointer } = useThree();

  // Initialize refs
  if (refs.current.length !== SEGMENT_COUNT + 1) {
    refs.current = Array.from({ length: SEGMENT_COUNT + 1 }, () => ({ current: null }));
  }

  // Apply gentle forces based on mouse
  useFrame(() => {
    if (refs.current[SEGMENT_COUNT]?.current?.applyImpulse) {
      const impulse = {
        x: pointer.x * 0.002,
        y: 0,
        z: 0,
      };
      refs.current[SEGMENT_COUNT].current?.applyImpulse?.(impulse, true);
    }
  });

  return (
    <>
      {/* Fixed anchor at top */}
      <RigidBody type="fixed" position={[0, 5, 0]}>
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Rope segments */}
      {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
        <RopeSegment
          key={i}
          position={[0, 5 - (i + 1) * 0.4, 0]}
        />
      ))}

      {/* ID Card at the bottom */}
      <IdCard position={[0, 5 - (SEGMENT_COUNT + 1) * 0.4 - CARD_HEIGHT / 2, 0]} />
    </>
  );
}

// ─── Scroll CTA ───────────────────────────────────────────────────────────────
function ScrollCta() {
  return (
    <motion.div
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[--color-muted]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <span className="text-xs tracking-[0.25em] uppercase font-medium">Scroll to Explore</span>
      <motion.div
        className="w-px h-10 bg-gradient-to-b from-[--color-muted] to-transparent"
        animate={{ scaleY: [0, 1, 0], originY: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─── Main Lanyard Scene ───────────────────────────────────────────────────────
export function LanyardScene() {
  const setLanyardDone = useUIStore((s) => s.setLanyardDone);
  const scrollY = useMotionValue(0);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const pointerY = useTransform(scrollY, [0, 200], [0, -100]);

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      scrollY.set(sy);
      if (sy > 250) setLanyardDone(true);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY, setLanyardDone]);

  return (
    <motion.div
      className="fixed inset-0 z-10"
      style={{ opacity, y: pointerY }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#0F172A']} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#F59E0B" />
        <pointLight position={[5, -5, 5]} intensity={0.3} color="#334155" />

        <Environment preset="city" />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <LanyardPhysics />
          </Physics>
        </Suspense>
      </Canvas>

      <ScrollCta />

      {/* Name + role overlay */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-48 text-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p className="section-label mb-3">Portfolio</p>
        <h1 className="text-6xl md:text-8xl font-[--font-heading] font-black tracking-tight text-[--color-foreground] leading-none">
          Rizal<br />
          <span className="gradient-text">Zaky</span>
        </h1>
        <p className="mt-4 text-lg text-[--color-muted] font-medium">Software Dev</p>
      </motion.div>
    </motion.div>
  );
}
