import { useEffect, useMemo } from "react";
import { Box3, Vector3 } from "three";
import type { vec3 } from "../util";
import type { InfoObjectsModel } from "../models/InfoObjectsModel";

interface InfoObjectListProps{
  infoObjects: InfoObjectsModel;
  selectedName?: string;
}
export function InfoObjectList({infoObjects, selectedName}: InfoObjectListProps) {
  const box = useMemo(() => new Box3(
    new Vector3(-0.25, -0.25, -0.25),
    new Vector3(0.25, 0.25, 0.25),
  ), []);

  console.log("render InfoObjectList3d", infoObjects.getObjects())
  useEffect(() => {
    if (!selectedName) return;

    const moveSelected = (event: KeyboardEvent) => {
      const moves: Record<string, vec3> = {
        ArrowLeft: [-0.1, 0, 0],
        ArrowRight: [0.1, 0, 0],
        ArrowUp: [0, 0, -0.1],
        ArrowDown: [0, 0, 0.1],
        PageUp: [0, 0.1, 0],
        PageDown: [0, -0.1, 0],
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      event.stopPropagation();
      const obj = infoObjects.findObject(selectedName);
      const pos = obj?.position;
      if(pos){
        [0, 1, 2].forEach(i => pos[i] += move[i]);
        infoObjects.setObjectPosition(selectedName, pos);
      }
    };

    window.addEventListener('keydown', moveSelected, true);
    return () => window.removeEventListener('keydown', moveSelected, true);
  }, [selectedName]);

  return <>
    {infoObjects.getObjects().map(object =>
      <group key={object.name} position={object.position} scale={object.scale}>
        <box3Helper args={[box, object.selected ? 0xffff00 : 0xff0000]} />
      </group>
    )}
  </>;
}
