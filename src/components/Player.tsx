import { useAnimations, useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DirectionalLight,
  Euler,
  Mesh,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";

export interface KeyPressed {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  sprint: boolean;
}

const PLAYER_SPEED = 4.75;
const SHADOW_DRAW_DISTANCE = 30;

export function Player(props: {
  container: MutableRefObject<HTMLCanvasElement>;
}): JSX.Element {
  const model = useGLTF("/Adventurer.glb");
  const animations = useAnimations(model.animations, model.scene);

  // const walk = animations.actions["CharacterArmature|Walk"];
  const run = animations.actions["CharacterArmature|Run"];
  const idle = animations.actions["CharacterArmature|Idle"];

  const [, getKeys] = useKeyboardControls();
  const [isWalking, setIsWalking] = useState(false);

  const [pivotX, setPivotX] = useState(0);
  const [pivotY, setPivotY] = useState(0);
  const [player, setPlayer] = useState<Vector3>(new Vector3(0, 0, 0));
  const [mouseRef, setMouseRef] = useState(new Vector2());

  const lightRef = useRef<DirectionalLight>(null);

  const camera = useThree((state) => state.camera);

  const radius = 2;
  const yOffset = 1.5;

  useEffect(() => {
    idle?.play();
    model.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });

  useFrame((_, delta) => {
    const move = new Vector3();
    // TODO Replace getKeys with the subscription system
    if (getKeys().moveForward) move.z += 1;
    if (getKeys().moveBackward) move.z -= 1;
    if (getKeys().moveLeft) move.x += 1;
    if (getKeys().moveRight) move.x -= 1;

    move.applyEuler(new Euler(0, pivotX - degToRad(180), 0));
    move.multiplyScalar(PLAYER_SPEED * delta);

    camera.position.x = radius * Math.sin(pivotX) * Math.cos(pivotY) + player.x;
    camera.position.y = radius * Math.sin(pivotY) + player.y + yOffset;
    camera.position.z = radius * Math.cos(pivotX) * Math.cos(pivotY) + player.z;

    const adujstedPos = new Vector3().copy(model.scene.position);
    adujstedPos.y += yOffset;

    model.nodes?.Head.rotateX(pivotY - model.nodes?.Head.rotation.x);

    camera.lookAt(adujstedPos);

    if (Object.values(getKeys()).some((key) => key)) {
      setPlayer(player.clone().add(move));
      setIsWalking(true);

      const targetRotation = new Quaternion();
      targetRotation.setFromEuler(
        new Euler(
          0,
          pivotX + degToRad((Math.atan2(move.x, move.z) * 180) / Math.PI),
          0
        )
      );

      const cameraRotation = new Euler().setFromQuaternion(
        camera.quaternion,
        "YXZ"
      );
      targetRotation.multiplyQuaternions(
        targetRotation,
        new Quaternion().setFromEuler(new Euler(0, -cameraRotation.y, 0))
      );

      model.scene.quaternion.slerp(targetRotation, 0.2);
    } else {
      setIsWalking(false);
    }
  });

  const onMouseMove = useCallback((event: MouseEvent) => {
    setMouseRef(new Vector2(event.movementX, event.movementY));
  }, []);

  useEffect(() => {
    props.container.current?.addEventListener("mousemove", onMouseMove);
    return () => {
      props.container.current?.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove, props.container]);

  useEffect(() => {
    const MOUSE_X_SENSITIVITY = 0.005;
    const MOUSE_Y_SENSITIVITY = 0.003;
    setPivotX((pivotX) => pivotX - mouseRef.x * MOUSE_X_SENSITIVITY);
    setPivotY((pivotY) =>
      Math.min(Math.max(pivotY + mouseRef.y * MOUSE_Y_SENSITIVITY, -0.2), 1.2)
    );
  }, [mouseRef]);

  useEffect(() => {
    const ANIM_SPEED = 0.2;

    if (isWalking) {
      idle?.fadeOut(ANIM_SPEED);
      run?.reset().fadeIn(ANIM_SPEED).play();
    } else {
      run?.fadeOut(ANIM_SPEED);
      idle?.reset().fadeIn(ANIM_SPEED).play();
    }

    return () => {
      run?.fadeOut(ANIM_SPEED);
      idle?.fadeOut(ANIM_SPEED);
    };
  }, [isWalking, idle, run]);

  return (
    <>
      <primitive object={model.scene} position={player}></primitive>
      <directionalLight
        ref={lightRef}
        target={model.scene}
        castShadow
        position={[player.x + 100, 100, player.z + 100]}
        shadow-mapSize={[2048, 2048]}
        intensity={6}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[
            -SHADOW_DRAW_DISTANCE,
            SHADOW_DRAW_DISTANCE,
            SHADOW_DRAW_DISTANCE,
            -SHADOW_DRAW_DISTANCE,
          ]}
        />
      </directionalLight>
    </>
  );
}
