import { ChangeState, ClassName, Distributed, EnterRoomAllowed, GetState, Madoi, SetState } from "madoi-client";
import type { PeerProfile } from "../App";

export type ChatMessage = {
  peerId: string;
  senderName?: string;
  text: string;
  sentAt: string;
};

@ClassName("ChatModel")
export class ChatModel {
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
