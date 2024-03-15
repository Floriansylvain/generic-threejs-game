import "./App.css";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { Player } from "./components/Player";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Cubes } from "./components/Cubes";

const CUBES_QT = 10;

function App() {
  const container = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    container.current?.focus();
  });

  const [cubes] = useState<Vector3[]>(
    Array.from({ length: CUBES_QT }, (_, i) =>
      Array.from(
        { length: CUBES_QT },
        (_, j) => new Vector3(i + 20 - CUBES_QT / 2, 0, j - CUBES_QT / 2)
      )
    ).flat()
  );

  return (
    <main
      className="container"
      onClick={() => container.current?.requestPointerLock()}
    >
      <Canvas className="canvas" ref={container} shadows camera={{ fov: 50 }}>
        <Cubes cubesPosition={cubes}></Cubes>

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
          castShadow
        >
          <planeGeometry attach={"geometry"} args={[50, 50]}></planeGeometry>
          <meshStandardMaterial
            toneMapped={false}
            color={"green"}
          ></meshStandardMaterial>
        </mesh>

        <KeyboardControls
          map={[
            { keys: ["w", "ArrowUp"], name: "moveForward" },
            { keys: ["s", "ArrowDown"], name: "moveBackward" },
            { keys: ["a", "ArrowLeft"], name: "moveLeft" },
            { keys: ["d", "ArrowRight"], name: "moveRight" },
            { keys: ["Space"], name: "jump" },
            { keys: ["ShiftLeft"], name: "sprint" },
          ]}
        >
          <Player></Player>
        </KeyboardControls>

        <ambientLight intensity={Math.PI / 2} />

        <color args={["lightblue"]} attach={"background"}></color>
        <fog attach={"fog"} args={["lightblue", 0, 100]}></fog>
        {/* <gridHelper args={[100, 100]}></gridHelper> */}
        {/* <axesHelper args={[100]}></axesHelper> */}
        <EffectComposer enableNormalPass>
          <Bloom mipmapBlur luminanceThreshold={0.4} />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </main>
  );
}

export default App;
