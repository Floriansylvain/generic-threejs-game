import "./App.css";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { PCFSoftShadowMap, Vector3 } from "three";
import { Player } from "./components/Player";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { GameContext } from "./hooks/GameContext";
import { ChunkGenerator } from "./components/ChunkGenerator";

function App() {
  const container = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    container.current?.focus();
  });

  return (
    <main
      className="container"
      onClick={() => container.current?.requestPointerLock()}
    >
      <Canvas
        className="canvas"
        ref={container}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: 50, frustumCulled: true, near: 0.1, far: 2000 }}
      >
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
