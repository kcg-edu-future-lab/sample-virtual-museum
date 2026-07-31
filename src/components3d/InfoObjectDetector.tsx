import { useMemo, useRef } from "react";
import { Box3, Ray, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import type { InfoObject, InfoObjectsModel } from "../models/InfoObjectsModel";

interface InfoObjectDetectorProps{
  infoObjects: InfoObjectsModel;
  onObjectDetected: (object: InfoObject | undefined) => void;
}
export function InfoObjectDetector({ infoObjects, onObjectDetected }: InfoObjectDetectorProps) {
  const lastObject = useRef<InfoObject | undefined>(undefined);
  const direction = useMemo(() => new Vector3(), []);
  const targetBox = useMemo(() => new Box3(), []);
  const intersection = useMemo(() => new Vector3(), []);
  const center = useMemo(() => new Vector3(), []);
  const size = useMemo(() => new Vector3(), []);
  const ray = useMemo(() => new Ray(), []);

  useFrame(({ camera }) => {
    camera.getWorldDirection(direction);
    let foundObject: InfoObject | undefined;
    let nearestDistance = 1;

    for (const object of infoObjects.getObjects()) {
      targetBox.setFromCenterAndSize(
        center.set(...object.position),
        size.set(...object.scale).multiplyScalar(0.5),
      );
      if (targetBox.containsPoint(camera.position)) {
        foundObject = object;
        nearestDistance = 0;
      } else {
        ray.set(camera.position, direction);
        if (ray.intersectBox(targetBox, intersection)) {
          const distance = camera.position.distanceTo(intersection);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            foundObject = object;
          }
        }
      }
    }

    if (foundObject !== lastObject.current) onObjectDetected(foundObject);
    lastObject.current = foundObject;
  });

  return null;
}
