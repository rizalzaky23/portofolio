import { useRef, useState, useMemo, Suspense, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Line, MeshTransmissionMaterial } from '@react-three/drei';
import { Physics, RigidBody, BallCollider, CuboidCollider, useRopeJoint, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

// ─── ID Card Texture Canvas Generator ─────────────────────────────────────────
function useCardTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1536);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.3, '#1E293B');
    bgGrad.addColorStop(1, '#0B0F19');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1536);

    // Top Amber Accent Strip
    const amberGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    amberGrad.addColorStop(0, '#F59E0B');
    amberGrad.addColorStop(0.5, '#D97706');
    amberGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = amberGrad;
    ctx.fillRect(0, 0, 1024, 120);

    // Header Label & Clip Zone
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IDENTITY BADGE', 512, 80);

    // Profile Photo Box / Border
    const photoX = 262;
    const photoY = 180;
    const photoW = 500;
    const photoH = 500;

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(photoX - 8, photoY - 8, photoW + 16, photoH + 16, 24);
    ctx.fill();

    // Draw Profile Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/profile_avatar.png';
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 20);
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoW, photoH);
      ctx.restore();
      texture.needsUpdate = true;
    };

    // User Details Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RIZAL ZAKY', 512, 780);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 38px Inter, sans-serif';
    ctx.fillText('SOFTWARE ENGINEER', 512, 840);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 890);
    ctx.lineTo(904, 890);
    ctx.stroke();

    // Employee Info Grid
    ctx.fillStyle = '#94A3B8';
    ctx.font = '28px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ID NUMBER:', 120, 950);
    ctx.fillText('DEPT:', 120, 1010);
    ctx.fillText('STATUS:', 120, 1070);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('EMP-2026-9923', 340, 950);
    ctx.fillText('CREATIVE & DEV ARCHITECT', 340, 1010);
    ctx.fillStyle = '#10B981';
    ctx.fillText('● ACTIVE / AVAILABLE', 340, 1070);

    // QR Code Box Placeholder
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(120, 1140, 240, 240, 16);
    ctx.fill();

    // QR pattern
    ctx.fillStyle = '#0F172A';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if ((r + c) % 2 === 0 || (r * c) % 3 === 0) {
          ctx.fillRect(140 + c * 32, 1160 + r * 32, 28, 28);
        }
      }
    }

    // NFC & Branding Block
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.beginPath();
    ctx.roundRect(400, 1140, 504, 240, 16);
    ctx.fill();

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(400, 1140, 504, 240, 16);
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText('NFC ENABLED', 440, 1210);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('Scan for Portfolio & Resume', 440, 1260);
    ctx.fillText('rizalzaky23/portofolio', 440, 1310);

    // Footer copyright label
    ctx.fillStyle = '#64748B';
    ctx.font = '22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('© 2026 RIZAL ZAKY • FULLSTACK & CREATIVE', 512, 1460);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }, []);
}

// ─── 3D Lanyard & Card Component ──────────────────────────────────────────────
const CARD_W = 2.4;
const CARD_H = 3.6;
const CARD_D = 0.05;

function InteractiveLanyard() {
  const cardTexture = useCardTexture();
  const fixedRef = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const cardRef = useRef<RapierRigidBody>(null);

  const [ropePoints, setRopePoints] = useState<[number, number, number][]>([
    [0, 4, 0],
    [0, 3, 0],
    [0, 2, 0],
    [0, 1, 0],
    [0, 0, 0],
  ]);

  // Connect rope joints using Rapier physics
  useRopeJoint(
    fixedRef as unknown as RefObject<RapierRigidBody>,
    j1 as unknown as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0.5, 0], 0.7]
  );
  useRopeJoint(
    j1 as unknown as RefObject<RapierRigidBody>,
    j2 as unknown as RefObject<RapierRigidBody>,
    [[0, -0.5, 0], [0, 0.5, 0], 0.7]
  );
  useRopeJoint(
    j2 as unknown as RefObject<RapierRigidBody>,
    j3 as unknown as RefObject<RapierRigidBody>,
    [[0, -0.5, 0], [0, 0.5, 0], 0.7]
  );
  useRopeJoint(
    j3 as unknown as RefObject<RapierRigidBody>,
    cardRef as unknown as RefObject<RapierRigidBody>,
    [[0, -0.5, 0], [0, CARD_H / 2 + 0.2, 0], 0.7]
  );

  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const { pointer, camera } = useThree();

  // Update rope rendering curve & apply gentle pointer momentum
  useFrame(() => {
    if (fixedRef.current && j1.current && j2.current && j3.current && cardRef.current) {
      const p0 = fixedRef.current.translation();
      const p1 = j1.current.translation();
      const p2 = j2.current.translation();
      const p3 = j3.current.translation();
      const pCard = cardRef.current.translation();

      setRopePoints([
        [p0.x, p0.y, p0.z],
        [p1.x, p1.y, p1.z],
        [p2.x, p2.y, p2.z],
        [p3.x, p3.y, p3.z],
        [pCard.x, pCard.y + CARD_H / 2, pCard.z],
      ]);

      if (isDragging) {
        raycaster.setFromCamera(pointer, camera);
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, target);

        if (target) {
          cardRef.current.setNextKinematicTranslation({
            x: target.x,
            y: target.y,
            z: Math.max(-1, Math.min(2, target.z)),
          });
        }
      } else {
        // Natural sway effect
        const sway = Math.sin(Date.now() * 0.002) * 0.005;
        cardRef.current.applyImpulse({ x: sway + pointer.x * 0.002, y: 0, z: 0 }, true);
      }
    }
  });

  return (
    <>
      {/* Top Fixed Anchor */}
      <RigidBody ref={fixedRef} type="fixed" position={[0, 4.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
          <meshStandardMaterial color="#64748B" metalness={0.9} roughness={0.1} />
        </mesh>
      </RigidBody>

      {/* Rope Segments */}
      <RigidBody ref={j1} position={[0, 3.4, 0]} type="dynamic" linearDamping={1.5} angularDamping={2.5}>
        <BallCollider args={[0.1]} />
      </RigidBody>

      <RigidBody ref={j2} position={[0, 2.6, 0]} type="dynamic" linearDamping={1.5} angularDamping={2.5}>
        <BallCollider args={[0.1]} />
      </RigidBody>

      <RigidBody ref={j3} position={[0, 1.8, 0]} type="dynamic" linearDamping={1.5} angularDamping={2.5}>
        <BallCollider args={[0.1]} />
      </RigidBody>

      {/* Render Dynamic Fabric Lanyard Rope Line */}
      <Line
        points={ropePoints}
        color="#F59E0B"
        lineWidth={5}
      />

      {/* ID Card Badge */}
      <RigidBody
        ref={cardRef}
        position={[0, 0.4, 0]}
        type={isDragging ? 'kinematicPosition' : 'dynamic'}
        colliders={false}
        linearDamping={2.0}
        angularDamping={3.5}
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_D / 2]} />
        <group>
          {/* Metallic Clip on Top */}
          <mesh position={[0, CARD_H / 2 + 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 16]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.05} />
          </mesh>
          <mesh position={[0, CARD_H / 2 + 0.3, 0]}>
            <torusGeometry args={[0.1, 0.03, 16, 32]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Main Card Body with Pointer Handlers for Dragging */}
          <mesh
            castShadow
            receiveShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
            onPointerUp={() => setIsDragging(false)}
            onPointerOut={() => setIsDragging(false)}
          >
            <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
            <meshStandardMaterial color="#0F172A" roughness={0.15} metalness={0.2} />
          </mesh>

          {/* Card Front Texture */}
          <mesh position={[0, 0, CARD_D / 2 + 0.001]}>
            <planeGeometry args={[CARD_W, CARD_H]} />
            <meshBasicMaterial map={cardTexture} />
          </mesh>

          {/* Premium Glass Acrylic Outer Shell overlay */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[CARD_W + 0.04, CARD_H + 0.04, CARD_D + 0.02]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.2}
              roughness={0.05}
              transmission={0.9}
              ior={1.4}
              chromaticAberration={0.03}
              distortion={0.05}
              distortionScale={0.1}
              temporalDistortion={0.0}
              color="#FFFFFF"
            />
          </mesh>
        </group>
      </RigidBody>
    </>
  );
}

// ─── Floating Volumetric Dust Particles ───────────────────────────────────────
function WorkspaceParticles({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#F59E0B"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Main Lanyard Scene Component ─────────────────────────────────────────────
export function LanyardScene() {
  return (
    <div className="w-full h-[550px] lg:h-[720px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B]/60 to-[#090D16] border border-slate-800/80 shadow-2xl">
      <Canvas
        camera={{ position: [0, 1, 7.5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Workspace Cinematic Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={2.2}
          color="#FFF7ED"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-4, 4, -2]} intensity={1.2} color="#F59E0B" />
        <pointLight position={[4, -2, 3]} intensity={0.8} color="#38BDF8" />

        <Environment preset="city" />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <InteractiveLanyard />
          </Physics>
          <WorkspaceParticles count={90} />
        </Suspense>
      </Canvas>

      {/* Subtle Bottom Glow Vignette */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-slate-400 font-mono pointer-events-none bg-slate-900/60 backdrop-blur-md py-2 px-4 rounded-xl border border-slate-800/60">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Interactive 3D Badge • Drag to Swing
        </span>
        <span>R3F + Rapier Physics</span>
      </div>
    </div>
  );
}
