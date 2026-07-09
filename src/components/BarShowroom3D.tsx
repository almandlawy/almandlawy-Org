/**
 * Lazy-loaded R3F bullion bar showcase — procedural geometry until GLB assets ship.
 */

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import { Product } from "../types";
import { getBarDimensions, getBarMaterial, getBarMetal } from "../lib/barModel";

interface BarShowroom3DProps {
  product: Product;
  className?: string;
}

function BullionBarMesh({ product }: { product: Product }) {
  const groupRef = useRef<Group>(null);
  const dims = getBarDimensions(product);
  const metal = getBarMetal(product);
  const mat = getBarMaterial(metal);
  const [w, h, d] = dims;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.22;
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[w, h, d]} radius={0.03} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial
          color={mat.color}
          metalness={mat.metalness}
          roughness={mat.roughness}
          emissive={mat.emissive}
          emissiveIntensity={mat.emissiveIntensity}
        />
      </RoundedBox>
      <RoundedBox
        position={[0, h / 2 + 0.008, 0]}
        args={[w * 0.55, 0.012, d * 0.22]}
        radius={0.004}
        smoothness={2}
      >
        <meshStandardMaterial
          color={metal === "gold" ? "#8E651E" : "#6A6A6A"}
          metalness={0.85}
          roughness={0.35}
        />
      </RoundedBox>
    </group>
  );
}

function Scene({ product }: { product: Product }) {
  const dims = getBarDimensions(product);
  const groundY = -dims[1] / 2 - 0.02;

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <spotLight position={[-3, 5, 2]} intensity={0.35} angle={0.4} penumbra={1} />
      <BullionBarMesh product={product} />
      <ContactShadows
        position={[0, groundY, 0]}
        opacity={0.4}
        scale={6}
        blur={2.2}
        far={4}
      />
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2.1}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
      />
    </>
  );
}

export default function BarShowroom3D({ product, className = "" }: BarShowroom3DProps) {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.55, 2.6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene product={product} />
      </Canvas>
    </div>
  );
}
