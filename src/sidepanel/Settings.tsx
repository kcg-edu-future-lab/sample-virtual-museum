import { useRef, type ChangeEvent, type SubmitEvent } from "react";
import type { Madoi } from "madoi-client";
import type { PeerProfile } from "../App";
import './Settings.css';
import type { vec3 } from "../common/util";
import type { CollisionObject } from "../common/CollisionObject";

const isVec3 = (value: unknown): value is vec3 =>
  Array.isArray(value) && value.length === 3 && value.every(item => typeof item === 'number');

interface SettingsProps {
  madoi: Madoi<PeerProfile>;
  collisionObjects: CollisionObject[];
  onCollisionObjectsChange: React.Dispatch<React.SetStateAction<CollisionObject[]>>;
  selectedCollisionObjectName?: string;
  onCollisionObjectSelect: (name: string | undefined) => void;
}

export function Settings({
  collisionObjects, onCollisionObjectsChange,
  selectedCollisionObjectName, onCollisionObjectSelect
}: SettingsProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const downloadSettings = () => {
    const data = JSON.stringify({collisionObjects}, null, 2);
    const url = URL.createObjectURL(new Blob([data], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'museum-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadSettings = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    try {
      const settings = JSON.parse(await file.text()) as {collisionObjects?: unknown};
      if (!Array.isArray(settings.collisionObjects)
        || !settings.collisionObjects.every(object => object && typeof object === 'object'
          && typeof (object as CollisionObject).name === 'string'
          && isVec3((object as CollisionObject).position)
          && isVec3((object as CollisionObject).scale))) {
        throw new Error('Invalid settings file');
      }
      onCollisionObjectsChange(settings.collisionObjects as CollisionObject[]);
      onCollisionObjectSelect(undefined);
    } catch {
      window.alert('設定ファイルを読み込めませんでした。');
    }
  };

  const addCollisionObject = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get('objectName') ?? '').trim();
    if (!name || collisionObjects.some(object => object.name === name)) return;
    onCollisionObjectsChange([...collisionObjects, {name, position: [-2, 1, 2], scale: [1, 1, 1]}]);
    form.reset();
  };

  const removeCollisionObject = (name: string) => {
    onCollisionObjectsChange(collisionObjects.filter(object => object.name !== name));
  };

  const updateSelectedVector = (
    property: 'position' | 'scale',
    axis: number,
    amount: number,
    minimum?: number,
  ) => {
    if (!selectedCollisionObjectName) return;
    onCollisionObjectsChange(current => current.map(object => {
      if (object.name !== selectedCollisionObjectName) return object;
      const next = [...object[property]] as vec3;
      next[axis] = Math.max(minimum ?? -Infinity, Number((next[axis] + amount).toFixed(1)));
      return {...object, [property]: next};
    }));
  };

  return <div className="settingsPanel" role="tabpanel" id="settings-panel" aria-labelledby="settings-tab">
    <h2>設定</h2>
    <section className="collisionObjects">
      <div className="collisionObjectsHeader">
        <h3>当たり判定オブジェクト</h3>
        <div className="settingsFileActions">
          <button type="button" aria-label="設定をダウンロード" title="設定をダウンロード" onClick={downloadSettings}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
            </svg>
          </button>
          <button type="button" aria-label="設定をアップロード" title="設定をアップロード" onClick={() => uploadInputRef.current?.click()}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15V3m0 0 5 5m-5-5L7 8M5 21h14" />
            </svg>
          </button>
          <input
            ref={uploadInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={uploadSettings}
          />
        </div>
      </div>
      <form onSubmit={addCollisionObject}>
        <label htmlFor="collision-object-name">オブジェクト名</label>
        <div className="collisionObjectInput">
          <input id="collision-object-name" name="objectName" required />
          <button type="submit">追加</button>
        </div>
      </form>
      {collisionObjects.length === 0 ? (
        <p className="emptyCollisionObjects">登録されていません</p>
      ) : (
        <ul className="collisionObjectList">
          {collisionObjects.map(({name}) => <li key={name}>
            <button
              type="button"
              className="collisionObjectSelect"
              aria-pressed={selectedCollisionObjectName === name}
              onClick={() => onCollisionObjectSelect(
                selectedCollisionObjectName === name ? undefined : name
              )}
            >{name}</button>
            <button className="collisionObjectRemove" type="button" onClick={() => removeCollisionObject(name)} aria-label={`${name}を削除`}>
              削除
            </button>
          </li>)}
        </ul>
      )}
      <div className="collisionObjectControls">
        <fieldset disabled={!selectedCollisionObjectName}>
          <legend>移動</legend>
          <div className="controlButtons moveButtons">
            <button className="moveUp" type="button" aria-label="上" title="上" onClick={() => updateSelectedVector('position', 1, 0.1)}>↑</button>
            <button className="moveDown" type="button" aria-label="下" title="下" onClick={() => updateSelectedVector('position', 1, -0.1)}>↓</button>
            <button className="moveLeft" type="button" aria-label="左" title="左" onClick={() => updateSelectedVector('position', 0, -0.1)}>←</button>
            <button className="moveRight" type="button" aria-label="右" title="右" onClick={() => updateSelectedVector('position', 0, 0.1)}>→</button>
            <button className="moveFront" type="button" onClick={() => updateSelectedVector('position', 2, -0.1)}>前</button>
            <button className="moveBack" type="button" onClick={() => updateSelectedVector('position', 2, 0.1)}>後</button>
          </div>
        </fieldset>
        <fieldset disabled={!selectedCollisionObjectName}>
          <legend>拡大・縮小</legend>
          <div className="controlButtons scaleButtons">
            {(['横', '縦', '前後'] as const).flatMap((label, axis) => [
              <button key={`${label}-plus`} type="button" onClick={() => updateSelectedVector('scale', axis, 0.1, 0.1)}>{label}＋</button>,
              <button key={`${label}-minus`} type="button" onClick={() => updateSelectedVector('scale', axis, -0.1, 0.1)}>{label}－</button>,
            ])}
          </div>
        </fieldset>
        {selectedCollisionObjectName && <p className="scaleValue">
          倍率: {collisionObjects.find(object => object.name === selectedCollisionObjectName)?.scale.map(value => value.toFixed(1)).join(' × ')}
        </p>}
      </div>
      <div className="collisionObjectInfo" aria-live="polite">
        <h4>座標</h4>
        {selectedCollisionObjectName ? (() => {
          const [x, y, z] = collisionObjects.find(object => object.name === selectedCollisionObjectName)?.position ?? [-2, 1, 2];
          return <dl>
            <div><dt>X</dt><dd>{x.toFixed(1)}</dd></div>
            <div><dt>Y</dt><dd>{y.toFixed(1)}</dd></div>
            <div><dt>Z</dt><dd>{z.toFixed(1)}</dd></div>
          </dl>;
        })() : <p>オブジェクトを選択してください</p>}
      </div>
    </section>
  </div>;
}
