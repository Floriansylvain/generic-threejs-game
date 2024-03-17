import { useContext, useEffect, useState } from "react";
import { GameContext } from "../hooks/GameContext";
import { useFrame } from "@react-three/fiber";
import { Vector2 } from "three";
import { Chunk } from "./Chunk";

export function ChunkGenerator(): JSX.Element {
  const { playerPosition } = useContext(GameContext);
  const [lastPlayerPosition] = useState(new Vector2(0, 0));
  const [chunks, setChunks] = useState([] as JSX.Element[]);

  const chunkPosVec2 = new Vector2();

  const isChunkAlreadyGenerated = (x: number, y: number) =>
    chunks.some((chunk) => chunk.key === `${x}-${y}`);

  function generateNewChunks(playerX: number, playerY: number) {
    const newChunks = [];
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        if (isChunkAlreadyGenerated(playerX + x, playerY + y)) continue;
        newChunks.push(
          <Chunk
            key={`${playerX + x}-${playerY + y}`}
            position={chunkPosVec2
              .clone()
              .set((playerX + x) * 100, (playerY + y) * 100)}
            seed={0.25386}
          />
        );
      }
    }
    setChunks([...chunks, ...newChunks]);
  }

  useFrame(() => {
    const playerX = Math.floor(playerPosition.x / 100 + 0.5);
    const playerY = Math.floor(playerPosition.z / 100 + 0.5);

    if (lastPlayerPosition.x === playerX && lastPlayerPosition.y === playerY)
      return;

    generateNewChunks(playerX, playerY);

    lastPlayerPosition.set(playerX, playerY);
  });

  useEffect(() => {
    generateNewChunks(0, 0);
  }, []);

  return <>{chunks}</>;
}
