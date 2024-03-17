import "./App.css";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { PCFSoftShadowMap, Vector3 } from "three";
import { Player } from "./components/Player";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Cubes } from "./components/Cubes";
import { GameContext } from "./hooks/GameContext";
import { ChunkGenerator } from "./components/ChunkGenerator";

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
      <Canvas
        className="canvas"
        ref={container}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: 50, frustumCulled: true, near: 0.1, far: 200 }}
      >
        <Cubes cubesPosition={cubes}></Cubes>

        <GameContext.Provider value={{ playerPosition: new Vector3() }}>
          <KeyboardControls
            map={[
              { keys: ["w", "ArrowUp"], name: "moveForward" },
              { keys: ["s", "ArrowDown"], name: "moveBackward" },
              { keys: ["a", "ArrowLeft"], name: "moveLeft" },
              { keys: ["d", "ArrowRight"], name: "moveRight" },
            ]}
          >
            <Player></Player>
            <ChunkGenerator></ChunkGenerator>
          </KeyboardControls>
        </GameContext.Provider>

        <ambientLight intensity={1} />

        <color args={["lightblue"]} attach={"background"}></color>
        <EffectComposer enableNormalPass>
          <Bloom mipmapBlur luminanceThreshold={0.4} />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </main>
  );
}

export default App;
