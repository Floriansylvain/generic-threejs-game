import "./App.css";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Vector2, Vector3 } from "three";
import { Cubes } from "./components/Cubes";
import { Player } from "./components/Player";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

function App() {
  const CUBES_QT = 10;

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
          castShadow
        >
          <planeGeometry attach={"geometry"} args={[100, 100]}></planeGeometry>
          <meshLambertMaterial color={"green"}></meshLambertMaterial>
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

        <color args={["lightblue"]} attach={"background"}></color>
        <fog attach={"fog"} args={["lightblue", 0, 100]}></fog>
        {/* <gridHelper args={[100, 100]}></gridHelper> */}
        {/* <axesHelper args={[100]}></axesHelper> */}
        <EffectComposer enableNormalPass>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={1.2}
            height={300}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
          {/* <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={30}
            rings={4}
            distanceThreshold={1.0}
            distanceFalloff={0.0}
            rangeThreshold={0.5}
            rangeFalloff={0.1}
            luminanceInfluence={0.9}
            radius={20}
            bias={0.5}
            worldDistanceFalloff={0.5}
            worldDistanceThreshold={0.5}
            worldProximityFalloff={0.5}
            worldProximityThreshold={0.5}
            intensity={30}
          ></SSAO> */}
          <ChromaticAberration
            modulationOffset={0.02}
            radialModulation={true}
            offset={new Vector2(0.002, 0.002)}
            blendFunction={BlendFunction.NORMAL}
          />

          {/* <SSR thickness={1} intensity={0.1}></SSR> */}
        </EffectComposer>
      </Canvas>
    </main>
  );
}

export default App;
