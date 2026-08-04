import { useRef, useState, useMemo, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import {
  Physics, RigidBody, BallCollider, CuboidCollider,
  useRopeJoint, RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';

// ─── Card Dimensions ──────────────────────────────────────────────────────────
const CARD_W = 2.1;
const CARD_H = 3.15;
const CARD_D = 0.04;

// ─── Canvas Rounded Rect Helper ───────────────────────────────────────────────
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
  ctx.strokeStyle = 'rgba(245,158,11,0.7)';
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

// ─── Premium Card Texture ─────────────────────────────────────────────────────
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
      // ── Base Background ──────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#0C1220');
      bg.addColorStop(0.5, '#101827');
      bg.addColorStop(1,   '#080C16');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── Top Amber Header Strip ───────────────────────────────────────────
      const strip = ctx.createLinearGradient(0, 0, W, 0);
      strip.addColorStop(0,   '#78350F');
      strip.addColorStop(0.3, '#B45309');
      strip.addColorStop(0.5, '#F59E0B');
      strip.addColorStop(0.7, '#D97706');
      strip.addColorStop(1,   '#78350F');
      ctx.fillStyle = strip;
      ctx.fillRect(0, 0, W, 96);

      // Header text
      ctx.save();
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillStyle = '#0A0D16';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '10px';
      ctx.fillText('⬡  IDENTITY BADGE  ⬡', W / 2, 62);
      ctx.restore();

      // ── Clip Badge Number ────────────────────────────────────────────────
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      rrect(ctx, W - 220, 20, 180, 54, 8);
      ctx.fill();
      ctx.font = '22px "Courier New", monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('#EMP-9923', W - 130, 52);

      // ── Profile Photo Border ──────────────────────────────────────────────
      const px = (W - 480) / 2, py = 120, pw = 480, ph = 480;

      // Outer amber glow ring
      const ringGrad = ctx.createRadialGradient(W/2, py + ph/2, pw/2 - 12, W/2, py + ph/2, pw/2 + 12);
      ringGrad.addColorStop(0, 'rgba(245,158,11,0.9)');
      ringGrad.addColorStop(1, 'rgba(120,53,15,0)');
      ctx.fillStyle = ringGrad;
      rrect(ctx, px - 10, py - 10, pw + 20, ph + 20, 32);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      rrect(ctx, px - 5, py - 5, pw + 10, ph + 10, 28);
      ctx.fill();

      ctx.fillStyle = '#0C1220';
      rrect(ctx, px - 2, py - 2, pw + 4, ph + 4, 24);
      ctx.fill();

      // Profile image or placeholder
      ctx.save();
      rrect(ctx, px, py, pw, ph, 20);
      ctx.clip();
      if (withImage) {
        ctx.drawImage(withImage, px, py, pw, ph);
      } else {
        // Stylish avatar placeholder
        const placeholderGrad = ctx.createLinearGradient(px, py, px, py + ph);
        placeholderGrad.addColorStop(0, '#1E2A42');
        placeholderGrad.addColorStop(1, '#0E1526');
        ctx.fillStyle = placeholderGrad;
        ctx.fillRect(px, py, pw, ph);
        // Silhouette
        ctx.fillStyle = '#1A2438';
        ctx.beginPath(); ctx.arc(W/2, py + 170, 85, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse(W/2, py + ph + 20, 170, 100, 0, Math.PI, 0, true);
        ctx.fill();
      }
      ctx.restore();

      // ── Name ──────────────────────────────────────────────────────────────
      ctx.font = '900 72px Arial, sans-serif';
      ctx.textAlign = 'center';
      // Text shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillText('RIZAL ZAKY', W / 2 + 2, 712);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText('RIZAL ZAKY', W / 2, 710);

      // ── Role ──────────────────────────────────────────────────────────────
      const roleG = ctx.createLinearGradient(200, 0, W - 200, 0);
      roleG.addColorStop(0, '#B45309');
      roleG.addColorStop(0.5, '#F59E0B');
      roleG.addColorStop(1, '#B45309');
      ctx.fillStyle = roleG;
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.fillText('SOFTWARE ENGINEER', W / 2, 766);

      // ── Divider ───────────────────────────────────────────────────────────
      const div = ctx.createLinearGradient(0, 0, W, 0);
      div.addColorStop(0, 'transparent');
      div.addColorStop(0.2, 'rgba(245,158,11,0.35)');
      div.addColorStop(0.8, 'rgba(245,158,11,0.35)');
      div.addColorStop(1, 'transparent');
      ctx.strokeStyle = div;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(80, 798); ctx.lineTo(W - 80, 798); ctx.stroke();

      // ── Info Rows ─────────────────────────────────────────────────────────
      const infos: [string, string, string][] = [
        ['ID NUMBER', 'EMP-2026-9923', '#CBD5E1'],
        ['DEPT', 'CREATIVE DEV', '#CBD5E1'],
        ['STATUS', '● ACTIVE / AVAILABLE', '#34D399'],
      ];

      infos.forEach(([label, value, vc], i) => {
        const y = 850 + i * 62;
        ctx.font = '24px "Courier New", monospace';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'left';
        ctx.fillText(label + ':', 80, y);
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.fillStyle = vc;
        ctx.fillText(value, 310, y);
      });

      // ── Bottom Panel: QR + NFC ────────────────────────────────────────────
      // Separator
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 1038); ctx.lineTo(W - 80, 1038); ctx.stroke();

      // QR Box
      ctx.fillStyle = '#FFFFFF';
      rrect(ctx, 80, 1068, 270, 270, 14);
      ctx.fill();
      drawQR(ctx, 96, 1084, 238);

      // NFC / Social Box
      ctx.fillStyle = 'rgba(245,158,11,0.05)';
      rrect(ctx, 380, 1068, W - 80 - 380, 270, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245,158,11,0.2)';
      ctx.lineWidth = 1;
      rrect(ctx, 380, 1068, W - 80 - 380, 270, 14);
      ctx.stroke();

      // NFC icon + label
      drawNFC(ctx, 460, 1155);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('NFC ENABLED', 500, 1125);
      ctx.fillStyle = '#64748B';
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText('rizalzaky.dev', 500, 1165);
      ctx.fillText('@rizalzaky23', 500, 1200);
      ctx.fillText('github/rizalzaky23', 500, 1235);

      // Social label row
      ctx.fillStyle = 'rgba(245,158,11,0.5)';
      ctx.font = '20px Arial, sans-serif';
      ctx.textAlign = 'left';
      const socials = ['GitHub', 'LinkedIn', 'Portfolio'];
      socials.forEach((s, i) => {
        ctx.fillText(`• ${s}`, 400 + i * 190, 1300);
      });

      // ── Footer Strip ──────────────────────────────────────────────────────
      const foot = ctx.createLinearGradient(0, 0, W, 0);
      foot.addColorStop(0, '#78350F');
      foot.addColorStop(0.5, '#B45309');
      foot.addColorStop(1, '#78350F');
      ctx.fillStyle = foot;
      ctx.fillRect(0, H - 70, W, 70);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '21px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('© 2026 RIZAL ZAKY  •  FULLSTACK & CREATIVE DEV', W / 2, H - 26);

      texture.needsUpdate = true;
    };

    // Initial draw without image
    redraw();

    // Load profile avatar and redraw safely
    const img = new Image();
    img.src = '/profile_avatar.png';
    img.onload = () => {
      try {
        redraw(img);
      } catch (e) {
        console.warn('Card image draw error:', e);
      }
    };
    img.onerror = () => {
      // Fallback placeholder is already drawn by redraw()
    };

    return texture;
  }, []);
}

// ─── Interactive Lanyard Physics ──────────────────────────────────────────────
function InteractiveLanyard() {
  const cardTexture = useCardTexture();

  const fixedRef = useRef<RapierRigidBody>(null);
  const j1      = useRef<RapierRigidBody>(null);
  const j2      = useRef<RapierRigidBody>(null);
  const j3      = useRef<RapierRigidBody>(null);
  const j4      = useRef<RapierRigidBody>(null);
  const cardRef  = useRef<RapierRigidBody>(null);

  const [ropePoints, setRopePoints] = useState<[number, number, number][]>([
    [0, 4.5, 0], [0, 3.6, 0], [0, 2.7, 0], [0, 1.8, 0], [0, 0.9, 0], [0, 0, 0],
  ]);

  // ─── Rope Joints ──────────────────────────────────────────────────────────
  useRopeJoint(
    fixedRef as unknown as RefObject<RapierRigidBody>,
    j1       as unknown as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0.4, 0], 0.65],
  );
  useRopeJoint(
    j1 as unknown as RefObject<RapierRigidBody>,
    j2 as unknown as RefObject<RapierRigidBody>,
    [[0, -0.4, 0], [0, 0.4, 0], 0.65],
  );
  useRopeJoint(
    j2 as unknown as RefObject<RapierRigidBody>,
    j3 as unknown as RefObject<RapierRigidBody>,
    [[0, -0.4, 0], [0, 0.4, 0], 0.65],
  );
  useRopeJoint(
    j3 as unknown as RefObject<RapierRigidBody>,
    j4 as unknown as RefObject<RapierRigidBody>,
    [[0, -0.4, 0], [0, 0.4, 0], 0.65],
  );
  useRopeJoint(
    j4      as unknown as RefObject<RapierRigidBody>,
    cardRef as unknown as RefObject<RapierRigidBody>,
    [[0, -0.4, 0], [0, CARD_H / 2 + 0.18, 0], 0.65],
  );

  // ─── Drag State ───────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const { pointer, camera } = useThree();

  // ─── Frame Loop ───────────────────────────────────────────────────────────
  useFrame(() => {
    const refs = [fixedRef, j1, j2, j3, j4, cardRef];
    const all = refs.every(r => r.current);
    if (!all) return;

    const [p0, p1, p2, p3, p4, pC] = refs.map(r => r.current!.translation());
    setRopePoints([
      [p0.x, p0.y, p0.z],
      [p1.x, p1.y, p1.z],
      [p2.x, p2.y, p2.z],
      [p3.x, p3.y, p3.z],
      [p4.x, p4.y, p4.z],
      [pC.x, pC.y + CARD_H / 2, pC.z],
    ]);

    if (isDragging) {
      raycaster.setFromCamera(pointer, camera);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, hit);
      if (hit) {
        cardRef.current!.setNextKinematicTranslation({
          x: hit.x,
          y: hit.y,
          z: Math.max(-1.5, Math.min(2, hit.z)),
        });
      }
    } else {
      // Natural sway driven by mouse
      const t = Date.now() * 0.0015;
      const naturalSway = Math.sin(t) * 0.004;
      cardRef.current!.applyImpulse(
        { x: naturalSway + pointer.x * 0.003, y: 0, z: 0 },
        true,
      );
    }
  });

  return (
    <>
      {/* Fixed Anchor Point */}
      <RigidBody ref={fixedRef} type="fixed" position={[0, 4.5, 0]}>
        {/* Metallic clip top */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 20]} />
          <meshStandardMaterial color="#D4D4D8" metalness={1.0} roughness={0.05} />
        </mesh>
      </RigidBody>

      {/* Rope Segments */}
      {[
        { ref: j1, pos: [0, 3.7, 0] as [number, number, number] },
        { ref: j2, pos: [0, 2.8, 0] as [number, number, number] },
        { ref: j3, pos: [0, 1.9, 0] as [number, number, number] },
        { ref: j4, pos: [0, 1.0, 0] as [number, number, number] },
      ].map(({ ref, pos }, i) => (
        <RigidBody
          key={i}
          ref={ref}
          position={pos}
          type="dynamic"
          linearDamping={2.0}
          angularDamping={3.0}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>
      ))}

      {/* Woven Fabric Lanyard — dual-stroke technique */}
      <Line points={ropePoints} color="#0D0D0D" lineWidth={9} />
      <Line points={ropePoints} color="#1C1C1C" lineWidth={4} />
      <Line points={ropePoints} color="rgba(80,60,40,0.18)" lineWidth={2} />

      {/* ID Card Badge */}
      <RigidBody
        ref={cardRef}
        position={[0, 0.2, 0]}
        type={isDragging ? 'kinematicPosition' : 'dynamic'}
        colliders={false}
        linearDamping={2.5}
        angularDamping={4.0}
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_D / 2]} />
        <group>
          {/* Metallic Swivel Clip */}
          <mesh position={[0, CARD_H / 2 + 0.13, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.26, 20]} />
            <meshStandardMaterial color="#E4E4E7" metalness={1.0} roughness={0.04} />
          </mesh>
          <mesh position={[0, CARD_H / 2 + 0.28, 0]}>
            <torusGeometry args={[0.09, 0.028, 16, 32]} />
            <meshStandardMaterial color="#A1A1AA" metalness={0.95} roughness={0.08} />
          </mesh>

          {/* Card Body (dark base) */}
          <mesh
            castShadow
            receiveShadow
            onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
            onPointerUp={() => setIsDragging(false)}
            onPointerOut={() => setIsDragging(false)}
          >
            <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
            <meshStandardMaterial color="#0A0F1A" roughness={0.2} metalness={0.15} />
          </mesh>

          {/* Card Front Texture */}
          <mesh position={[0, 0, CARD_D / 2 + 0.001]}>
            <planeGeometry args={[CARD_W, CARD_H]} />
            <meshBasicMaterial map={cardTexture} />
          </mesh>

          {/* Acrylic Glass Shell */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[CARD_W + 0.03, CARD_H + 0.03, CARD_D + 0.015]} />
            <meshPhysicalMaterial
              transparent
              opacity={0.35}
              roughness={0.1}
              metalness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              color="#FFFFFF"
            />
          </mesh>

          {/* Subtle Edge Highlight */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[CARD_W + 0.055, CARD_H + 0.055, CARD_D + 0.005]} />
            <meshStandardMaterial
              color="#C0A860"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.12}
            />
          </mesh>
        </group>
      </RigidBody>
    </>
  );
}

// ─── Subtle Volumetric Dust Particles ─────────────────────────────────────────
function DustParticles({ count = 40 }) {
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
      ref.current.rotation.y += delta * 0.015;
      ref.current.position.y = Math.sin(Date.now() * 0.0003) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#E8A830"
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Main Exported Scene ──────────────────────────────────────────────────────
export function LanyardScene() {
  return (
    <div className="w-full h-[560px] lg:h-[700px] relative" style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0.8, 7], fov: 44 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        {/* Self-contained Studio Lighting (zero remote network dependencies) */}
        <ambientLight intensity={0.7} color="#F8FAFC" />
        <hemisphereLight intensity={0.5} color="#F59E0B" groundColor="#0F172A" />
        <directionalLight
          position={[5, 8, 5]}
          intensity={2.2}
          color="#FFF8EE"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-5, 3, -4]}
          intensity={0.8}
          color="#38BDF8"
        />
        <pointLight position={[-4, 4, 3]} intensity={1.2} color="#F59E0B" />
        <pointLight position={[4, -2, 3]} intensity={0.8} color="#7DD3FC" />
        <pointLight position={[0, -3, 2]} intensity={0.5} color="#FCD34D" />

        <Physics gravity={[0, -9.81, 0]} timeStep="vary">
          <InteractiveLanyard />
        </Physics>
        <DustParticles count={40} />
      </Canvas>

      {/* Drag hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] text-slate-400 font-mono pointer-events-none border border-white/5 bg-black/20 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        Drag to interact
      </div>
    </div>
  );
}
