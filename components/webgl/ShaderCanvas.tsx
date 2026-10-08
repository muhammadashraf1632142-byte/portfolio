"use client";

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, Vector2, type ShaderMaterial } from "three";
import { fragmentShader, vertexShader } from "./shaders";
import { createFragmentGeometry } from "./fragmentGeometry";

export type ImageInteraction = {
  x: number; y: number;
  velocityX: number; velocityY: number;
  speed: number; time: number; hovering: boolean;
  progress: number;
};

type ShaderCanvasProps = {
  src: string;
  interaction: MutableRefObject<ImageInteraction>;
  onInvalidate: (invalidate: () => void) => void;
  onReady: () => void;
  onFailure: () => void;
};

function ImageFragments({ src, interaction, onReady, onFailure }: ShaderCanvasProps) {
  const material = useRef<ShaderMaterial>(null);
  const ready = useRef(false);
  const spring = useRef({ strength: 0, velocity: 0 });
  const slowFrames = useRef(0);
  const { viewport, invalidate } = useThree();
  const texture = useTexture(src, (loaded) => {
    if (!Array.isArray(loaded)) {
      loaded.colorSpace = SRGBColorSpace;
      loaded.needsUpdate = true;
    }
  });
  const aspect = viewport.width / viewport.height;
  const geometry = useMemo(() => createFragmentGeometry(aspect), [aspect]);
  const scratch = useRef({ mouse: new Vector2(), velocity: new Vector2() });
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uVelocity: { value: new Vector2(0, 0) },
    uScatterStrength: { value: 0 },
    uReturnStrength: { value: 1 },
    uProgress: { value: 0 },
    uAspect: { value: 1 },
    uTime: { value: 0 },
  }), [texture]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((frameState, frameDelta) => {
    const shader = material.current;
    if (!shader) return;
    const uniforms = shader.uniforms;
    const delta = Math.min(frameDelta, 0.035);
    const state = interaction.current;
    const age = performance.now() - state.time;
    const recent = state.hovering ? Math.exp(-age / 150) : 0;
    const target = recent * Math.min(1.65, 0.28 + state.speed / 25);
    spring.current.velocity += (target - spring.current.strength) * 120 * delta;
    spring.current.velocity *= Math.exp(-delta * 16);
    spring.current.strength += spring.current.velocity * delta;
    const strength = Math.max(0, spring.current.strength);
    uniforms.uMouse.value.lerp(scratch.current.mouse.set(state.x, state.y), 1 - Math.exp(-delta * 18));
    uniforms.uVelocity.value.lerp(
      scratch.current.velocity.set(state.velocityX / 32, -state.velocityY / 32).clampLength(0, 1.6),
      1 - Math.exp(-delta * 13),
    );
    uniforms.uScatterStrength.value = strength;
    uniforms.uProgress.value += (state.progress - uniforms.uProgress.value) * (1 - Math.exp(-delta * 12));
    uniforms.uAspect.value = aspect;
    uniforms.uTime.value += delta;
    if (!ready.current) { ready.current = true; onReady(); }
    const canvas = frameState.gl.domElement;
    canvas.dataset.scatterStrength = strength.toFixed(3);
    canvas.dataset.fragmentCount = String(geometry.getAttribute("position").count / 6);
    if (age < 600 && state.hovering || strength > 0.001 || Math.abs(spring.current.velocity) > 0.001 ||
      Math.abs(state.progress - uniforms.uProgress.value) > 0.001) invalidate();
    if (age < 600 && frameDelta > 0.12) slowFrames.current += 1;
    else slowFrames.current = Math.max(0, slowFrames.current - 1);
    if (slowFrames.current > 50) onFailure();
  });

  return (
    <mesh geometry={geometry} scale={[viewport.width, viewport.height, 1]} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        toneMapped={false}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  return null;
}

export default function ShaderCanvas(props: ShaderCanvasProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], zoom: 100 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      fallback={null}
      onCreated={({ invalidate }) => props.onInvalidate(invalidate)}
    >
      <ContextGuard onFailure={props.onFailure} />
      <Suspense fallback={null}><ImageFragments {...props} /></Suspense>
    </Canvas>
  );
}
