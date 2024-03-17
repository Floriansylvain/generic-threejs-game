import { useContext, useRef, useState } from "react";
import { GameContext } from "../hooks/GameContext";
import { useFrame } from "@react-three/fiber";
import { Vector2 } from "three";
import { Chunk } from "./Chunk";

const CHUNK_RADIUS = 20;
const CHUNK_PER_FRAME = 3;

export function ChunkGenerator(): JSX.Element {
  const { playerPosition } = useContext(GameContext);
  const [lastPlayerPosition] = useState(new Vector2());

  const [chunks, setChunks] = useState([] as JSX.Element[]);
  const [chunkQueue, setChunkQueue] = useState([] as JSX.Element[]);
  const generatedChunkKeys = useRef(new Set<string>());

  const chunkPosVec2 = new Vector2();

  const getChunkCoordinates = (x: number, y: number): number[] => {
    return [Math.floor(x / 100 + 0.5), Math.floor(y / 100 + 0.5)];
  };

  const isChunkAlreadyGenerated = (x: number, y: number, key: string) =>
    generatedChunkKeys.current.has(`${x}-${y}`) ||
    chunkQueue.some((chunk) => chunk.key === key);

  const isChunkInPlayerRadius = (chunkPos: number[], playerPos: number[]) =>
    chunkPos[0] < playerPos[0] - CHUNK_RADIUS ||
    chunkPos[0] > playerPos[0] + CHUNK_RADIUS ||
    chunkPos[1] < playerPos[1] - CHUNK_RADIUS ||
    chunkPos[1] > playerPos[1] + CHUNK_RADIUS;

  function generateNewChunks(playerX: number, playerY: number): void {
    const newChunks = [] as JSX.Element[];
    for (let x = -CHUNK_RADIUS; x <= CHUNK_RADIUS; x++) {
      for (let y = -CHUNK_RADIUS; y <= CHUNK_RADIUS; y++) {
        const key = `${playerX + x}-${playerY + y}`;
        if (isChunkAlreadyGenerated(playerX + x, playerY + y, key)) continue;
        newChunks.push(
          <Chunk
            key={key}
            position={chunkPosVec2
              .clone()
              .set((playerX + x) * 100, (playerY + y) * 100)}
            seed={0.25386}
          />
        );
        generatedChunkKeys.current.add(key);
      }
    }
    setChunkQueue((prevQueue) => [...prevQueue, ...newChunks]);
  }

  function getFilteredChunks(prevChunks: JSX.Element[], playerPos: number[]) {
    const filteredPrevChunks = [] as JSX.Element[];

    let qtDeleted = 0;
    prevChunks.forEach((chunk) => {
      const chunkPos = getChunkCoordinates(
        chunk.props.position.x,
        chunk.props.position.y
      );

      if (
        qtDeleted < CHUNK_PER_FRAME &&
        isChunkInPlayerRadius(chunkPos, playerPos)
      ) {
        generatedChunkKeys.current.delete(`${chunkPos[0]}-${chunkPos[1]}`);
        qtDeleted++;
      } else {
        filteredPrevChunks.push(chunk);
      }
    });
    return filteredPrevChunks;
  }

  function setNewChunks(queuedChunks: JSX.Element[], playerPos: number[]) {
    setChunks((prevChunks) => {
      const newChunks = queuedChunks
        .splice(-CHUNK_PER_FRAME)
        .filter(
          (chunk) =>
            !prevChunks.some((prevChunk) => prevChunk.key === chunk.key)
        );
      const filteredPrevChunks = getFilteredChunks(prevChunks, playerPos);
      return [...filteredPrevChunks, ...newChunks];
    });
  }

  useFrame(() => {
    const playerPos = getChunkCoordinates(playerPosition.x, playerPosition.z);

    if (chunkQueue.length > 0) {
      setChunkQueue((prevQueue) => {
        setNewChunks(prevQueue, playerPos);
        return prevQueue;
      });
    }

    if (
      lastPlayerPosition.x !== playerPos[0] ||
      lastPlayerPosition.y !== playerPos[1]
    ) {
      generateNewChunks(playerPos[0], playerPos[1]);
      lastPlayerPosition.set(playerPos[0], playerPos[1]);
    }
  });

  return <>{chunks}</>;
}
