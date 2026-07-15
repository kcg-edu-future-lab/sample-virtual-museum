import type { vec3 } from "./util";

export interface CollisionObject {
  name: string;
  position: vec3;
  scale: vec3;
}
