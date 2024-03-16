import { createContext } from "react";
import { Vector3 } from "three";

export const GameContext = createContext({
  playerPosition: new Vector3(),
});
