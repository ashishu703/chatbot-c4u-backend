const path = require("path");
const ContactRepository = require("../repositories/ContactRepository");
const ChatRepository = require("../repositories/ChatRepository");
const AgentTaskRepository = require("../repositories/AgentTaskRepository");
const { uploadFile } = require("../utils/file.utils");
const UserRepository = require("../repositories/UserRepository");
const EmailAlreadyTakenException = require("../exceptions/CustomExceptions/EmailAlreadyTakenException");
const UserNotFoundException = require("../exceptions/CustomExceptions/UserNotFoundException");
const TypeTagException = require("../exceptions/CustomExceptions/TypeTagException");
const ChatNotFoundException = require("../exceptions/CustomExceptions/ChatNotFoundException");
const ContactNotFoundInPhonebookException = require("../exceptions/CustomExceptions/ContactNotFoundInPhonebookException");
const NotEnoughInputProvidedException = require("../exceptions/CustomExceptions/NotEnoughInputProvidedException");
const ContactAlreadyExistedException = require("../exceptions/CustomExceptions/ContactAlreadyExistedException");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
const PleaseSelectAgentException = require("../exceptions/CustomExceptions/PleaseSelectAgentException");
const CannotRemoveAgentDetailException = require("../exceptions/CustomExceptions/CannotRemoveAgentDetailException");
const { OPEN, PENDING, SOLVED } = require("../types/conversation-status.types");
const { PENDING: PENDING_TASK } = require("../types/tasks.types");
const ChatbotRepository = require("../repositories/ChatbotRepository");
const { encryptPassword, generateToken } = require("../utils/auth.utils");
const { USER } = require("../types/roles.types");
const PhonebookRepository = require("../repositories/phonebookRepository");
const WhatsappProfileApi = require("../api/Whatsapp/WhatsappProfileApi");
const { backendURI } = require("../config/app.config");

class UserService {
  userRepository;
  agentTaskRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.whatsappProfileApi = new WhatsappProfileApi();
    this.agentTaskRepository = new AgentTaskRepository();
    this.chatRepository = new ChatRepository();
    this.chatbotRepository = new ChatbotRepository();
    this.phonebookRepository = new PhonebookRepository();
    this.contactRepository = new ContactRepository();
  }

  async getUsers() {
    const users = await this.userRepository.find();
    return users;
  }

  async updateUserPlan(uid, plan) {
    const updatedUser = await this.userRepository.updatePlan(uid, plan);
    return updatedUser;
  }

async getDashboard(uid) {
  const user = await this.userRepository.findByUid(uid, [
    "chats",
    "chatbots",
    "contacts",
    "broadcasts",
    "flows",
    "templets",
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  const chats = user.chats || [];
  const openChats = chats.filter(chat => chat.chat_status === OPEN);
  const pendingChats = chats.filter(chat => chat.chat_status === PENDING);
  const resolvedChats = chats.filter(chat => chat.chat_status === SOLVED);

  const bots = user.chatbots || [];
  const activeBots = bots.filter(bot => bot.active === 1);
  const inactiveBots = bots.filter(bot => bot.active === 0);

  const totalContacts = (user.contacts || []).length;
  const totalFlows = (user.flows || []).length;
  const totalBroadcasts = (user.broadcasts || []).length;
  const totalTemplets = (user.templets || []).length;

  const totalChats = chats.length;
  const totalChatbots = bots.length;

  return {
    opened: openChats,
    pending: pendingChats,
    resolved: resolvedChats,
    activeBot: activeBots,
    dActiveBot: inactiveBots,
    totalChats,
    totalChatbots,
    totalContacts,
    totalFlows,
    totalBroadcasts,
    totalTemplets,
  };
}


  async updateUser(data) {
    const { uid, name, email, mobile_with_country_code, newPassword } = data;

    const existing = await this.userRepository.findByEmail(email);
    if (existing && existing.uid !== uid) {
      throw new EmailAlreadyTakenException();
    }

    const updates = { name, email, mobile_with_country_code };

    if (newPassword) {
      updates.password = await encryptPassword(newPassword);
    }

    return this.userRepository.update(updates, { uid });
  }

  async autoLogin(uid) {
    const user = await this.userRepository.findByUid(uid);
    if (!user) throw new UserNotFoundException();

    return generateToken(
      {
        uid: user.uid,
        role: USER,
        password: user.password,
        email: user.email,
      });
  }

  async deleteUser(id) {
    return this.userRepository.delete({id});
  }

  async saveNote(uid, chatId, note) {
    return this.chatRepository.update({ chat_note: note }, { chat_id: chatId, uid });
  }

  async pushTag(uid, tag, chatId) {
    if (!tag) throw new TypeTagException();
    const chat = await this.chatRepository.findByChatId(chatId);
    if (!chat) throw new ChatNotFoundException();
    let tags = [];
    tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];
    const newTags = [...tags, tag];
    return this.chatRepository.update({ chat_tags: JSON.stringify(newTags) }, { chat_id: chatId, uid });
  }

  async deleteTag(uid, tag, chatId) {
    const chat = await this.chatRepository.findByChatId(chatId);
    if (!chat) throw new ChatNotFoundException();

    const tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];
    const newTags = tags.filter((t) => t !== tag);

    return this.chatRepository.update({ chat_tags: JSON.stringify(newTags) }, { chat_id: chatId, uid });
  }

  async checkContact(uid, mobile) {
    const contact = await this.contactRepository.findByMobileAndUid(mobile, uid);
    const phonebooks = await this.phonebookRepository.findByUid(uid);

    if (!contact) {
      throw new ContactNotFoundInPhonebookException();
    }
    return { phonebook: phonebooks, contact };
  }

  async saveContact(
    uid,
    {
      phoneBookName,
      phoneBookId,
      phoneNumber,
      contactName,
      var1,
      var2,
      var3,
      var4,
      var5,
    }
  ) {
    if (!phoneBookName || !phoneBookId || !phoneNumber || !contactName) {
      throw new NotEnoughInputProvidedException();
    }

    const existingContact = await this.contactRepository.findByMobileAndUid(
      phoneNumber,
      uid
    );
    if (existingContact) {
      throw new ContactAlreadyExistedException();
    }

    return this.contactRepository.create({
      uid,
      phonebook_id: phoneBookId,
      phonebook_name: phoneBookName,
      name: contactName,
      mobile: phoneNumber,
      var1: var1 || "",
      var2: var2 || "",
      var3: var3 || "",
      var4: var4 || "",
      var5: var5 || "",
    });

  }

  async deleteContact(id) {
    return this.contactRepository.delete({ id });
  }

  async updateProfile(
    uid,
    { newPassword, name, mobile_with_country_code, email, timezone }
  ) {
    if (!name || !mobile_with_country_code || !email || !timezone) {
      throw new FillAllFieldsException();
    }

    const updateData = { name, email, mobile_with_country_code, timezone };
    if (newPassword) {
      updateData.password = await encryptPassword(newPassword);
    }

    return this.userRepository.update(updateData, { uid });
  }

  async fetchProfile(uid) {
    return this.whatsappProfileApi.setToken(metaKeys.access_token).fetchProfile(
      metaKeys.business_phone_number_id,
    );
  }

  async returnMediaUrl(uid, files) {
    if (!files || !files.file) {
      throw new NoFilesWereUploadedException();
    }

    const { filename } = await uploadFile(
      files.file,
      path.join(__dirname, "..", "client", "public", "media")
    );
    const url = `${backendURI}/media/${filename}`;
    return { url };
  }

  async addTaskForAgent(ownerUid, title, des, agent_uid) {
    if (!title || !des) {
      throw new FillAllFieldsException();
    }

    if (!agent_uid) {
      throw new PleaseSelectAgentException();
    }

    return this.agentTaskRepository.create({
      owner_uid: ownerUid,
      uid: agent_uid,
      title,
      description: des,
      status: PENDING_TASK,
    });
  }

  async getMyAgentTasks(ownerUid) {
    return this.agentTaskRepository.findByOwnerUid(ownerUid);
  }

  async deleteAgentTask(id, ownerUid) {
    return this.agentTaskRepository.deleteByIdAndOwner(
      id,
      ownerUid
    );
  }

  async updateAgentProfile({ email, name, mobile, newPas, uid }) {
    if (!email || !name || !mobile) {
      throw new CannotRemoveAgentDetailException();
    }

    const updateData = { email, name, mobile };
    if (newPas) {
      updateData.password = encryptPassword(newPas);
    }

    return this.agentTaskRepository.updateAgent(updateData, { uid });
  }

  async getUserById(id) {
    return this.userRepository.findById(id);
  }

  async getMe(uid) {
    return this.userRepository.findByUid(uid, ["contacts"]);
  }
}

module.exports = UserService;
