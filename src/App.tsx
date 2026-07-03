import { createContext, Suspense, useContext, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Gltf, KeyboardControls } from "@react-three/drei";
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

export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];
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

export default function App() {
  const madoi = useContext(MadoiContext).madoi;
  const otherPeers = useOtherPeers(madoi);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');

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
          onCreated={({ camera }) => {
            camera.lookAt(0, 1, 0);
        }}>
          <Player
            onPositionChanged={onSelfPositionChanged}
            onOrientationChanged={onSelfOrientationChanged} />
          {otherPeers.map(p =>{
            return <AvatarObject key={p.id} peer={p}/>;
          })}
          <Suspense fallback={null}>
            <Gltf src="./Scaniverse 2026-05-11 131013.glb" />
          </Suspense>
          <ambientLight intensity={1} />
        </Canvas>
      </KeyboardControls>
    </div>
    <MouseAndKeyboardPropagationBlocker>
      <aside className="sidePanel">
        <div className="tabList" role="tablist" aria-label="サイドパネル">
          <TabHeader
            id='chat-tab' tabName='chat'
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
        {activeTab === 'settings' && <Settings madoi={madoi} />}
    </aside>
    </MouseAndKeyboardPropagationBlocker>
  </div>;
}
