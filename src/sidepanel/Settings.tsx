import type { SubmitEvent } from "react";
import type { Madoi } from "madoi-client";
import { useSelfPeer } from "madoi-client-react";
import type { PeerProfile } from "../App";

export function Settings({ madoi }: { madoi: Madoi<PeerProfile> }) {
  const selfPeer = useSelfPeer(madoi);

  const updateName = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    if (name) madoi.updateSelfPeerProfile('name', name);
  };

  return <div className="settingsPanel" role="tabpanel" id="settings-panel" aria-labelledby="settings-tab">
    <h2>設定</h2>
    <form onSubmit={updateName}>
      <label htmlFor="display-name">表示名</label>
      <input id="display-name" name="name" defaultValue={selfPeer.profile.name ?? ''} />
      <button type="submit">保存</button>
    </form>
  </div>;
}
