import { useAnimations, useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { MutableRefObject, useEffect, useRef } from "react";
import {
  DirectionalLight,
  Euler,
  Mesh,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import { AnimationState } from "../models/Animations";

export interface KeyPressed {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  sprint: boolean;
}

const PLAYER_SPEED = 4.75 * 10;
const DRAW_DISTANCE = 128;
const SHADOW_RESOLUTION = 2048;
const MOUSE_X_SENSITIVITY = 0.002;
const MOUSE_Y_SENSITIVITY = 0.001;
const ANIM_SPEED = 0.2;
const CAMERA_RADIUS = 2;
const CAMERA_HEIGHT = 1.5;

const SHADOW_DRAW_DISTANCE = DRAW_DISTANCE * 1.2;

export function Player(): JSX.Element {
  const model = useGLTF("/Adventurer.glb");
  const anims = useAnimations(model.animations, model.scene);
  const [, getKeys] = useKeyboardControls();
  const camera = useThree((state) => state.camera);
  const dirLightRef: MutableRefObject<DirectionalLight | null> = useRef(null);

  const pivot = new Vector2();
  const moveVector = new Vector3();
  const moveEuler = new Euler();
  const targetRotation = new Quaternion();
  const targetRotationEuler = new Euler();
  const cameraRotationEuler = new Euler();
  const rotationQuaternion = new Quaternion();
  const rotationEuler = new Euler();
  const animsState: AnimationState[] = [
    { name: "CharacterArmature|Idle", isPlaying: true },
    { name: "CharacterArmature|Run", isPlaying: false },
    { name: "CharacterArmature|Run_Back", isPlaying: false },
  ];
  const lastAnimState = {} as AnimationState;

  const setAnimState = (name: string, isPlaying: boolean): void => {
    const anim = animsState.find((anim) => anim.name === name);
    if (!anim) return;
    anim.isPlaying = isPlaying;
  };

  const getAnimState = (name: string): AnimationState => {
    const anim = animsState.find((anim) => anim.name === name);
    if (!anim) return { name: "", isPlaying: false };
    return anim;
  };

  const onMouseMove = (mouseEvent: MouseEvent): void => {
    pivot.x = pivot.x - mouseEvent.movementX * MOUSE_X_SENSITIVITY;
    pivot.y = Math.min(
      Math.max(pivot.y + mouseEvent.movementY * MOUSE_Y_SENSITIVITY, -0.4),
      1.2
    );
  };

  const someKeyPressed = (): boolean =>
    Object.values(getKeys()).some((key) => key);

  function setMoveVector(delta: number): void {
    moveVector.set(0, 0, 0);

    const keys = getKeys();
    if (keys.moveLeft) moveVector.x += 1;
    if (keys.moveRight) moveVector.x -= 1;
    if (keys.moveForward) moveVector.z += 1;
    if (keys.moveBackward) moveVector.z -= 1;

    moveVector.applyEuler(moveEuler.set(0, pivot.x - Math.PI, 0));
    moveVector.multiplyScalar(PLAYER_SPEED * delta);
  }

  function setAnimationsState(): void {
    const keys = getKeys();
    const isMovingSideways = keys.moveLeft || keys.moveRight;
    const isMovingForward = keys.moveForward;
    const isMovingBackward = keys.moveBackward;
    const isIdle = !isMovingSideways && !isMovingForward && !isMovingBackward;
    if (isMovingForward || (isMovingSideways && !isMovingBackward)) {
      setAnimState("CharacterArmature|Idle", false);
      setAnimState("CharacterArmature|Run", true);
      setAnimState("CharacterArmature|Run_Back", false);
    } else if (isMovingBackward) {
      setAnimState("CharacterArmature|Idle", false);
      setAnimState("CharacterArmature|Run", false);
      setAnimState("CharacterArmature|Run_Back", true);
    } else if (isIdle) {
      setAnimState("CharacterArmature|Idle", true);
      setAnimState("CharacterArmature|Run", false);
      setAnimState("CharacterArmature|Run_Back", false);
    }
  }

  function setPlayerHeadRotationX(): void {
    model.nodes?.Head.rotateX(pivot.y);
  }

  function calculateTargetRotation(): void {
    targetRotationEuler.y = pivot.x + Math.atan2(moveVector.x, moveVector.z);
    targetRotation.setFromEuler(targetRotationEuler);
  }

  function calculateCameraRotation(): void {
    cameraRotationEuler.setFromQuaternion(camera.quaternion, "YXZ");
    rotationEuler.set(0, -cameraRotationEuler.y, 0);
  }

  function applyCameraRotationToTargetRotation(): void {
    rotationQuaternion.setFromEuler(rotationEuler);
    targetRotation.multiplyQuaternions(targetRotation, rotationQuaternion);
  }

  function rotateBackwards(): void {
    rotationEuler.set(0, Math.PI, 0);
    rotationQuaternion.setFromEuler(rotationEuler);
    targetRotation.multiplyQuaternions(targetRotation, rotationQuaternion);
  }

  function interpolatePlayerQuaternionToTargetRotation(): void {
    model.scene.quaternion.slerp(targetRotation, 0.2);
  }

  function setPlayerPosition(): void {
    model.scene.position.add(moveVector);
    calculateTargetRotation();
    calculateCameraRotation();
    applyCameraRotationToTargetRotation();
    if (getAnimState("CharacterArmature|Run_Back").isPlaying) {
      rotateBackwards();
    }
    interpolatePlayerQuaternionToTargetRotation();
  }

  function setCameraPosition(): void {
    const player = model.scene;
    camera.position.set(
      CAMERA_RADIUS * Math.sin(pivot.x) * Math.cos(pivot.y) + player.position.x,
      CAMERA_RADIUS * Math.sin(pivot.y) + player.position.y + CAMERA_HEIGHT,
      CAMERA_RADIUS * Math.cos(pivot.x) * Math.cos(pivot.y) + player.position.z
    );
    camera.lookAt(
      player.position.x,
      player.position.y + CAMERA_HEIGHT,
      player.position.z
    );
  }

  function setPlayerAnimations(): void {
    animsState.forEach((anim) => {
      if (lastAnimState.name !== anim.name && anim.isPlaying) {
        anims.actions[lastAnimState.name]?.fadeOut(ANIM_SPEED);
        anims.actions[anim.name]?.reset().fadeIn(ANIM_SPEED).play();
        lastAnimState.name = anim.name;
      }
    });
  }

  function setDirLightPosition(): void {
    dirLightRef.current?.position.set(
      model.scene.position.x + 100,
      70,
      model.scene.position.z + 100
    );
  }

  useFrame((_, delta) => {
    setMoveVector(delta);
    setAnimationsState();
    setPlayerHeadRotationX();
    if (someKeyPressed()) setPlayerPosition();
    setCameraPosition();
    setPlayerAnimations();
    setDirLightPosition();
  });

  useEffect(() => {
    model.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    model.scene.position.y = 10;
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  });

  return (
    <>
      <primitive
        object={model.scene}
        position={model.scene.position}
      ></primitive>
      <directionalLight
        ref={dirLightRef}
        target={model.scene}
        castShadow
        shadow-mapSize={[SHADOW_RESOLUTION, SHADOW_RESOLUTION]}
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
      <fog
        attach={"fog"}
        args={["lightblue", DRAW_DISTANCE * 0.8, DRAW_DISTANCE]}
      ></fog>
    </>
  );
}
