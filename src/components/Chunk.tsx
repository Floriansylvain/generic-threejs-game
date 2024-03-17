import { useEffect } from "react";
import {
  ClampToEdgeWrapping,
  FrontSide,
  RepeatWrapping,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { ImprovedNoise } from "three/examples/jsm/Addons.js";

const canvas = document.createElement("canvas", { is: "canvas" });

const grassTexture = new TextureLoader().load("./texture_grass.jpg");
grassTexture.wrapS = grassTexture.wrapT = RepeatWrapping;
grassTexture.repeat.set(100, 100);

const SCALE = 5;
const AMPLITUDE = 10;
const GEOMETRY = 50;

const SIZE = 100; // CHANGE WITH CAUTION
const OVERLAP = 0.5; // CHANGE WITH CAUTION
const CHUNK_SIZE = 100; // CHANGE WITH CAUTION

const ADJUSTED_GEOMETRY = GEOMETRY + OVERLAP * 2;
const ADJUSTED_SIZE = SIZE + OVERLAP * 2;
const ADJUSTED_SCALE = SIZE / SCALE;

export function Chunk(props: { position: Vector2; seed: number }): JSX.Element {
  const noise = (x: number, y: number): number => {
    const noise = new ImprovedNoise();
    return noise.noise(x, y, props.seed);
  };

  canvas.width = canvas.height = ADJUSTED_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas context not found");

  const offsetX = -OVERLAP + props.position.x;
  const offsetY = -OVERLAP + props.position.y;

  const imageData = context.getImageData(0, 0, ADJUSTED_SIZE, ADJUSTED_SIZE);
  const data = imageData.data;

  for (let x = 0; x < ADJUSTED_SIZE; x++) {
    for (let y = 0; y < ADJUSTED_SIZE; y++) {
      const n =
        noise((x + offsetX) / ADJUSTED_SCALE, (y + offsetY) / ADJUSTED_SCALE) *
          127 +
        127;
      const id = (x + y * ADJUSTED_SIZE) * 4;
      data[id] = n;
      data[id + 1] = n;
      data[id + 2] = n;
      data[id + 3] = 255;
    }
  }
  context.putImageData(imageData, 0, 0);
  const displacementMap = new TextureLoader().load(canvas.toDataURL());
  displacementMap.wrapS = displacementMap.wrapT = ClampToEdgeWrapping;

  useEffect(() => {
    return () => {
      displacementMap.dispose();
    };
  }, [displacementMap]);

  return (
    <group position={new Vector3(props.position.x, 0, props.position.y)}>
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <planeGeometry
          attach="geometry"
          args={[CHUNK_SIZE, CHUNK_SIZE, ADJUSTED_GEOMETRY, ADJUSTED_GEOMETRY]}
        ></planeGeometry>
        <meshStandardMaterial
          toneMapped={false}
          attach="material"
          map={grassTexture}
          displacementMap={displacementMap}
          displacementScale={AMPLITUDE}
          shadowSide={FrontSide}
        />
      </mesh>
    </group>
  );
}
