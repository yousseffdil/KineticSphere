import "./App.css";
import * as THREE from "three";
import { useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Outlines, Environment, useTexture } from "@react-three/drei";
import { Physics, useSphere } from "@react-three/cannon";
import { EffectComposer, SMAA } from "@react-three/postprocessing";
import { useControls } from "leva";

const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const baubleMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  roughness: 0,
  envMapIntensity: 1,
});

function App() {
  const [pointerSize, setPointerSize] = useState(2);

  const handleCanvasClick = () => {
    setPointerSize((prevSize) => prevSize + 0.5);
  };

  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
      onClick={handleCanvasClick}
    >
      <ambientLight intensity={0.5} />
      <color attach="background" />
      <spotLight
        intensity={10}
        angle={0.2}
        penumbra={1}
        position={[20, 20, 20]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight intensity={0.5} position={[0, 10, 0]} castShadow />
      <Physics gravity={[0, 2, 0]} iterations={10}>
        <Pointer key={pointerSize} pointerSize={pointerSize} />
        <MESH />
      </Physics>
      <Environment files="/public/src/hdri.hdr" />
      <EffectComposer disableNormalPass multisampling={0}>
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}

function MESH({
  mat = new THREE.Matrix4(),
  vec = new THREE.Vector3(),
  ...props
}) {
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)],
  }));
  const numbers = 10;
  useFrame((state) => {
    for (let i = 0; i < numbers; i++) {
      ref.current.getMatrixAt(i, mat);
      api
        .at(i)
        .applyForce(
          vec
            .setFromMatrixPosition(mat)
            .multiplyScalar(-10)
            .toArray(),
          [0, 0, 0]
        );
    }
  });
  const texture = useTexture("/public/src/texture.jpg");
  return (
    <instancedMesh ref={ref} castShadow receiveShadow args={[sphereGeometry, baubleMaterial, numbers]} material-map={texture}>
      <Outlines thickness={2} />
    </instancedMesh>
  );
}

function Pointer({ pointerSize }) {
  const viewport = useThree((state) => state.viewport);
  const [ref, api] = useSphere(() => ({
    type: "Kinematic",
    args: [pointerSize],
    position: [0, 0, 0],
  }));

  return useFrame((state) =>
    api.position.set(
      state.mouse.x * viewport.width,
      state.mouse.y * viewport.height,
      0
    )
  );
}

export default App;
