import { useState } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

export function Cubes(props: { cubesPosition: Vector3[] }) {
  const CUBE_SPEED = 10;
  const CUBE_AMPLITUDE = 2;
  const CUBE_HEIGHT = 4;

  const [cubes, setCubes] = useState<Vector3[]>(
    Array.from(props.cubesPosition)
  );

  useFrame((state) => {
    setCubes((cubes) => {
      return cubes.map((cube) => {
        return new Vector3(
          cube.x,
          Math.sin(cube.x + state.clock.elapsedTime * CUBE_SPEED) /
            CUBE_AMPLITUDE +
            Math.sin(cube.z + state.clock.elapsedTime * CUBE_SPEED) /
              CUBE_AMPLITUDE +
            CUBE_HEIGHT,
          cube.z
        );
      });
    });
  });

  return cubes.map((cube) => {
    if (!cube) return;
    return (
      <mesh
        position={cube}
        key={`${cube.x}-${cube.z}`}
        castShadow
        receiveShadow
      >
        <boxGeometry attach={"geometry"}></boxGeometry>
        <meshStandardMaterial
          attach={"material"}
          color={"hotpink"}
        ></meshStandardMaterial>
      </mesh>
    );
  });
}
