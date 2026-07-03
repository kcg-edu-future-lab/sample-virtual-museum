import { useRef, type SubmitEvent } from 'react';
import { ChangeState, ClassName, Distributed, EnterRoomAllowed, GetState, Madoi, SetState } from 'madoi-client';
import { useMadoiModel, useSelfPeer } from 'madoi-client-react';
import type { PeerProfile } from '../App';
import './Chat.css';

type ChatMessage = {
  peerId: string;
  senderName?: string;
  text: string;
  sentAt: string;
};

@ClassName("ChatModel")
class ChatModel {
  private messages: ChatMessage[] = [];

  @EnterRoomAllowed()
  welcome(_detail: any, madoi: Madoi<PeerProfile>){
    this.addMessage({
      peerId: madoi.getSelfPeer().id,
      senderName: "system",
      text: `${madoi.getSelfPeer().profile.name || madoi.getSelfPeer().id.substring(0, 8)}さんが参加しました。`,
      sentAt: new Date().toLocaleTimeString(),
    });
  }

  @Distributed()
  @ChangeState()
  addMessage(message: ChatMessage) {
    this.messages = [...this.messages, message];
  }

  @GetState()
  getMessages() {
    return this.messages;
  }

  @SetState()
  setMessages(messages: ChatMessage[]) {
    this.messages = messages;
  }
}

type ChatProps = {
  madoi: Madoi<PeerProfile>;
};

export function Chat({ madoi }: ChatProps) {
  const chatModel = useMadoiModel(madoi, () => new ChatModel());
  const speakerNameDialogRef = useRef<HTMLDialogElement>(null!);
  const speakerNameRef = useRef<HTMLInputElement>(null!);
  const chatMessageRef = useRef<HTMLInputElement>(null!);
  const selfPeer = useSelfPeer(madoi);

  const updateSpeakerName = (event: SubmitEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const name = speakerNameRef.current.value.trim();
    if(name.length == 0) return;
    madoi.updateSelfPeerProfile("name", name);
    speakerNameDialogRef.current.close();
  };

  const sendChatMessage = (event: SubmitEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const text = chatMessageRef.current.value.trim();
    if(text.length === 0) return;
    chatModel.addMessage({
      peerId: selfPeer.id,
      senderName: selfPeer.profile.name,
      text,
      sentAt: new Date().toLocaleTimeString(),
    });
    chatMessageRef.current.value = "";
  };

  const senderName = (message: ChatMessage)=>
      message.senderName === "system" ? "system" :
        (message.peerId === selfPeer.id ? "(You)" : "") + (message.senderName || message.peerId.slice(0, 8));

  return <aside className="chatPanel">
    <div className="chatHeader">
      <button
        className="speakerNameLink"
        type="button"
        onClick={() => {
          speakerNameRef.current.value = selfPeer.profile.name ?? "";
          speakerNameDialogRef.current.showModal();
        }}
      >
        You: {selfPeer.profile.name || selfPeer.id.slice(0, 8)}
      </button>
      <dialog className="speakerNameDialog" ref={speakerNameDialogRef}>
        <form className="speakerNameForm" onSubmit={updateSpeakerName}>
          <label htmlFor="speaker-name">名前を変更</label>
          <input
            id="speaker-name"
            ref={speakerNameRef}
            aria-label="Speaker name"
            placeholder="名前"
            autoFocus
          />
          <div className="speakerNameActions">
            <button type="button" onClick={() => speakerNameDialogRef.current.close()}>キャンセル</button>
            <button type="submit">変更</button>
          </div>
        </form>
      </dialog>
    </div>
    <div className="chatMessages">
      {chatModel.getMessages().map((message, index) => (
        <div className="chatMessage" key={index}>
          <div className="chatMeta">
            <span>{senderName(message)}</span>
            <time>{message.sentAt}</time>
          </div>
          <div className="chatText">{message.text}</div>
        </div>
      ))}
    </div>
    <form className="chatForm" onSubmit={sendChatMessage}>
      <input
        ref={chatMessageRef}
        aria-label="Chat message"
        placeholder="メッセージを入力"
      />
      <button type="submit">送信</button>
    </form>
  </aside>;
}
