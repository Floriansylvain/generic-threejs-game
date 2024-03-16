import { useContext, useEffect, useState } from "react";
import { GameContext } from "../hooks/GameContext";
import { useFrame } from "@react-three/fiber";
import { Vector2 } from "three";
import { Chunk } from "./Chunk";

export function ChunkGenerator(): JSX.Element {
  const { playerPosition } = useContext(GameContext);
  const [chunks, setChunks] = useState([] as JSX.Element[]);

  const [lastPlayerPosition] = useState(new Vector2(0, 0));

  const chunkPosVec2 = new Vector2();

  function generateChunk(x: number, y: number) {
    setChunks([
      <Chunk
        key={`${x}-${y}`}
        position={chunkPosVec2.set(x * 100, y * 100)}
        seed={897624}
      />,
    ]);
  }

  useEffect(() => {
    generateChunk(0, 0);
  }, []);

  useFrame(() => {
    const playerX = Math.floor(playerPosition.x / 100 + 0.5);
    const playerY = Math.floor(playerPosition.z / 100 + 0.5);

    // generateChunk(playerX, playerY);
    // console.log("player", playerX, playerY);

    // // every time the player moves to a new chunk, generate 3x3 chunks around the player
    // for (let x = -1; x <= 1; x++) {
    //   for (let y = -1; y <= 1; y++) {
    //     generateChunk(playerX + x, playerY + y);
    //   }
    // }

    lastPlayerPosition.set(playerX, playerY);
  });

  return <>{chunks}</>;
}
