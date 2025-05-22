const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Agents } = require("../models");
const contactRepository = require("../repositories/ContactRepository");
const chatRepository = require("../repositories/ChatRepository");
const chatbotRepository = require("../repositories/ChatbotRepository");
const AgentTaskRepository = require("../repositories/AgentTaskRepository");
const metaRepository = require("../repositories/MetaRepository");
const { fetchProfileFun } = require("../utils/metaApi");
const { uploadFile } = require("../utils/fileUtils");
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
const TaskNotFoundOrUnauthorizedException = require("../exceptions/CustomExceptions/TaskNotFoundOrUnauthorizedException");
const CannotRemoveAgentDetailException = require("../exceptions/CustomExceptions/CannotRemoveAgentDetailException");

class UserService {
  userRepository;
  agentTaskRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.agentTaskRepository = new AgentTaskRepository();
  }

  async getUsers() {
    const users = await this.userRepository.findAll();
    return users;
  }

  async updateUserPlan(uid, plan) {
    const updatedUser = await this.userRepository.updatePlan(uid, plan);
    return updatedUser;
  }

  async getDashboard(uid) {
    const openChats =
      (await chatRepository.findByChatStatus(uid, "open")) || [];
    const pendingChats =
      (await chatRepository.findByChatStatus(uid, "pending")) || [];
    const resolvedChats =
      (await chatRepository.findByChatStatus(uid, "solved")) || [];
    const activeBots = (await chatbotRepository.findByStatus(uid, 1)) || [];
    const inactiveBots = (await chatbotRepository.findByStatus(uid, 0)) || [];
    const totalChats = (await chatRepository.countByUid(uid)) || 0;
    const totalChatbots = (await chatbotRepository.countByUid(uid)) || 0;
    const totalContacts = (await contactRepository.countByUid(uid)) || 0;
    const totalFlows = (await chatRepository.countByUid(uid)) || 0;
    const totalBroadcasts = (await chatRepository.countByUid(uid)) || 0;
    const totalTemplets = (await chatRepository.countByUid(uid)) || 0;

    return {
      success: true,
      opened: openChats,
      pending: pendingChats,
      resolved: resolvedChats,
      activeBot: activeBots,
      dActiveBot: inactiveBots,
      totalChats,
      totalChatbots,
      totalContacts,
      totalFlows,
      totalBroadcast: totalBroadcasts,
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
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    await this.userRepository.update(uid, updates);
    return true;
  }

  async autoLogin(uid) {
    const user = await this.userRepository.findByUid(uid);
    if (!user) throw new UserNotFoundException();

    const token = jwt.sign(
      {
        uid: user.uid,
        role: "user",
        password: user.password,
        email: user.email,
      },
      process.env.JWTKEY
    );

    return token;
  }

  async deleteUser(id) {
    await this.userRepository.deleteById(id);
    return true;
  }

  async saveNote(uid, chatId, note) {
    await chatRepository.update(chatId, { chat_note: note });
    return true;
  }

  async pushTag(uid, tag, chatId) {
    if (!tag) throw new TypeTagException();

    const chat = await chatRepository.findByChatId(chatId);
    if (!chat) throw new ChatNotFoundException();

    let tags = [];

    tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];

    const newTags = [...tags, tag];
    await chatRepository.update(chatId, { chat_tags: JSON.stringify(newTags) });
    return true;
  }

  async deleteTag(uid, tag, chatId) {
    const chat = await chatRepository.findByChatId(chatId);
    if (!chat) throw new ChatNotFoundException();

    const tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];
    const newTags = tags.filter((t) => t !== tag);

    await chatRepository.update(chatId, { chat_tags: JSON.stringify(newTags) });
    return true;
  }

  async checkContact(uid, mobile) {
    const contact = await contactRepository.findByMobileAndUid(mobile, uid);
    const phonebooks = await contactRepository.getPhonebooksByUid(uid);

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

    const existingContact = await contactRepository.findByMobileAndUid(
      phoneNumber,
      uid
    );
    if (existingContact) {
      throw new ContactAlreadyExistedException();
    }

    await contactRepository.create({
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

    return true;
  }

  async deleteContact(id) {
    await contactRepository.delete(id);
    return true;
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
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await this.userRepository.update(uid, updateData);
    return true;
  }

  async fetchProfile(uid) {
    const metaKeys = await metaRepository.findMetaApiByUid(uid);
    if (!metaKeys?.access_token || !metaKeys?.business_phone_number_id) {
      throw new FillAllFieldsException();
    }

    return await fetchProfileFun(
      metaKeys.business_phone_number_id,
      metaKeys.access_token
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
    const url = `${process.env.BACKURI}/media/${filename}`;
    return { url };
  }

  async addTaskForAgent(ownerUid, title, des, agent_uid) {
    if (!title || !des) {
      throw new FillAllFieldsException();
    }

    if (!agent_uid) {
      throw new PleaseSelectAgentException();
    }

    await this.agentTaskRepository.create({
      owner_uid: ownerUid,
      uid: agent_uid,
      title,
      description: des,
      status: "PENDING",
    });

    return true;
  }

  async getMyAgentTasks(ownerUid) {
    const tasks = await this.agentTaskRepository.findByOwnerUid(ownerUid);
    return { data: tasks };
  }

  async deleteAgentTask(id, ownerUid) {
    const deleted = await this.agentTaskRepository.deleteByIdAndOwner(
      id,
      ownerUid
    );

    if (deleted) {
      return true;
    } else {
      throw new TaskNotFoundOrUnauthorizedException();
    }
  }

  async updateAgentProfile({ email, name, mobile, newPas, uid }) {
    if (!email || !name || !mobile) {
      throw new CannotRemoveAgentDetailException();
    }

    const updateData = { email, name, mobile };
    if (newPas) {
      updateData.password = await bcrypt.hash(newPas, 10);
    }

    await this.agentTaskRepository.updateAgent(uid, updateData);
    return true;
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async getMe(uid) {
    const user = await this.userRepository.findByUid(uid);
    const contacts = await contactRepository.getPhonebooksByUid(uid);
    return {
      success: true,
      data: { ...user.dataValues, contact: contacts.length },
    };
  }
}

module.exports = UserService;
