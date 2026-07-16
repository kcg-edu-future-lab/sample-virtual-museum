import { useRef, type ChangeEvent, type SubmitEvent } from "react";
import type { Madoi } from "madoi-client";
import type { PeerProfile } from "../App";
import './Settings.css';
import type { vec3 } from "../common/util";
import type { InfoObject } from "../common/InfoObject";

const isVec3 = (value: unknown): value is vec3 =>
  Array.isArray(value) && value.length === 3 && value.every(item => typeof item === 'number');

interface SettingsProps {
  madoi: Madoi<PeerProfile>;
  infoObjects: InfoObject[];
  onInfoObjectsChange: React.Dispatch<React.SetStateAction<InfoObject[]>>;
  selectedInfoObjectName?: string;
  onInfoObjectSelect: (name: string | undefined) => void;
}

export function Settings({
  infoObjects, onInfoObjectsChange,
  selectedInfoObjectName, onInfoObjectSelect
}: SettingsProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const downloadSettings = () => {
    const data = JSON.stringify({infoObjects}, null, 2);
    const url = URL.createObjectURL(new Blob([data], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'infoobjects.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadSettings = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    try {
      const settings = JSON.parse(await file.text()) as {infoObjects?: unknown};
      if (!Array.isArray(settings.infoObjects)
        || !settings.infoObjects.every(object => object && typeof object === 'object'
          && typeof (object as InfoObject).name === 'string'
          && typeof (object as InfoObject).url === 'string'
          && isVec3((object as InfoObject).position)
          && isVec3((object as InfoObject).scale))) {
        throw new Error('Invalid settings file');
      }
      onInfoObjectsChange(settings.infoObjects as InfoObject[]);
      onInfoObjectSelect(undefined);
    } catch {
      window.alert('設定ファイルを読み込めませんでした。');
    }
  };

  const addInfoObject = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get('objectName') ?? '').trim();
    if (!name || infoObjects.some(object => object.name === name)) return;
    onInfoObjectsChange([...infoObjects, {name, url: '', position: [-2, 1, 2], scale: [1, 1, 1]}]);
    form.reset();
  };

  const removeInfoObject = (name: string) => {
    onInfoObjectsChange(infoObjects.filter(object => object.name !== name));
  };

  const updateSelectedUrl = (url: string) => {
    if (!selectedInfoObjectName) return;
    onInfoObjectsChange(current => current.map(object =>
      object.name === selectedInfoObjectName ? {...object, url} : object
    ));
  };

  const updateSelectedVector = (
    property: 'position' | 'scale',
    axis: number,
    amount: number,
    minimum?: number,
  ) => {
    if (!selectedInfoObjectName) return;
    onInfoObjectsChange(current => current.map(object => {
      if (object.name !== selectedInfoObjectName) return object;
      const next = [...object[property]] as vec3;
      next[axis] = Math.max(minimum ?? -Infinity, Number((next[axis] + amount).toFixed(1)));
      return {...object, [property]: next};
    }));
  };

  return <div className="settingsPanel" role="tabpanel" id="settings-panel" aria-labelledby="settings-tab">
    <section className="infoObjects">
      <div className="infoObjectsHeader">
        <h3>説明オブジェクト</h3>
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
      <form onSubmit={addInfoObject}>
        <div className="infoObjectInput">
          <input id="collision-object-name" name="objectName" placeholder="オブジェクト名" required />
          <button type="submit">追加</button>
        </div>
      </form>
      {infoObjects.length === 0 ? (
        <p className="emptyInfoObjects">登録されていません</p>
      ) : (
        <ul className="infoObjectList">
          {infoObjects.map(({name}) => <li key={name}>
            <button
              type="button"
              className="infoObjectSelect"
              aria-pressed={selectedInfoObjectName === name}
              onClick={() => onInfoObjectSelect(
                selectedInfoObjectName === name ? undefined : name
              )}
            >{name}</button>
            <button className="infoObjectRemove" type="button" onClick={() => removeInfoObject(name)} aria-label={`${name}を削除`}>
              削除
            </button>
          </li>)}
        </ul>
      )}
      <div className="infoObjectControls">
        <fieldset disabled={!selectedInfoObjectName}>
          <legend>URL</legend>
          <input
            type="url"
            value={infoObjects.find(object => object.name === selectedInfoObjectName)?.url ?? ''}
            onChange={event => updateSelectedUrl(event.currentTarget.value)}
            placeholder="https://example.com"
            aria-label="オブジェクトのURL"
          />
        </fieldset>
        <fieldset disabled={!selectedInfoObjectName}>
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
        <fieldset disabled={!selectedInfoObjectName}>
          <legend>拡大・縮小</legend>
          <div className="controlButtons scaleButtons">
            {(['横', '縦', '前後'] as const).flatMap((label, axis) => [
              <button key={`${label}-plus`} type="button" onClick={() => updateSelectedVector('scale', axis, 0.1, 0.1)}>{label}＋</button>,
              <button key={`${label}-minus`} type="button" onClick={() => updateSelectedVector('scale', axis, -0.1, 0.1)}>{label}－</button>,
            ])}
          </div>
        </fieldset>
        {selectedInfoObjectName && <p className="scaleValue">
          倍率: {infoObjects.find(object => object.name === selectedInfoObjectName)?.scale.map(value => value.toFixed(1)).join(' × ')}
        </p>}
      </div>
      <div className="infoObjectInfo" aria-live="polite">
        <h4>座標</h4>
        {selectedInfoObjectName ? (() => {
          const [x, y, z] = infoObjects.find(object => object.name === selectedInfoObjectName)?.position ?? [-2, 1, 2];
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
