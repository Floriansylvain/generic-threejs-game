import { RepeatWrapping, TextureLoader, Vector2, Vector3 } from "three";
import { ImprovedNoise } from "three/examples/jsm/Addons.js";

export function World(props: { position: Vector2; seed: number }): JSX.Element {
  const size = 100;
  const scale = 3;
  const amplitude = 30;

  const noise = (x: number, y: number): number => {
    const noise = new ImprovedNoise();
    return noise.noise(x, y, props.seed);
  };

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas context not found");
  const imageData = context.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const n =
        noise(
          (x + props.position.x) / (size / scale),
          (y + props.position.y) / (size / scale)
        ) *
          127 +
        127;
      const id = (x + y * size) * 4;
      data[id] = n;
      data[id + 1] = n;
      data[id + 2] = n;
      data[id + 3] = 255;
    }
  }
  context.putImageData(imageData, 0, 0);
  const displacementMap = new TextureLoader().load(canvas.toDataURL());
  displacementMap.wrapS = displacementMap.wrapT = RepeatWrapping;
  displacementMap.wrapT = displacementMap.wrapS = RepeatWrapping;

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
          args={[100, 100, 100, 100]}
        ></planeGeometry>
        <meshStandardMaterial
          wireframe
          toneMapped={false}
          attach="material"
          map={grassTexture}
          displacementMap={displacementMap}
          displacementScale={amplitude}
        />
      </mesh>
    </group>
  );
}
