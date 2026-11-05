import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface KyokotanProps {
  position?: [number, number, number];
  scale?: number;
}

// 5角星(★)の3D Shapeを生成
function createStarShape(outerRadius: number, innerRadius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const spikes = 5;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  shape.moveTo(0, outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = Math.cos(rot) * outerRadius;
    let y = Math.sin(rot) * outerRadius;
    shape.lineTo(x, y);
    rot += step;

    x = Math.cos(rot) * innerRadius;
    y = Math.sin(rot) * innerRadius;
    shape.lineTo(x, y);
    rot += step;
  }
  shape.closePath();
  return shape;
}

// 電源マーク (⏻) ペンダントテクスチャ
function createPowerButtonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // ブローチ外枠 (紫/ピンク)
  ctx.fillStyle = '#2d1b36';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#d81b60';
  ctx.lineWidth = 14;
  ctx.stroke();

  // 電源アイコン (鮮やかなネオンエメラルドグリーン)
  ctx.strokeStyle = '#00ff66';
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';

  // 切れ目の入った円輪
  ctx.beginPath();
  ctx.arc(128, 128, 68, -Math.PI * 0.35, Math.PI * 1.35, false);
  ctx.stroke();

  // 上部の縦棒
  ctx.beginPath();
  ctx.moveTo(128, 48);
  ctx.lineTo(128, 124);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Kyokotan({ position = [-2.5, 0.1, 1.5], scale = 1.2 }: KyokotanProps) {
  const groupRef = useRef<Group>(null);
  const characterRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);

  const starShape = useMemo(() => createStarShape(0.045, 0.022), []);
  const powerTexture = useMemo(() => createPowerButtonTexture(), []);

  // フル3Dアニメーション (生き生きとした動作)
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (characterRef.current) {
      // ポーズ & 浮遊
      characterRef.current.position.y = Math.sin(t * 2) * 0.05 + 0.05;
      characterRef.current.rotation.y = Math.sin(t * 0.7) * 0.2;
    }
    if (headRef.current) {
      // 首を可愛く小首かしげ
      headRef.current.rotation.z = Math.sin(t * 1.3) * 0.04;
      headRef.current.rotation.x = Math.cos(t * 0.9) * 0.03;
    }
    if (leftArmRef.current && rightArmRef.current) {
      // 腕の自然な動き
      leftArmRef.current.rotation.z = 0.3 + Math.sin(t * 1.5) * 0.06;
      rightArmRef.current.rotation.z = -0.3 - Math.sin(t * 1.5) * 0.06;
    }
  });

  // 公式イラストに合わせた正確なカラーパレット
  const hairColor = '#a2a8b8';       // 薄グレー / シルバー
  const hairDarkColor = '#818796';   // 影部分のシャドウグレー
  const skinColor = '#fff2e5';       // 明るい肌色
  const eyeGreen = '#00a84f';        // 翡翠色 / エメラルドグリーン
  const eyeDarkGreen = '#005929';    // 目の深みグリーン
  const vestNavy = '#0d226b';        // 公式ネイビーブルー
  const skirtCream = '#fffde7';      // クリーム色 / オフホワイト
  const ribbonPink = '#e91e63';      // ピンク
  const hatNavy = '#0d226b';         // 帽子紺色
  const towerRed = '#e53935';        // 京都タワー赤

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 3Dアクリル風グラデーション台座 */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.6, 32]} />
        <meshBasicMaterial color="#00ff66" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.62, 0.68, 0.08, 32]} />
        <meshStandardMaterial color={vestNavy} roughness={0.2} metalness={0.1} />
      </mesh>

      {/* フル3Dキャラクター本体 */}
      <group ref={characterRef}>
        {/* ================= 頭部 ================= */}
        <group ref={headRef} position={[0, 0.54, 0]}>
          {/* 顔のベース (頭骨) */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial color={skinColor} roughness={0.3} />
          </mesh>

          {/* ほっぺ (ぷにっとした輪郭) */}
          <mesh position={[-0.18, -0.08, 0.22]} scale={[1.2, 0.9, 0.9]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial color={skinColor} roughness={0.3} />
          </mesh>
          <mesh position={[0.18, -0.08, 0.22]} scale={[1.2, 0.9, 0.9]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial color={skinColor} roughness={0.3} />
          </mesh>

          {/* ----- 髪の毛 (ロングヘア + パッツン前髪 + 姫カット) ----- */}
          {/* 後ろ髪 (背中に広がるロングヘア) */}
          <group position={[0, -0.12, -0.06]}>
            <mesh position={[0, -0.22, -0.02]}>
              <cylinderGeometry args={[0.37, 0.46, 0.65, 32, 1, true, -Math.PI * 0.8, Math.PI * 1.6]} />
              <meshStandardMaterial color={hairColor} side={THREE.DoubleSide} roughness={0.4} />
            </mesh>
            {/* 内側のシャドウ */}
            <mesh position={[0, -0.22, 0.01]} scale={[0.98, 1, 0.98]}>
              <cylinderGeometry args={[0.37, 0.46, 0.65, 32, 1, true, -Math.PI * 0.8, Math.PI * 1.6]} />
              <meshStandardMaterial color={hairDarkColor} side={THREE.BackSide} roughness={0.5} />
            </mesh>
          </group>

          {/* パッツン前髪 */}
          <group position={[0, 0.16, 0.2]}>
            {/* 中央の前髪 */}
            <mesh position={[0, -0.04, 0.11]} rotation={[0.18, 0, 0]}>
              <boxGeometry args={[0.42, 0.18, 0.1]} />
              <meshStandardMaterial color={hairColor} roughness={0.4} />
            </mesh>
            {/* 髪のふくらみ/立体カーブ */}
            <mesh position={[0, 0.02, 0.08]} rotation={[0.2, 0, 0]}>
              <cylinderGeometry args={[0.36, 0.36, 0.15, 24, 1, false, -Math.PI * 0.4, Math.PI * 0.8]} />
              <meshStandardMaterial color={hairColor} roughness={0.4} />
            </mesh>
          </group>

          {/* 姫カット (サイドのロング前髪) */}
          <mesh position={[-0.3, -0.02, 0.16]} rotation={[0.1, 0, 0.12]}>
            <boxGeometry args={[0.13, 0.42, 0.1]} />
            <meshStandardMaterial color={hairColor} roughness={0.4} />
          </mesh>
          <mesh position={[0.3, -0.02, 0.16]} rotation={[0.1, 0, -0.12]}>
            <boxGeometry args={[0.13, 0.42, 0.1]} />
            <meshStandardMaterial color={hairColor} roughness={0.4} />
          </mesh>

          {/* ----- カチューシャ & ミニシルクハット & 京都タワー ----- */}
          {/* 紺色カチューシャ */}
          <mesh position={[0, 0.24, 0.04]} rotation={[0.35, 0, 0]}>
            <torusGeometry args={[0.36, 0.028, 16, 32, Math.PI * 0.92]} />
            <meshStandardMaterial color={hatNavy} roughness={0.2} />
          </mesh>

          {/* ミニシルクハット (頭の左上/向かって右上) */}
          <group position={[0.24, 0.34, 0.08]} rotation={[-0.1, -0.2, -0.38]}>
            {/* つば */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.025, 32]} />
              <meshStandardMaterial color={hatNavy} roughness={0.2} />
            </mesh>
            {/* ハットの本体 */}
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.13, 0.15, 0.18, 32]} />
              <meshStandardMaterial color={hatNavy} roughness={0.2} />
            </mesh>
            {/* イエローのリボン */}
            <mesh position={[0, 0.035, 0]}>
              <cylinderGeometry args={[0.152, 0.152, 0.035, 32]} />
              <meshStandardMaterial color="#ffe082" roughness={0.3} />
            </mesh>

            {/* ミニ京都タワー (ハットの頂点) */}
            <group position={[0, 0.22, 0]}>
              {/* 白い土台 */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.045, 0.065, 0.04, 24]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              {/* 赤い展望台リング */}
              <mesh position={[0, 0.055, 0]}>
                <torusGeometry args={[0.05, 0.014, 16, 24]} />
                <meshStandardMaterial color={towerRed} roughness={0.2} />
              </mesh>
              {/* 白いタワー胴体 */}
              <mesh position={[0, 0.11, 0]}>
                <coneGeometry args={[0.04, 0.12, 24]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              {/* 赤いアンテナ先端 */}
              <mesh position={[0, 0.19, 0]}>
                <cylinderGeometry args={[0.01, 0.018, 0.07, 16]} />
                <meshStandardMaterial color={towerRed} roughness={0.2} />
              </mesh>
            </group>
          </group>

          {/* ----- 顔のパーツ (大きな緑の目 + 星★ + ほっぺ + 口) ----- */}
          {/* 左目 */}
          <group position={[-0.14, 0.01, 0.31]} rotation={[0, -0.15, 0]}>
            {/* 白目 / 背景 */}
            <mesh position={[0, 0, 0]}>
              <capsuleGeometry args={[0.065, 0.06, 16, 24]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
            {/* 緑の虹彩 */}
            <mesh position={[0, -0.005, 0.01]}>
              <capsuleGeometry args={[0.058, 0.05, 16, 24]} />
              <meshStandardMaterial color={eyeGreen} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.015, 0.012]}>
              <capsuleGeometry args={[0.056, 0.035, 16, 24]} />
              <meshStandardMaterial color={eyeDarkGreen} roughness={0.1} />
            </mesh>

            {/* ★ (立体星型パーツ) */}
            <mesh position={[0, 0.01, 0.022]} scale={[1, 1, 0.1]}>
              <shapeGeometry args={[starShape]} />
              <meshBasicMaterial color="#ffea00" />
            </mesh>

            {/* 白いキラキラハイライト */}
            <mesh position={[-0.025, 0.025, 0.024]}>
              <sphereGeometry args={[0.016, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>

          {/* 右目 */}
          <group position={[0.14, 0.01, 0.31]} rotation={[0, 0.15, 0]}>
            {/* 白目 / 背景 */}
            <mesh position={[0, 0, 0]}>
              <capsuleGeometry args={[0.065, 0.06, 16, 24]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
            {/* 緑の虹彩 */}
            <mesh position={[0, -0.005, 0.01]}>
              <capsuleGeometry args={[0.058, 0.05, 16, 24]} />
              <meshStandardMaterial color={eyeGreen} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.015, 0.012]}>
              <capsuleGeometry args={[0.056, 0.035, 16, 24]} />
              <meshStandardMaterial color={eyeDarkGreen} roughness={0.1} />
            </mesh>

            {/* ★ (立体星型パーツ) */}
            <mesh position={[0, 0.01, 0.022]} scale={[1, 1, 0.1]}>
              <shapeGeometry args={[starShape]} />
              <meshBasicMaterial color="#ffea00" />
            </mesh>

            {/* 白いキラキラハイライト */}
            <mesh position={[-0.025, 0.025, 0.024]}>
              <sphereGeometry args={[0.016, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>

          {/* アイライン (左) */}
          <mesh position={[-0.14, 0.09, 0.33]} rotation={[0, 0, 0.08]}>
            <boxGeometry args={[0.15, 0.022, 0.015]} />
            <meshStandardMaterial color="#1a1c24" />
          </mesh>
          {/* アイライン (右) */}
          <mesh position={[0.14, 0.09, 0.33]} rotation={[0, 0, -0.08]}>
            <boxGeometry args={[0.15, 0.022, 0.015]} />
            <meshStandardMaterial color="#1a1c24" />
          </mesh>

          {/* ほんのりピンクのチーク */}
          <mesh position={[-0.2, -0.07, 0.29]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#ff8a80" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0.2, -0.07, 0.29]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#ff8a80" transparent opacity={0.65} />
          </mesh>

          {/* ニッコリ口元 */}
          <mesh position={[0, -0.08, 0.34]} rotation={[Math.PI, 0, 0]}>
            <torusGeometry args={[0.035, 0.006, 8, 16, Math.PI]} />
            <meshBasicMaterial color="#4a2c2c" />
          </mesh>
        </group>

        {/* ================= 胴体・衣装 ================= */}
        <group position={[0, 0.14, 0]}>
          {/* 首 */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.08, 16]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>

          {/* ブラウス (クリーム色) */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.17, 0.21, 0.3, 24]} />
            <meshStandardMaterial color={skirtCream} roughness={0.3} />
          </mesh>

          {/* 紺ベスト (Vネック立体ベスト) */}
          <group position={[0, 0.04, 0]}>
            <mesh position={[0, 0, 0.01]} scale={[1.03, 0.92, 1.05]}>
              <cylinderGeometry args={[0.17, 0.22, 0.27, 24, 1, false, -Math.PI * 0.42, Math.PI * 0.84]} />
              <meshStandardMaterial color={vestNavy} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0, 0.01]} scale={[1.03, 0.92, 1.05]}>
              <cylinderGeometry args={[0.17, 0.22, 0.27, 24, 1, false, Math.PI * 0.58, Math.PI * 0.84]} />
              <meshStandardMaterial color={vestNavy} roughness={0.25} />
            </mesh>
          </group>

          {/* 胸元ピンクリボン + 電源マーク (⏻) ペンダント */}
          <group position={[0, 0.17, 0.19]}>
            {/* ピンクのリボン結び目 */}
            <mesh position={[-0.075, 0, 0]} rotation={[0, 0, 0.35]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color={ribbonPink} />
            </mesh>
            <mesh position={[0.075, 0, 0]} rotation={[0, 0, -0.35]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color={ribbonPink} />
            </mesh>
            {/* 電源マークブローチ (ネオンエメラルド) */}
            <mesh position={[0, -0.01, 0.035]}>
              <planeGeometry args={[0.09, 0.09]} />
              <meshBasicMaterial map={powerTexture} transparent depthWrite={false} />
            </mesh>
          </group>

          {/* フレアスカート */}
          <group position={[0, -0.13, 0]}>
            {/* スカート本体 (クリーム色) */}
            <mesh>
              <cylinderGeometry args={[0.21, 0.37, 0.23, 32]} />
              <meshStandardMaterial color={skirtCream} roughness={0.3} />
            </mesh>
            {/* 裾の紺色ライン */}
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.34, 0.36, 0.035, 32]} />
              <meshStandardMaterial color={vestNavy} roughness={0.25} />
            </mesh>
            {/* フリル (ダークグレー) */}
            <mesh position={[0, -0.115, 0]}>
              <cylinderGeometry args={[0.36, 0.38, 0.025, 32]} />
              <meshStandardMaterial color="#5c6270" roughness={0.5} />
            </mesh>
          </group>

          {/* 腕 (パフスリーブブラウス + 手) */}
          <group ref={leftArmRef} position={[-0.23, 0.08, 0.02]}>
            <mesh position={[0, -0.08, 0]}>
              <capsuleGeometry args={[0.06, 0.18, 12, 16]} />
              <meshStandardMaterial color={skirtCream} roughness={0.3} />
            </mesh>
            {/* 肌色の手 */}
            <mesh position={[0, -0.2, 0.02]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
          </group>

          <group ref={rightArmRef} position={[0.23, 0.08, 0.02]}>
            <mesh position={[0, -0.08, 0]}>
              <capsuleGeometry args={[0.06, 0.18, 12, 16]} />
              <meshStandardMaterial color={skirtCream} roughness={0.3} />
            </mesh>
            {/* 肌色の手 */}
            <mesh position={[0, -0.2, 0.02]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
          </group>

          {/* 脚 & ニーハイブーツ */}
          <group position={[-0.11, -0.3, 0]}>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.06, 0.048, 0.3, 20]} />
              <meshStandardMaterial color="#141a29" roughness={0.3} />
            </mesh>
          </group>

          <group position={[0.11, -0.3, 0]}>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.06, 0.048, 0.3, 20]} />
              <meshStandardMaterial color="#141a29" roughness={0.3} />
            </mesh>
            {/* 右脚のホワイトライン */}
            <mesh position={[0, 0.025, 0]}>
              <cylinderGeometry args={[0.062, 0.062, 0.02, 20]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.015, 0]}>
              <cylinderGeometry args={[0.061, 0.061, 0.015, 20]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* 3D空間内の公式風ネームタグ */}
        <Html position={[0, 1.15, 0]} center distanceFactor={8}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0b1d52 0%, #1e3c72 100%)',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 15px rgba(11, 29, 82, 0.5)',
              border: '2px solid #ffee58',
              userSelect: 'none',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: '#ffee58' }}>★</span> きょcoたん <span style={{ fontSize: '11px', color: '#ff8a80' }}>[3D Model]</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

const C = {
  outline: "#281d3a",
  hair: "#96929f",
  hairDark: "#676275",
  skin: "#ffe4bd",
  blue: "#073c83",
  blue2: "#173680",
  green: "#008936",
  lime: "#79c500",
  cream: "#ffffd8",
  pink: "#d967a0",
  sock: "#3f3d57",
};

function Sphere({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Eye({ x }: { x: number }) {
  return (
    <group position={[x, 1.65, 1.0]}>
      {/* eye socket */}
      <Sphere
        position={[0, 0, 0]}
        scale={[0.38, 0.58, 0.14]}
        color={C.outline}
      />

      {/* green iris */}
      <Sphere
        position={[0, 0, 0.13]}
        scale={[0.27, 0.45, 0.11]}
        color={C.green}
      />

      {/* highlight */}
      <Sphere
        position={[-0.075, 0.12, 0.24]}
        scale={[0.065, 0.1, 0.035]}
        color="white"
      />

      {/* yellow-green star-like accent */}
      <Sphere
        position={[0.1, 0.2, 0.23]}
        scale={[0.07, 0.07, 0.03]}
        color={C.lime}
      />
    </group>
  );
}

function Hair() {
  return (
    <group>
      {/* large rear hair */}
      <Sphere
        position={[0, 1.55, -0.42]}
        scale={[1.75, 2.25, 0.72]}
        color={C.hairDark}
      />

      {/* upper hair */}
      <Sphere
        position={[0, 2.25, 0]}
        scale={[1.57, 1.48, 1.0]}
        color={C.hair}
      />

      {/* side locks */}
      <Sphere
        position={[-1.31, 1.25, 0.05]}
        scale={[0.43, 1.48, 0.43]}
        color={C.hair}
      />

      <Sphere
        position={[1.31, 1.25, 0.05]}
        scale={[0.43, 1.48, 0.43]}
        color={C.hair}
      />

      {/* bangs */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <Sphere
          key={x}
          position={[x, 2.05 - Math.abs(x) * 0.1, 0.78]}
          scale={[
            i === 2 ? 0.38 : 0.32,
            i === 2 ? 0.78 : 0.68,
            0.25,
          ]}
          color={C.hair}
        />
      ))}
    </group>
  );
}

function Hat() {
  return (
    <group
      position={[0.98, 3.25, 0.22]}
      rotation={[0, 0, -0.22]}
    >
      {/* brim */}
      <mesh scale={[0.72, 0.14, 0.55]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color={C.blue2} />
      </mesh>

      {/* hat body */}
      <mesh position={[0, 0.3, 0]} scale={[0.52, 0.58, 0.48]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={C.blue2} />
      </mesh>

      {/* white ornament */}
      <mesh
        position={[0.25, 0.72, 0]}
        rotation={[0, 0, -0.55]}
      >
        <cylinderGeometry args={[0.1, 0.16, 0.7, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <Sphere
        position={[0.45, 1.02, 0]}
        scale={[0.16, 0.16, 0.16]}
        color="#e63e32"
      />

      {/* bow */}
      <Sphere
        position={[-0.2, -0.02, 0.48]}
        scale={[0.3, 0.15, 0.08]}
        color="#ffd989"
      />
      <Sphere
        position={[0.2, -0.02, 0.48]}
        scale={[0.3, 0.15, 0.08]}
        color="#ffd989"
      />
    </group>
  );
}

function Arm({ side }: { side: number }) {
  return (
    <group
      position={[side * 0.92, -0.05, 0]}
      rotation={[0, 0, side * -0.28]}
    >
      {/* sleeve */}
      <mesh position={[0, 0, 0]} scale={[0.36, 0.85, 0.36]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={C.cream} />
      </mesh>

      {/* hand */}
      <Sphere
        position={[0, -0.74, 0]}
        scale={[0.22, 0.25, 0.22]}
        color={C.skin}
      />
    </group>
  );
}

function Leg({ side }: { side: number }) {
  return (
    <group position={[side * 0.42, -1.75, 0]}>
      {/* upper / sock */}
      <mesh
        position={[0, -0.3, 0]}
        rotation={[0, 0, side * 0.09]}
      >
        <cylinderGeometry args={[0.25, 0.28, 0.8, 24]} />
        <meshStandardMaterial color={C.blue} />
      </mesh>

      {/* boot */}
      <mesh
        position={[side * 0.04, -0.93, 0.05]}
        rotation={[0, 0, side * 0.09]}
        scale={[0.38, 0.75, 0.43]}
      >
        <sphereGeometry args={[1, 24, 20]} />
        <meshStandardMaterial color={C.sock} />
      </mesh>
    </group>
  );
}

function PowerButton() {
  return (
    <group position={[0, -0.08, 0.73]}>
      <mesh>
        <torusGeometry args={[0.24, 0.055, 16, 32]} />
        <meshStandardMaterial color={C.lime} />
      </mesh>

      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.055, 0.28, 0.055]} />
        <meshStandardMaterial color={C.lime} />
      </mesh>
    </group>
  );
}

export function Kyokotan2({ position = [-2.5, 0.1, 1.5], scale = 1.2 }: KyokotanProps) {
  return (<group position={position} scale={scale}>
    <group position={[0, -0.5, 0]}>
      {/* hair behind face */}
      <Hair />

      {/* face */}
      <Sphere
        position={[0, 1.55, 0.38]}
        scale={[1.22, 1.16, 0.83]}
        color={C.skin}
      />

      <Eye x={-0.52} />
      <Eye x={0.52} />

      {/* cheeks */}
      <Sphere
        position={[-0.76, 1.18, 1.04]}
        scale={[0.18, 0.1, 0.04]}
        color="#f4a7aa"
      />
      <Sphere
        position={[0.76, 1.18, 1.04]}
        scale={[0.18, 0.1, 0.04]}
        color="#f4a7aa"
      />

      {/* mouth */}
      <mesh
        position={[0, 0.92, 1.08]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[0.25, 0.025, 8, 32, Math.PI]}
        />
        <meshStandardMaterial color={C.outline} />
      </mesh>

      {/* neck */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.35, 24]} />
        <meshStandardMaterial color={C.skin} />
      </mesh>

      {/* body */}
      <mesh position={[0, -0.28, 0]} scale={[0.72, 0.95, 0.45]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={C.blue} />
      </mesh>

      {/* shirt / skirt */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.58, 1.03, 0.85, 32]} />
        <meshStandardMaterial color={C.cream} />
      </mesh>

      {/* skirt border */}
      <mesh position={[0, -1.34, 0]}>
        <torusGeometry args={[0.89, 0.09, 12, 32]} />
        <meshStandardMaterial color={C.blue} />
      </mesh>

      <Arm side={-1} />
      <Arm side={1} />

      <Leg side={-1} />
      <Leg side={1} />

      {/* chest flower */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <Sphere
            key={i}
            position={[
              Math.cos(a) * 0.27,
              0.06 + Math.sin(a) * 0.22,
              0.65,
            ]}
            scale={[0.19, 0.14, 0.08]}
            color={C.pink}
          />
        );
      })}

      {/* power symbol */}
      <PowerButton />

      <Hat />
    </group>
  </group>
  );
}
/*
export function App2() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 1, 9], fov: 38 }}
        shadows
      >
        <color attach="background" args={["#e7edf3"]} />

        <ambientLight intensity={1.8} />
        <directionalLight
          position={[4, 7, 6]}
          intensity={3}
          castShadow
        />
        <directionalLight
          position={[-4, 2, 4]}
          intensity={1.5}
        />
        <pointLight position={[0, -2, 4]} intensity={1} />

        <Character />

        <OrbitControls
          target={[0, 0.5, 0]}
          enablePan={false}
          minDistance={6}
          maxDistance={13}
        />
      </Canvas>
    </div>
  );
}
*/