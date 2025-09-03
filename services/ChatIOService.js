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
    try {
      if (this.userRoom && this.userRoom.socket_id) {
        const { data: chats } = await this.chatRepository.paginateInboxChats(this.userRoom.uid);
        this.emit(this.userRoom.socket_id, UPDATE_CONVERSATION, chats);
        console.log('Emitted conversation update to user room:', this.userRoom.socket_id);
      }

      if (this.agentRoom && this.agentRoom.socket_id) {
        const agentChats = await this.agentChatRepository.findWithInboxChats(this.agentRoom.uid);
        const chats = agentChats.map((i) => i?.chat);
        this.emit(this.agentRoom.socket_id, UPDATE_CONVERSATION, chats);
        console.log('Emitted conversation update to agent room:', this.agentRoom.socket_id);
      }
    } catch (error) {
      console.error('Error emitting conversation update:', error);
    }
  }

  async emitUpdateConversationStatusEvent() {
    if (this.userRoom) {
      const { data: chats } = await this.chatRepository.paginateInboxChats(this.userRoom.uid);
      this.emit(this.userRoom.socket_id, UPDATE_CHAT_STATUS, chats);
    }

    if (this.agentRoom) {
      const agentChats = await this.agentChatRepository.findWithInboxChats(this.agentRoom.uid);
      const chats = agentChats.map((i) => i?.chat);
      this.emit(this.agentRoom.socket_id, UPDATE_CHAT_STATUS, chats);
    }
  }

  emitNewMsgEvent(message) {
    // CRITICAL FIX: Emit to all connected users if specific room not found
    if (this.userRoom && this.userRoom.socket_id) {
      this.emit(this.userRoom.socket_id, PUSH_NEW_MSG, message);
    } else if (this.agentRoom && this.agentRoom.socket_id) {
      this.emit(this.agentRoom.socket_id, PUSH_NEW_MSG, message);
    } else {
      // FALLBACK: Emit to all connected users when no specific room found
      // This ensures webhook messages reach the frontend even when user is not connected
      const { getIOInstance } = require("../utils/socket.utils");
      const io = getIOInstance();
      if (io) {
        console.log('Broadcasting message to all connected users:', message.id);
        io.emit(PUSH_NEW_MSG, message);
      }
    }
  }

  emitNewReactionEvent(reaction) {
    if (this.userRoom && this.userRoom.socket_id) {
      this.emit(this.userRoom.socket_id, PUSH_NEW_REACTION, reaction);
    } else if (this.agentRoom && this.agentRoom.socket_id) {
      this.emit(this.agentRoom.socket_id, PUSH_NEW_REACTION, reaction);
    } else {
      // FALLBACK: Emit to all connected users
      const { getIOInstance } = require("../utils/socket.utils");
      const io = getIOInstance();
      if (io) {
        io.emit(PUSH_NEW_REACTION, reaction);
      }
    }
  }

  emitUpdateDeliveryEvent(status) {
    if (this.userRoom && this.userRoom.socket_id) {
      this.emit(this.userRoom.socket_id, UPDATE_DELIVERY_STATUS, status);
    } else if (this.agentRoom && this.agentRoom.socket_id) {
      this.emit(this.agentRoom.socket_id, UPDATE_DELIVERY_STATUS, status);
    } else {
      // FALLBACK: Emit to all connected users
      const { getIOInstance } = require("../utils/socket.utils");
      const io = getIOInstance();
      if (io) {
        io.emit(UPDATE_DELIVERY_STATUS, status);
      }
    }
  }

};
module.exports = ChatIOService