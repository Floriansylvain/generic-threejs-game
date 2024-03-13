import "./App.css";

import { Canvas } from "@react-three/fiber";
import {
  KeyboardControls,
  Sparkles,
  Text,
  TransformControls,
} from "@react-three/drei";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { Cubes } from "./components/Cubes";
import { Player } from "./components/Player";

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
      <Canvas className="canvas" ref={container}>
        <Cubes cubesPosition={cubes}></Cubes>
        <TransformControls position={[20, 10, 0]}>
          <Text
            color={"green"}
            fontSize={8}
            anchorX={"center"}
            anchorY={"middle"}
          >
            Bonsoir
          </Text>
        </TransformControls>
        <group>
          <Sparkles
            color={"blue"}
            count={100}
            size={20}
            scale={[20, 10, 20]}
            speed={25}
            position={[20, 0, 20]}
          ></Sparkles>
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry attach={"geometry"} args={[100, 100]}></planeGeometry>
          <meshStandardMaterial
            attach={"material"}
            color={"lightblue"}
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
          intensity={Math.PI / 2}
          position={[2, 2, 2]}
        ></directionalLight>
      </Canvas>
    </main>
  );
}

export default App;
