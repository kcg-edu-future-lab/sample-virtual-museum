import { createContext, Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Gltf, KeyboardControls } from "@react-three/drei";
import { Box3, Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { TypedStorageAdapter } from 'tlssa';
import { Madoi, type Profile } from 'madoi-client';
import { useOtherPeers } from 'madoi-client-react';
import { madoiKey, madoiUrl } from './keys';
import { AvatarObject } from './Avatar';
import './App.css'
import { Player } from './Player';
import { Chat } from './sidepanel/Chat';
import { MouseAndKeyboardPropagationBlocker } from './common/MouseAndKeyboardPropagationBlocker';
import { TabHeader } from './common/TabHeader';
import { Settings } from './sidepanel/Settings';
import type { vec3, vec4 } from './common/util';
import type { InfoObject } from './common/InfoObject';

export interface PeerProfile extends Profile{
  name?: string;
  position: vec3;
  orientation: vec4;
}
const lastPath = new URL(window.location.href).pathname.split("/").filter(Boolean).slice(-1)[0];
const roomId: string = `sample-museum-${lastPath}-sdsdffs24df2sdfsfjo4`;
const ls = new TypedStorageAdapter<{id: string, name: string}>(localStorage, `madoi.${roomId}`);
export const MadoiContext = createContext({
  madoi: new Madoi<PeerProfile>(
    `${madoiUrl}/${roomId}`, madoiKey, {
      id: ls.getOrCreateItem("id", ()=>uuidv4()),
      profile: {
        position: [-4, 1, 4], // 位置
        orientation: [0, 1, 0, 0]  // 向き
      },
    }
  )
});

function CollisonBoxes({
  infoObjects, selectedName, setInfoObjects
}: {
  infoObjects: InfoObject[];
  selectedName?: string;
  setInfoObjects: React.Dispatch<React.SetStateAction<InfoObject[]>>;
}) {
  const box = useMemo(() => new Box3(
    new Vector3(-0.25, -0.25, -0.25),
    new Vector3(0.25, 0.25, 0.25),
  ), []);

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
      setInfoObjects(current => current.map(object => object.name === selectedName ? {
        ...object,
        position: object.position.map((value, index) => value + move[index]) as vec3,
      } : object));
    };

    window.addEventListener('keydown', moveSelected, true);
    return () => window.removeEventListener('keydown', moveSelected, true);
  }, [selectedName]);

  return <>
    {infoObjects.map(object =>
      <group key={object.name} position={object.position} scale={object.scale}>
        <box3Helper args={[box, selectedName === object.name ? 0xffff00 : 0xff0000]} />
      </group>
    )}
  </>;
}

function Crosshair() {
  return <div className="crosshair" aria-hidden="true" />;
}

export default function App() {
  const madoi = useContext(MadoiContext).madoi;
  const otherPeers = useOtherPeers(madoi);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [infoObjects, setInfoObjects] = useState<InfoObject[]>([]);
  const [selectedInfoObjectName, setSelectedInfoObjectName] = useState<string>();

  useEffect(() => {
    fetch('./infoobjects.json')
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load infoobjects.json: ${response.status}`);
        return response.json() as Promise<{ infoObjects: InfoObject[] }>;
      })
      .then(data => setInfoObjects(data.infoObjects))
      .catch(error => console.error(error));
  }, []);

  const changeInfoObjects: React.Dispatch<React.SetStateAction<InfoObject[]>> = update => {
    setInfoObjects(current => {
      const objects = typeof update === 'function' ? update(current) : update;
      if (selectedInfoObjectName && !objects.some(object => object.name === selectedInfoObjectName)) {
      setSelectedInfoObjectName(undefined);
      }
      return objects;
    });
  };

  const onSelfPositionChanged = (position: vec3)=>{
    madoi.updateSelfPeerProfile("position", position);
  };
  const onSelfOrientationChanged = (orientation: vec4)=>{
    madoi.updateSelfPeerProfile("orientation", orientation);
  };

  return <div className="appLayout">
    <div className="canvasPane" tabIndex={0}>
      <KeyboardControls map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
      ]}>
        <Canvas
          style={{width: "100%", height: "640px"}}
          camera={{
            fov: 45, // 視野角
            position: [-4, 1, 4], // 位置
          }}
          onCreated={({ camera }) => camera.lookAt(0, 1, 0)}>
          <Player
            onPositionChanged={onSelfPositionChanged}
            onOrientationChanged={onSelfOrientationChanged}
          />
          {otherPeers.map(p =>
             <AvatarObject key={p.id} peer={p}/>
          )}
          <Suspense fallback={null}>
            <Gltf src='./Scaniverse 2026-05-11 131013.glb' />
          </Suspense>
          <CollisonBoxes
            infoObjects={infoObjects}
            selectedName={selectedInfoObjectName}
            setInfoObjects={setInfoObjects}
          />
          <ambientLight intensity={1} />
        </Canvas>
      </KeyboardControls>
      <Crosshair />
    </div>
    <MouseAndKeyboardPropagationBlocker>
      <aside className="sidePanel">
        <div className="tabList" role="tablist" aria-label="サイドパネル">
          <TabHeader
            id="chat-tab" tabName="chat"
            activeTab={activeTab} setActiveTab={setActiveTab}
          >Chat</TabHeader>
          <TabHeader
            id="settings-tab" tabName="settings"
            activeTab={activeTab} setActiveTab={setActiveTab}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15.06 4.6a1.7 1.7 0 0 0 1.88-.34L17 4.2 19.83 7l-.06.06A1.7 1.7 0 0 0 19.4 9c.22.62.8 1.03 1.45 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </TabHeader>
        </div>
        <div id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" hidden={activeTab !== 'chat'}>
          <Chat madoi={madoi} />
        </div>
        {activeTab === 'settings' && <Settings
          madoi={madoi}
          infoObjects={infoObjects}
          onInfoObjectsChange={changeInfoObjects}
          selectedInfoObjectName={selectedInfoObjectName}
          onInfoObjectSelect={setSelectedInfoObjectName}
        />}
      </aside>
    </MouseAndKeyboardPropagationBlocker>
  </div>;
}
