import "./App.css";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { Cubes } from "./components/Cubes";
import { Player } from "./components/Player";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

function App() {
  const CUBES_QT = 20;

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
      <Canvas className="canvas" ref={container} shadows>
        <Cubes cubesPosition={cubes}></Cubes>

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry attach={"geometry"} args={[100, 100]}></planeGeometry>
          <meshStandardMaterial
            attach={"material"}
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
          <Player
            container={
              container as unknown as MutableRefObject<HTMLCanvasElement>
            }
          ></Player>
        </KeyboardControls>

        <ambientLight intensity={Math.PI / 2} />
        <directionalLight
          castShadow
          position={[100, 100, 100]}
          shadow-mapSize={[4096, 4096]}
          intensity={5}
        >
          <orthographicCamera
            attach="shadow-camera"
            args={[-50, 50, 50, -50]}
          />
        </directionalLight>

        <color args={["lightblue"]} attach={"background"}></color>
        <fog attach={"fog"} args={["lightblue", 0, 100]}></fog>
        <gridHelper args={[100, 100]}></gridHelper>
        <axesHelper args={[100]}></axesHelper>
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.8}
            height={300}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </main>
  );
}

export default App;
