const AgentChatRepository = require("../repositories/AgentChatRepository");
const ChatRepository = require("../repositories/ChatRepository");
const IOService = require("./IOService");
const {
  UPDATE_CONVERSATION,
  PUSH_NEW_MSG,
  PUSH_NEW_REACTION,
  UPDATE_DELIVERY_STATUS,
  UPDATE_CHAT_STATUS,
} = require("../types/socket-message.types");
const RoomRepository = require("../repositories/RoomRepository");

class ChatIOService extends IOService {
  userRoom = null;
  agentRoom = null;
  chat = null;
  constructor(chat = null) {
    super();
    this.chat = chat;
    this.chatRepository = new ChatRepository();
    this.agentChatRepository = new AgentChatRepository();
    this.roomRepository = new RoomRepository();
  }


  async init() {
    this.initIO();
    this.initChat();
  }

  async initChat() {
    if (this.chat) {
      await this.initUserRoom(this.chat.uid);

      const agentChatAssignment =
        this.chat.agentChat ??
        await this.getAgentChatAssignment();

      if (agentChatAssignment) {
        await this.initAgentRoom(agentChatAssignment.uid);
      }
    }
  }

  setChat(chat) {
    this.chat = chat;
    return this;
  }

  async getAgentChatAssignment() {
    return this.agentChatRepository.findFirst({ where: { chat_id: this.chat.id } })
  }

  async initUserRoom(uid) {
    this.userRoom = await this.roomRepository.findByUserId(uid);
  }

  async initAgentRoom(agentUid) {
    this.agentRoom = await this.roomRepository.findByUserId(agentUid);
  }

  async emitUpdateConversationEvent() {
    if (this.userRoom) {
      const chats = await this.chatRepository.findInboxChats(this.userRoom.uid);
      this.emit(this.userRoom.socket_id, UPDATE_CONVERSATION, chats);
    }

    if (this.agentRoom) {
      const agentChats = await this.agentChatRepository.findWithInboxChats(this.agentRoom.uid);
      const chats = agentChats.map((i) => i?.chat);
      this.emit(this.agentRoom.socket_id, UPDATE_CONVERSATION, chats);
    }
  }

  async emitUpdateConversationStatusEvent() {
    if (this.userRoom) {
      const chats = await this.chatRepository.findInboxChats(this.userRoom.uid);
      this.emit(this.userRoom.socket_id, UPDATE_CHAT_STATUS, chats);
    }

    if (this.agentRoom) {
      const agentChats = await this.agentChatRepository.findWithInboxChats(this.agentRoom.uid);
      const chats = agentChats.map((i) => i?.chat);
      this.emit(this.agentRoom.socket_id, UPDATE_CHAT_STATUS, chats);
    }
  }

  emitNewMsgEvent(message) {
    if (this.userRoom) this.emit(this.userRoom.socket_id, PUSH_NEW_MSG, message);
    if (this.agentRoom) this.emit(this.agentRoom.socket_id, PUSH_NEW_MSG, message);
  }

  emitNewReactionEvent(reaction) {
    if (this.userRoom) this.emit(this.userRoom.socket_id, PUSH_NEW_REACTION, reaction);
    if (this.agentRoom) this.emit(this.agentRoom.socket_id, PUSH_NEW_REACTION, reaction);
  }

  emitUpdateDeliveryEvent(status) {
    if (this.userRoom) this.emit(this.userRoom.socket_id, UPDATE_DELIVERY_STATUS, status);
    if (this.agentRoom) this.emit(this.agentRoom.socket_id, UPDATE_DELIVERY_STATUS, status);
  }

};
module.exports = ChatIOService