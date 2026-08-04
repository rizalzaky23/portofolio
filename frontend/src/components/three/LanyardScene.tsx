import React, { useRef, useState, useMemo, Component, ReactNode, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Physics, RigidBody, BallCollider, CuboidCollider,
  useRopeJoint, RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';

// ─── Card Dimensions ──────────────────────────────────────────────────────────
const CARD_W = 2.2;
const CARD_H = 3.3;
const CARD_D = 0.05;

// ─── Error Boundary (Prevents ANY 3D/WASM crash from breaking the app) ────────
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('3D Lanyard Error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ─── Canvas Helper: Rounded Rect ──────────────────────────────────────────────
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ─── QR Pattern ───────────────────────────────────────────────────────────────
function drawQR(ctx: CanvasRenderingContext2D, ox: number, oy: number, sz: number) {
  const cells = 19;
  const cell = sz / cells;
  ctx.fillStyle = '#0A0F1A';
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isCornerTL = r < 7 && c < 7;
      const isCornerTR = r < 7 && c >= cells - 7;
      const isCornerBL = r >= cells - 7 && c < 7;
      const isFinder = isCornerTL || isCornerTR || isCornerBL;
      const data = isFinder
        ? ((r === 0 || r === 6) && c >= 0 && c <= 6) ||
          ((c === 0 || c === 6) && r >= 0 && r <= 6) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          ((r === 0 || r === 6) && c >= cells - 7 && c <= cells - 1) ||
          ((c === cells - 7 || c === cells - 1) && r >= 0 && r <= 6) ||
          (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
          ((r === cells - 7 || r === cells - 1) && c >= 0 && c <= 6) ||
          ((c === 0 || c === 6) && r >= cells - 7 && r <= cells - 1) ||
          (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4)
        : ((r * 11 + c * 7 + r * c * 3) % 5 < 2);
      if (data) {
        ctx.fillRect(ox + c * cell + 0.5, oy + r * cell + 0.5, cell - 1, cell - 1);
      }
    }
  }
}

// ─── NFC Waves ────────────────────────────────────────────────────────────────
function drawNFC(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = 'rgba(245,158,11,0.8)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 1; i <= 3; i++) {
    const r = i * 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 1.25, Math.PI * 1.75, false);
    ctx.stroke();
  }
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Card Texture Generator ───────────────────────────────────────────────────
function useCardTexture() {
  return useMemo(() => {
    const W = 1024, H = 1536;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;

    const redraw = (withImage?: HTMLImageElement) => {
      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#0C1220');
      bg.addColorStop(0.5, '#101827');
      bg.addColorStop(1,   '#080C16');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Amber Header Strip
      const strip = ctx.createLinearGradient(0, 0, W, 0);
      strip.addColorStop(0,   '#78350F');
      strip.addColorStop(0.5, '#F59E0B');
      strip.addColorStop(1,   '#78350F');
      ctx.fillStyle = strip;
      ctx.fillRect(0, 0, W, 96);

      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillStyle = '#0A0D16';
      ctx.textAlign = 'center';
      ctx.fillText('IDENTITY BADGE', W / 2, 60);

      // Photo Frame
      const px = (W - 460) / 2, py = 130, pw = 460, ph = 460;
      ctx.fillStyle = '#F59E0B';
      rrect(ctx, px - 6, py - 6, pw + 12, ph + 12, 26);
      ctx.fill();
      ctx.fillStyle = '#0C1220';
      rrect(ctx, px - 2, py - 2, pw + 4, ph + 4, 22);
      ctx.fill();

      ctx.save();
      rrect(ctx, px, py, pw, ph, 20);
      ctx.clip();
      if (withImage) {
        ctx.drawImage(withImage, px, py, pw, ph);
      } else {
        ctx.fillStyle = '#1E2A42';
        ctx.fillRect(px, py, pw, ph);
        ctx.fillStyle = '#2A3B5C';
        ctx.beginPath(); ctx.arc(W/2, py + 160, 80, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(W/2, py + ph + 20, 160, 90, 0, Math.PI, 0, true); ctx.fill();
      }
      ctx.restore();

      // Name & Title
      ctx.font = '900 70px Arial, sans-serif';
      ctx.fillStyle = '#F8FAFC';
      ctx.textAlign = 'center';
      ctx.fillText('RIZAL ZAKY', W / 2, 700);

      ctx.font = 'bold 34px Arial, sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('SOFTWARE ENGINEER', W / 2, 755);

      // Divider
      ctx.strokeStyle = 'rgba(245,158,11,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(80, 790); ctx.lineTo(W - 80, 790); ctx.stroke();

      // Info List
      const infos: [string, string, string][] = [
        ['ID NUMBER', 'EMP-2026-9923', '#CBD5E1'],
        ['DEPT', 'CREATIVE DEV & ARCHITECT', '#CBD5E1'],
        ['STATUS', '● ACTIVE / AVAILABLE', '#34D399'],
      ];

      infos.forEach(([label, value, color], i) => {
        const y = 845 + i * 60;
        ctx.font = '22px "Courier New", monospace';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'left';
        ctx.fillText(label + ':', 80, y);
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(value, 300, y);
      });

      // QR Code
      ctx.fillStyle = '#FFFFFF';
      rrect(ctx, 80, 1060, 260, 260, 14);
      ctx.fill();
      drawQR(ctx, 96, 1076, 228);

      // NFC Block
      ctx.fillStyle = 'rgba(245,158,11,0.06)';
      rrect(ctx, 370, 1060, W - 80 - 370, 260, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245,158,11,0.25)';
      ctx.lineWidth = 1;
      rrect(ctx, 370, 1060, W - 80 - 370, 260, 14);
      ctx.stroke();

      drawNFC(ctx, 450, 1145);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('NFC ENABLED', 490, 1120);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText('rizalzaky.dev', 490, 1160);
      ctx.fillText('@rizalzaky23', 490, 1195);

      // Footer
      ctx.fillStyle = '#78350F';
      ctx.fillRect(0, H - 64, W, 64);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('© 2026 RIZAL ZAKY • FULLSTACK & CREATIVE ARCHITECT', W / 2, H - 24);

      texture.needsUpdate = true;
    };

    redraw();

    const img = new Image();
    img.src = '/profile_avatar.png';
    img.onload = () => {
      try { redraw(img); } catch (e) { console.warn(e); }
    };

    return texture;
  }, []);
}

// ─── 60 FPS Direct Geometry Rope Line (Zero React State Mutating in Frame) ─────
function DynamicRope({ refs }: { refs: RefObject<RapierRigidBody>[] }) {
  const lineObj = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({ color: 0xF59E0B, linewidth: 3 });
    return new THREE.Line(geom, mat);
  }, []);

  useFrame(() => {
    if (!refs.every(r => r.current)) return;
    const coords: number[] = [];
    refs.forEach((r, idx) => {
      const p = r.current!.translation();
      if (idx === refs.length - 1) {
        coords.push(p.x, p.y + CARD_H / 2, p.z);
      } else {
        coords.push(p.x, p.y, p.z);
      }
    });

    const v3Points: THREE.Vector3[] = [];
    for (let i = 0; i < coords.length; i += 3) {
      v3Points.push(new THREE.Vector3(coords[i], coords[i + 1], coords[i + 2]));
    }
    const curve = new THREE.CatmullRomCurve3(v3Points);
    const smoothPoints = curve.getPoints(24);
    const flatCoords = new Float32Array(smoothPoints.length * 3);
    smoothPoints.forEach((pt, i) => {
      flatCoords[i * 3]     = pt.x;
      flatCoords[i * 3 + 1] = pt.y;
      flatCoords[i * 3 + 2] = pt.z;
    });

    lineObj.geometry.setAttribute('position', new THREE.BufferAttribute(flatCoords, 3));
    lineObj.geometry.computeBoundingSphere();
  });

  return <primitive object={lineObj} />;
}

// ─── Interactive Physics Lanyard ──────────────────────────────────────────────
function InteractiveLanyard() {
  const cardTexture = useCardTexture();

  const fixedRef = useRef<RapierRigidBody>(null);
  const j1       = useRef<RapierRigidBody>(null);
  const j2       = useRef<RapierRigidBody>(null);
  const j3       = useRef<RapierRigidBody>(null);
  const cardRef   = useRef<RapierRigidBody>(null);

  // Rapier Rope Joints
  useRopeJoint(
    fixedRef as unknown as RefObject<RapierRigidBody>,
    j1       as unknown as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0.4, 0], 0.75],
  );
  useRopeJoint(
    j1 as unknown as RefObject<RapierRigidBody>,
    j2 as unknown as RefObject<RapierRigidBody>,
    [[0, -0.4, 0], [0, 0.4, 0], 0.75],
  );
  useRopeJoint(
    j2 as unknown as RefObject<RapierRigidBody>,
    j3 as unknown as RefObject<RapierRigidBody>,
    [[0, -0.4, 0], [0, 0.4, 0], 0.75],
  );
  useRopeJoint(
    j3      as unknown as RefObject<RapierRigidBody>,
    cardRef as unknown as RefObject<RapierRigidBody>,
    [[0, -0.4, 0], [0, CARD_H / 2 + 0.15, 0], 0.75],
  );

  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const { pointer, camera } = useThree();

  useFrame(() => {
    if (!cardRef.current) return;
    if (isDragging) {
      raycaster.setFromCamera(pointer, camera);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, hit);
      if (hit) {
        cardRef.current.setNextKinematicTranslation({
          x: hit.x,
          y: hit.y,
          z: Math.max(-1.5, Math.min(2, hit.z)),
        });
      }
    } else {
      const t = Date.now() * 0.002;
      const naturalSway = Math.sin(t) * 0.003;
      cardRef.current.applyImpulse(
        { x: naturalSway + pointer.x * 0.002, y: 0, z: 0 },
        true,
      );
    }
  });

  const allRefs = [
    fixedRef as RefObject<RapierRigidBody>,
    j1       as RefObject<RapierRigidBody>,
    j2       as RefObject<RapierRigidBody>,
    j3       as RefObject<RapierRigidBody>,
    cardRef  as RefObject<RapierRigidBody>,
  ];

  return (
    <>
      {/* Top Fixed Anchor */}
      <RigidBody ref={fixedRef} type="fixed" position={[0, 4.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
          <meshStandardMaterial color="#A1A1AA" metalness={0.9} roughness={0.1} />
        </mesh>
      </RigidBody>

      {/* Dynamic Rope Joints */}
      <RigidBody ref={j1} position={[0, 3.3, 0]} type="dynamic" linearDamping={2.0} angularDamping={3.0}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody ref={j2} position={[0, 2.4, 0]} type="dynamic" linearDamping={2.0} angularDamping={3.0}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody ref={j3} position={[0, 1.5, 0]} type="dynamic" linearDamping={2.0} angularDamping={3.0}>
        <BallCollider args={[0.08]} />
      </RigidBody>

      {/* Smooth 60 FPS Rope Line */}
      <DynamicRope refs={allRefs} />

      {/* ID Card Badge */}
      <RigidBody
        ref={cardRef}
        position={[0, 0.3, 0]}
        type={isDragging ? 'kinematicPosition' : 'dynamic'}
        colliders={false}
        linearDamping={2.5}
        angularDamping={4.0}
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_D / 2]} />
        <group>
          {/* Clip */}
          <mesh position={[0, CARD_H / 2 + 0.12, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.24, 16]} />
            <meshStandardMaterial color="#E4E4E7" metalness={0.95} roughness={0.05} />
          </mesh>
          <mesh position={[0, CARD_H / 2 + 0.25, 0]}>
            <torusGeometry args={[0.09, 0.025, 16, 32]} />
            <meshStandardMaterial color="#A1A1AA" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Card Body */}
          <mesh
            onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
            onPointerUp={() => setIsDragging(false)}
            onPointerOut={() => setIsDragging(false)}
          >
            <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
            <meshStandardMaterial color="#0A0F1A" roughness={0.2} metalness={0.1} />
          </mesh>

          {/* Card Front Texture */}
          <mesh position={[0, 0, CARD_D / 2 + 0.001]}>
            <planeGeometry args={[CARD_W, CARD_H]} />
            <meshBasicMaterial map={cardTexture} />
          </mesh>

          {/* Acrylic Glass Frame Overlay */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[CARD_W + 0.04, CARD_H + 0.04, CARD_D + 0.012]} />
            <meshPhysicalMaterial
              transparent
              opacity={0.3}
              roughness={0.1}
              metalness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              color="#FFFFFF"
            />
          </mesh>
        </group>
      </RigidBody>
    </>
  );
}

// ─── Dust Particles ───────────────────────────────────────────────────────────
function DustParticles({ count = 30 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#F59E0B" transparent opacity={0.3} />
    </points>
  );
}

// ─── Elegant 2D Fallback Badge (Renders if WebGL/Physics fails) ───────────────
function LanyardFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-[260px] h-[400px] rounded-3xl p-6 bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#0B0F19] border border-amber-500/30 shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        <div className="w-20 h-20 rounded-full border-2 border-amber-500 overflow-hidden mt-4">
          <img src="/profile_avatar.png" alt="Rizal Zaky" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-wide">RIZAL ZAKY</h3>
          <p className="text-xs font-bold text-amber-500 tracking-wider uppercase mt-1">Software Engineer</p>
          <p className="text-[10px] font-mono text-slate-400 mt-3">ID: EMP-2026-9923</p>
        </div>
        <div className="w-full py-2 bg-slate-900/80 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400">
          ● ACTIVE / AVAILABLE
        </div>
      </div>
    </div>
  );
}

// ─── Main Exported Component ──────────────────────────────────────────────────
export function LanyardScene() {
  return (
    <div className="w-full h-[560px] lg:h-[700px] relative">
      <ThreeErrorBoundary fallback={<LanyardFallback />}>
        <Canvas
          camera={{ position: [0, 0.8, 7], fov: 44 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={0.8} color="#F8FAFC" />
          <directionalLight position={[5, 8, 5]} intensity={2.0} color="#FFF8EE" />
          <directionalLight position={[-5, 3, -4]} intensity={0.6} color="#38BDF8" />
          <pointLight position={[-4, 4, 3]} intensity={1.0} color="#F59E0B" />
          <pointLight position={[4, -2, 3]} intensity={0.6} color="#7DD3FC" />

          <Physics gravity={[0, -9.81, 0]}>
            <InteractiveLanyard />
          </Physics>
          <DustParticles count={30} />
        </Canvas>

        {/* Drag Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] text-slate-400 font-mono pointer-events-none border border-white/5 bg-black/30 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Drag badge to swing
        </div>
      </ThreeErrorBoundary>
    </div>
  );
}
