import {
  ClampToEdgeWrapping,
  FrontSide,
  RepeatWrapping,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { ImprovedNoise } from "three/examples/jsm/Addons.js";

export function Chunk(props: { position: Vector2; seed: number }): JSX.Element {
  const size = 100;
  const scale = 1.5;
  const amplitude = 30;
  const overlap = 0.5;
  const geometry = 50;
  const chunkSize = 100;

  const adjustedGeometry = geometry + overlap * 2;

  const noise = (x: number, y: number): number => {
    const noise = new ImprovedNoise();
    return noise.noise(x, y, props.seed);
  };

  const canvas = document.createElement("canvas");
  canvas.width = size + overlap * 2;
  canvas.height = size + overlap * 2;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas context not found");

  const offsetX = -overlap + props.position.x;
  const offsetY = -overlap + props.position.y;

  const imageData = context.getImageData(
    0,
    0,
    size + overlap * 2,
    size + overlap * 2
  );
  const data = imageData.data;

  for (let x = 0; x < size + overlap * 2; x++) {
    for (let y = 0; y < size + overlap * 2; y++) {
      const n =
        noise((x + offsetX) / (size / scale), (y + offsetY) / (size / scale)) *
          127 +
        127;
      const id = (x + y * (size + overlap * 2)) * 4;
      data[id] = n;
      data[id + 1] = n;
      data[id + 2] = n;
      data[id + 3] = 255;
    }
  }
  context.putImageData(imageData, 0, 0);
  const displacementMap = new TextureLoader().load(canvas.toDataURL());
  displacementMap.wrapS = displacementMap.wrapT = ClampToEdgeWrapping;

  const grassTexture = new TextureLoader().load("./texture_grass.jpg");
  grassTexture.wrapS = grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(100, 100);

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
          args={[chunkSize, chunkSize, adjustedGeometry, adjustedGeometry]}
        ></planeGeometry>
        <meshStandardMaterial
          toneMapped={false}
          attach="material"
          map={grassTexture}
          displacementMap={displacementMap}
          displacementScale={amplitude}
          shadowSide={FrontSide}
        />
      </mesh>
    </group>
  );
}
