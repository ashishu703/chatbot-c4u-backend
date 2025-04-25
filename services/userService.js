const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository = require('../repositories/userRepository');
const contactRepository = require('../repositories/contactRepository');
const chatRepository = require('../repositories/chatRepository');
const chatbotRepository = require('../repositories/chatbotRepository');
const agentTaskRepository = require('../repositories/agentTaskRepository');
const metaRepository = require('../repositories/metaRepository');

const { fetchProfileFun } = require('../utils/metaUtils');
const { uploadFile } = require('../utils/fileUtils');
const HttpException = require('../utils/HttpException');

class UserService {
  static async getMe(uid) {
    const user = await userRepository.findByUid(uid);
    const contacts = await contactRepository.getPhonebooksByUid(uid);
    return { success: true, data: { ...user.dataValues, contact: contacts.length } };
  }

  static async getUsers(adminUid) {
    try {
      const admin = await userRepository.findById(adminUid);
      if (admin.role !== 'admin') {
        throw new HttpException('Unauthorized: Admin access required', 403);
      }
      const users = await userRepository.findAll();
      return { success: true, data: users };
    } catch (err) {
      console.error('Error in getUsers:', err);
      throw err instanceof HttpException ? err : new HttpException('Internal server error', 500);
    }
  }

  static async updateUser(data) {
    const { uid, name, email, mobile_with_country_code, newPassword } = data;

    const existing = await userRepository.findByEmail(email);
    if (existing && existing.uid !== uid) {
      throw new Error('This email is already taken by another user');
    }

    const updates = { name, email, mobile_with_country_code };

    if (newPassword) {
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    await userRepository.update(uid, updates);
    return { success: true, msg: 'User updated successfully' };
  }

  static async autoLogin(uid) {
    const user = await userRepository.findByUid(uid);
    if (!user) throw new Error('User not found');

    const token = jwt.sign({
      uid: user.uid,
      role: 'user',
      password: user.password,
      email: user.email
    }, process.env.JWTKEY);

    return token;
  }

  static async deleteUser(id) {
    await userRepository.deleteById(id);
    return { success: true, msg: 'User deleted successfully' };
  }

  static async saveNote(uid, chatId, note) {
    await chatRepository.update(chatId, { chat_note: note });
    return { success: true, msg: 'Notes were updated' };
  }

  static async pushTag(uid, tag, chatId) {
    if (!tag) return { success: false, msg: 'Please type a tag' };

    const chat = await chatRepository.findByChatId(chatId);
    if (!chat) return { success: false, msg: 'Chat not found' };

    let tags = [];
    try {
      tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];
    } catch (err) {
      console.error('Error parsing chat_tags:', err);
      return { success: false, msg: 'Invalid tag data' };
    }

    const newTags = [...tags, tag];
    await chatRepository.update(chatId, { chat_tags: JSON.stringify(newTags) });
    return { success: true, msg: 'Tag was added' };
  }

  static async deleteTag(uid, tag, chatId) {
    const chat = await chatRepository.findByChatId(chatId);
    if (!chat) return { success: false, msg: 'Chat not found' };

    const tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];
    const newTags = tags.filter(t => t !== tag);

    await chatRepository.update(chatId, { chat_tags: JSON.stringify(newTags) });
    return { success: true, msg: 'Tag was deleted' };
  }

  static async checkContact(uid, mobile) {
    const contact = await contactRepository.findByMobileAndUid(mobile, uid);
    const phonebooks = await contactRepository.getPhonebooksByUid(uid);

    if (!contact) {
      return { success: false, msg: 'Contact not found in phonebook', phonebook: phonebooks };
    }
    return { success: true, phonebook: phonebooks, contact };
  }

  static async saveContact(uid, { phoneBookName, phoneBookId, phoneNumber, contactName, var1, var2, var3, var4, var5 }) {
    if (!phoneBookName || !phoneBookId || !phoneNumber || !contactName) {
      return { success: false, msg: 'Incomplete input provided' };
    }

    const existingContact = await contactRepository.findByMobileAndUid(phoneNumber, uid);
    if (existingContact) {
      return { success: false, msg: 'Contact already existed' };
    }

    await contactRepository.create({
      uid,
      phonebook_id: phoneBookId,
      phonebook_name: phoneBookName,
      name: contactName,
      mobile: phoneNumber,
      var1: var1 || '', var2: var2 || '', var3: var3 || '', var4: var4 || '', var5: var5 || ''
    });

    return { success: true, msg: 'Contact was added' };
  }

  static async deleteContact(id) {
    await contactRepository.delete(id);
    return { success: true, msg: 'Contact was deleted' };
  }

  static async updateProfile(uid, { newPassword, name, mobile_with_country_code, email, timezone }) {
    if (!name || !mobile_with_country_code || !email || !timezone) {
      return { success: false, msg: 'Name, Mobile, Email, Timezone are required fields' };
    }

    const updateData = { name, email, mobile_with_country_code, timezone };
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await userRepository.update(uid, updateData);
    return { success: true, msg: 'Profile was updated' };
  }

  static async getDashboard(uid) {
    const openChats = await chatRepository.findByStatus(uid, 'open');
    const pendingChats = await chatRepository.findByStatus(uid, 'pending');
    const resolvedChats = await chatRepository.findByStatus(uid, 'solved');
    const activeBots = await chatbotRepository.findByStatus(uid, 1);
    const inactiveBots = await chatbotRepository.findByStatus(uid, 0);
    const totalChats = await chatRepository.countByUid(uid);
    const totalChatbots = await chatbotRepository.countByUid(uid);
    const totalContacts = await contactRepository.countByUid(uid);
    const totalFlows = await chatRepository.countByUid(uid);
    const totalBroadcasts = await chatRepository.countByUid(uid);
    const totalTemplets = await chatRepository.countByUid(uid);

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
      totalTemplets
    };
  }

  static async addTaskForAgent(ownerUid, title, des, agent_uid) {
    if (!title || !des) {
      return { success: false, msg: 'Please give title and description' };
    }

    if (!agent_uid) {
      return { success: false, msg: 'Please select an agent' };
    }

    await agentTaskRepository.create({
      owner_uid: ownerUid,
      uid: agent_uid,
      title,
      description: des,
      status: 'PENDING'
    });

    return { success: true, msg: 'Task was added' };
  }

  static async getMyAgentTasks(ownerUid) {
    const tasks = await agentTaskRepository.findByOwnerUid(ownerUid);
    return { success: true, data: tasks };
  }

  static async deleteTaskForAgent(ownerUid, id) {
    await agentTaskRepository.delete(id, ownerUid);
    return { success: true, msg: 'Task was deleted' };
  }

  static async updateAgentProfile({ email, name, mobile, newPas, uid }) {
    if (!email || !name || !mobile) {
      return { success: false, msg: 'You can not remove any detail of agent' };
    }

    const updateData = { email, name, mobile };
    if (newPas) {
      updateData.password = await bcrypt.hash(newPas, 10);
    }

    await agentTaskRepository.updateAgent(uid, updateData);
    return { success: true, msg: 'Agent profile was updated' };
  }

  static async fetchProfile(uid) {
    const metaKeys = await metaRepository.findMetaApiByUid(uid);
    if (!metaKeys?.access_token || !metaKeys?.business_phone_number_id) {
      return { success: false, msg: 'Please fill the meta token and mobile id' };
    }

    return await fetchProfileFun(metaKeys.business_phone_number_id, metaKeys.access_token);
  }

  static async returnMediaUrl(uid, files) {
    if (!files || !files.file) {
      return { success: false, msg: 'No files were uploaded' };
    }

    const { filename } = await uploadFile(files.file, path.join(__dirname, '..', 'client', 'public', 'media'));
    const url = `${process.env.BACKURI}/media/${filename}`;
    return { success: true, url };
  }
}

module.exports = UserService;
