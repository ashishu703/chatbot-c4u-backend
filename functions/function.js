const fs = require('fs/promises');
const path = require('path');
const moment = require('moment-timezone');
const axios = require('axios');
const randomstring = require('randomstring');
const { getIOInstance } = require('../socket');
const fetch = require('node-fetch');
const mime = require('mime-types');
const nodemailer = require('nodemailer');
const unzipper = require('unzipper');
const { destributeTaskFlow } = require('./chatbot');
const csv = require('csv-parse/sync');
const { User, MetaApi, Chat, Room, AgentChat, BroadcastLog, Chatbot, MetaTempletMedia, Message } = require('../models');

// Find target nodes (unchanged)
function findTargetNodes(nodes, edges, incomingWord) {
  const matchingEdges = edges.filter((edge) => edge.sourceHandle === incomingWord);
  const targetNodeIds = matchingEdges.map((edge) => edge.target);
  const targetNodes = nodes.filter((node) => targetNodeIds.includes(node.id));
  return targetNodes;
}

// Check assign AI (unchanged)
function checkAssignAi(nodes) {
  try {
    const check = nodes.filter((x) => x?.data?.msgContent?.assignAi === true);
    return check?.length > 0 ? check : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

// Get reply (unchanged)
function getReply(nodes, edges, incomingWord) {
  const getNormal = findTargetNodes(nodes, edges, incomingWord);
  if (getNormal.length > 0) {
    return getNormal;
  } else if (checkAssignAi(nodes)?.length > 0) {
    const findAiNodes = checkAssignAi(nodes);
    return findAiNodes;
  } else {
    const getOther = findTargetNodes(nodes, edges, '{{OTHER_MSG}}');
    return getOther;
  }
}

// Run chatbot (updated to use Sequelize)
async function runChatbot(i, incomingMsg, uid, senderNumber, toName) {
  const chatbot = i;
  const forAll = i?.for_all > 0 ? true : false;

  if (!forAll) {
    const numberArr = JSON.parse(chatbot?.chats);
    const chatId = convertNumberToRandomString(senderNumber || '');
    const flow = JSON.parse(i?.flow);

    if (numberArr.includes(senderNumber)) {
      const nodePath = `${__dirname}/../flow-json/nodes/${uid}/${flow?.flow_id}.json`;
      const edgePath = `${__dirname}/../flow-json/edges/${uid}/${flow?.flow_id}.json`;

      const nodes = await readJsonFromFile(nodePath);
      const edges = await readJsonFromFile(edgePath);

      if (nodes.length > 0 && edges.length > 0) {
        const answer = getReply(nodes, edges, incomingMsg);

        console.log({ answer: JSON.stringify(answer) });

        if (answer.length > 0) {
          for (const k of answer) {
            await destributeTaskFlow({
              uid,
              k,
              chatbotFromMysql: chatbot,
              toName,
              senderNumber,
              sendMetaMsg,
              chatId,
              nodes,
              edges,
              incomingMsg,
              flowData: flow,
            });
          }
        }
      }
    }
  } else {
    const chatId = convertNumberToRandomString(senderNumber || '');
    const flow = JSON.parse(i?.flow);

    const nodePath = `${__dirname}/../flow-json/nodes/${uid}/${flow?.flow_id}.json`;
    const edgePath = `${__dirname}/../flow-json/edges/${uid}/${flow?.flow_id}.json`;

    const nodes = await readJsonFromFile(nodePath);
    const edges = await readJsonFromFile(edgePath);

    if (nodes.length > 0 && edges.length > 0) {
      const answer = getReply(nodes, edges, incomingMsg);

      console.log({ answer2: JSON.stringify(answer) });

      if (answer.length > 0) {
        for (const k of answer) {
          await destributeTaskFlow({
            uid,
            k,
            chatbotFromMysql: chatbot,
            toName,
            senderNumber,
            sendMetaMsg,
            chatId,
            nodes,
            edges,
            incomingMsg,
            flowData: flow,
          });
        }
      }
    }
  }
}

// Bot webhook (updated to use Sequelize)
async function botWebhook(incomingMsg, uid, senderNumber, toName) {
  console.log({ incomingMsg });

  try {
    const user = await User.findOne({ where: { uid } });
    if (!user || !user.plan) {
      return;
    }

    const plan = JSON.parse(user.plan);
    if (plan.allow_chatbot > 0) {
      const chatbots = await Chatbot.findAll({ where: { uid, active: true } });

      if (chatbots.length > 0) {
        await Promise.all(
          chatbots.map((i) => runChatbot(i, incomingMsg, uid, senderNumber, toName))
        );
      }
    } else {
      await Chatbot.update({ active: false }, { where: { uid } });
    }
  } catch (err) {
    console.error('Error in botWebhook:', err);
  }
}

// Save message (updated to use Sequelize)
async function saveMessage(body, uid, type, msgContext) {
  try {
    console.log('CAME HERE IN saveMessage');
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      throw new Error('User not found');
    }

    const userTimezone = getCurrentTimestampInTimeZone(user.timezone || Date.now() / 1000);
    const chatId = convertNumberToRandomString(
      body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
      body?.entry[0]?.changes
        ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
        : 'NA'
    );

    const actualMsg = {
      type,
      metaChatId: body?.entry[0]?.changes[0]?.value?.messages[0]?.id,
      msgContext,
      reaction: '',
      timestamp: userTimezone,
      senderName: body?.entry[0]?.changes
        ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
        : 'NA',
      senderMobile: body?.entry[0]?.changes
        ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id
        : 'NA',
      status: '',
      star: false,
      route: 'INCOMING',
      context: body?.entry[0]?.changes[0]?.value?.messages[0]?.context || '',
    };

    // Save to Message model
    await Message.create({
      chat_id: chatId,
      uid,
      metaChatId: actualMsg.metaChatId,
      msgContext: actualMsg.msgContext,
      senderName: actualMsg.senderName,
      senderMobile: actualMsg.senderMobile,
      status: actualMsg.status,
      route: actualMsg.route,
      reaction: actualMsg.reaction,
      timestamp: actualMsg.timestamp,
      star: actualMsg.star,
      context: actualMsg.context,
    });

    // Find or create chat
    let chat = await Chat.findOne({ where: { chat_id: chatId, uid } });
    if (!chat) {
      chat = await Chat.create({
        chat_id: chatId,
        uid,
        last_message_came: userTimezone,
        sender_name: actualMsg.senderName,
        sender_mobile: actualMsg.senderMobile,
        last_message: actualMsg,
        is_opened: false,
      });
    } else {
      await Chat.update(
        {
          last_message_came: userTimezone,
          last_message: actualMsg,
          is_opened: false,
        },
        { where: { chat_id: chatId, uid } }
      );
    }

    const chatPath = `${__dirname}/../conversations/inbox/${uid}/${chatId}.json`;
    await addObjectToFile(actualMsg, chatPath);

    const io = getIOInstance();
    const room = await Room.findOne({ where: { uid: someUid } });
    const chats = await Chat.findAll({ where: { uid } });

    if (room) {
      io.to(room.socket_id).emit('update_conversations', { chats });
      io.to(room.socket_id).emit('push_new_msg', { msg: actualMsg, chatId });
    }

    // Handle agent chats
    const agentChat = await AgentChat.findOne({ where: { owner_uid: uid, chat_id: chatId } });
    if (agentChat) {
      const agentChats = await AgentChat.findAll({ where: { uid: agentChat.uid } });
      const chatIds = agentChats.map((i) => i.chat_id);
      const chatsNew = await Chat.findAll({ where: { chat_id: chatIds, uid } });
      const agentRoom = await Room.findOne({ where: { uid: agentChat.uid } });

      if (agentRoom) {
        io.to(agentRoom.socket_id).emit('update_conversations', { chats: chatsNew || [] });
        io.to(agentRoom.socket_id).emit('push_new_msg', { msg: actualMsg, chatId });
      }
    }
  } catch (err) {
    console.error('Error in saveMessage:', err);
    throw err;
  }
}

// Save webhook conversation (updated to use Sequelize)
async function saveWebhookConversation(body, uid) {
  try {
    // Save simple text
    if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.type === 'text'
    ) {
      await saveMessage(body, uid, 'text', {
        type: 'text',
        text: {
          preview_url: true,
          body: body?.entry[0]?.changes[0]?.value?.messages[0]?.text?.body,
        },
      });

      await botWebhook(
        body?.entry[0]?.changes[0]?.value?.messages[0]?.text?.body,
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
    // Images
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.image
    ) {
      const user = await User.findOne({ where: { uid } });
      const metaApi = await MetaApi.findOne({ where: { uid } });
      const metaToken = metaApi?.access_token;

      if (metaToken) {
        const fileName = await downloadAndSaveMedia(
          metaToken,
          body?.entry[0]?.changes[0]?.value?.messages[0]?.image?.id
        );
        await saveMessage(body, uid, 'image', {
          type: 'image',
          image: {
            link: `${process.env.BACKURI}/meta-media/${fileName}`,
            caption: body?.entry[0]?.changes[0]?.value?.messages[0]?.image?.caption || '',
          },
        });
      }

      await botWebhook(
        body?.entry[0]?.changes[0]?.value?.messages[0]?.image?.caption || 'aU1uLzohPGMncyrwlPIb',
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
    // Video
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.video
    ) {
      const metaApi = await MetaApi.findOne({ where: { uid } });
      const metaToken = metaApi?.access_token;

      if (metaToken) {
        const fileName = await downloadAndSaveMedia(
          metaToken,
          body?.entry[0]?.changes[0]?.value?.messages[0]?.video?.id
        );
        await saveMessage(body, uid, 'video', {
          type: 'video',
          video: {
            link: `${process.env.BACKURI}/meta-media/${fileName}`,
            caption: body?.entry[0]?.changes[0]?.value?.messages[0]?.video?.caption,
          },
        });
      }

      await botWebhook(
        body?.entry[0]?.changes[0]?.value?.messages[0]?.video?.caption || 'aU1uLzohPGMncyrwlPIb',
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
    // Document
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.document
    ) {
      const metaApi = await MetaApi.findOne({ where: { uid } });
      const metaToken = metaApi?.access_token;

      if (metaToken) {
        const fileName = await downloadAndSaveMedia(
          metaToken,
          body?.entry[0]?.changes[0]?.value?.messages[0]?.document?.id
        );
        await saveMessage(body, uid, 'document', {
          type: 'document',
          document: {
            link: `${process.env.BACKURI}/meta-media/${fileName}`,
            caption: body?.entry[0]?.changes[0]?.value?.messages[0]?.document?.caption,
          },
        });
      }

      await botWebhook(
        body?.entry[0]?.changes[0]?.value?.messages[0]?.document?.caption || 'aU1uLzohPGMncyrwlPIb',
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
    // Audio
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.audio
    ) {
      const metaApi = await MetaApi.findOne({ where: { uid } });
      const metaToken = metaApi?.access_token;

      if (metaToken) {
        const fileName = await downloadAndSaveMedia(
          metaToken,
          body?.entry[0]?.changes[0]?.value?.messages[0]?.audio?.id
        );
        await saveMessage(body, uid, 'audio', {
          type: 'audio',
          audio: {
            link: `${process.env.BACKURI}/meta-media/${fileName}`,
          },
        });
      }

      await botWebhook(
        'aU1uLzohPGMncyrwlPIb',
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
    // Reactions
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.reaction
    ) {
      const chatId = convertNumberToRandomString(
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
      const filePath = `${__dirname}/../conversations/inbox/${uid}/${chatId}.json`;
      await updateMessageObjectInFile(
        filePath,
        body?.entry[0]?.changes[0]?.value?.messages[0]?.reaction?.message_id,
        'reaction',
        body?.entry[0]?.changes[0]?.value?.messages[0]?.reaction?.emoji
      );

      const io = getIOInstance();
      const room = await Room.findOne({ where: { uid } });

      if (room) {
        io.to(room.socket_id).emit('push_new_reaction', {
          reaction: body?.entry[0]?.changes[0]?.value?.messages[0]?.reaction?.emoji,
          chatId,
          msgId: body?.entry[0]?.changes[0]?.value?.messages[0]?.reaction?.message_id,
        });
      }

      const agentChat = await AgentChat.findOne({ where: { owner_uid: uid, chat_id: chatId } });
      if (agentChat) {
        const agentRoom = await Room.findOne({ where: { uid: agentChat.uid } });
        if (agentRoom) {
          io.to(agentRoom.socket_id).emit('push_new_reaction', {
            reaction: body?.entry[0]?.changes[0]?.value?.messages[0]?.reaction?.emoji,
            chatId,
            msgId: body?.entry[0]?.changes[0]?.value?.messages[0]?.reaction?.message_id,
          });
        }
      }
    }
    // Button reply
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.button?.text
    ) {
      await saveMessage(body, uid, 'text', {
        type: 'text',
        text: {
          preview_url: true,
          body: body?.entry[0]?.changes[0]?.value?.messages[0]?.button?.text,
        },
      });

      await botWebhook(
        body?.entry[0]?.changes[0]?.value?.messages[0]?.button?.text || 'aU1uLzohPGMncyrwlPIb',
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
    // Quick reply button
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.interactive?.button_reply
    ) {
      await saveMessage(body, uid, 'text', {
        type: 'text',
        text: {
          preview_url: true,
          body: body?.entry[0]?.changes[0]?.value?.messages[0]?.interactive?.button_reply?.title,
        },
      });

      await botWebhook(
        body?.entry[0]?.changes[0]?.value?.messages[0]?.interactive?.button_reply?.title || 'aU1uLzohPGMncyrwlPIb',
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
    // Delivery status
    else if (
      body?.entry[0]?.changes[0]?.value?.statuses &&
      body?.entry[0]?.changes[0]?.value?.statuses[0]?.id
    ) {
      const metaMsgId = body?.entry[0]?.changes[0]?.value?.statuses[0]?.id;
      const chatId = convertNumberToRandomString(
        body?.entry[0]?.changes[0]?.value?.statuses[0]?.recipient_id,
        body?.entry[0]?.changes || 'NA'
      );

      const filePath = `${__dirname}/../conversations/inbox/${uid}/${chatId}.json`;
      await updateMessageObjectInFile(
        filePath,
        metaMsgId,
        'status',
        body?.entry[0]?.changes[0]?.value?.statuses[0]?.status
      );

      const io = getIOInstance();
      const room = await Room.findOne({ where: { uid } });

      if (room) {
        io.to(room.socket_id).emit('update_delivery_status', {
          chatId,
          status: body?.entry[0]?.changes[0]?.value?.statuses[0]?.status,
          msgId: metaMsgId,
        });
      }

      const agentChat = await AgentChat.findOne({ where: { owner_uid: uid, chat_id: chatId } });
      if (agentChat) {
        const agentRoom = await Room.findOne({ where: { uid: agentChat.uid } });
        if (agentRoom) {
          io.to(agentRoom.socket_id).emit('update_delivery_status', {
            chatId,
            status: body?.entry[0]?.changes[0]?.value?.statuses[0]?.status,
            msgId: metaMsgId,
          });
        }
      }

      if (body?.entry[0]?.changes[0]?.value?.statuses[0]?.status === 'failed') {
        await BroadcastLog.update(
          {
            delivery_status: body?.entry[0]?.changes[0]?.value?.statuses[0]?.status,
            err: body,
          },
          { where: { meta_msg_id: metaMsgId } }
        );
      } else {
        await BroadcastLog.update(
          { delivery_status: body?.entry[0]?.changes[0]?.value?.statuses[0]?.status },
          { where: { meta_msg_id: metaMsgId } }
        );
      }
    }
    // List reply
    else if (
      body?.entry[0]?.changes[0]?.value?.messages &&
      body?.entry[0]?.changes[0]?.value?.messages[0]?.interactive?.list_reply
    ) {
      await saveMessage(body, uid, 'text', {
        type: 'text',
        text: {
          preview_url: true,
          body: body?.entry[0]?.changes[0]?.value?.messages[0]?.interactive?.list_reply?.title,
        },
      });

      await botWebhook(
        body?.entry[0]?.changes[0]?.value?.messages[0]?.interactive?.list_reply?.title || 'aU1uLzohPGMncyrwlPIb',
        uid,
        body?.entry[0]?.changes[0]?.value?.contacts[0]?.wa_id,
        body?.entry[0]?.changes
          ? body?.entry[0]?.changes[0]?.value?.contacts[0]?.profile?.name
          : 'NA'
      );
    }
  } catch (err) {
    console.error('Error in saveWebhookConversation:', err);
    throw err;
  }
}

// Update message object in file (made async)
async function updateMessageObjectInFile(filePath, metaChatId, key, value) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const dataArray = JSON.parse(data);
    const message = dataArray.find((obj) => obj.metaChatId === metaChatId);

    if (message) {
      message[key] = value;
      await fs.writeFile(filePath, JSON.stringify(dataArray, null, 2));
      console.log(`Updated message with metaChatId ${metaChatId}: ${key} set to ${value}`);
    } else {
      console.error(`Message with metaChatId ${metaChatId} not found`);
    }
  } catch (error) {
    console.error('Error updating message in file:', error);
    throw error;
  }
}

// Download and save media (unchanged)
async function downloadAndSaveMedia(token, mediaId) {
  try {
    const url = `https://graph.facebook.com/v19.0/${mediaId}/`;
    const getUrl = await axios(url, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    const config = {
      method: 'get',
      url: getUrl?.data?.url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'arraybuffer',
    };

    const response = await axios(config);
    const ext = response.headers['content-type'].split('/')[1];
    const randomSt = randomstring.generate();
    const savingPath = `${__dirname}/../client/public/meta-media/${randomSt}`;
    await fs.writeFile(`${savingPath}.${ext}`, response.data);
    return `${randomSt}.${ext}`;
  } catch (error) {
    console.error('Error downloading media:', error);
    throw error;
  }
}

// Get current timestamp (unchanged)
function getCurrentTimestampInTimeZone(timezone) {
  const currentTimeInZone = moment.tz(timezone);
  return Math.round(currentTimeInZone.valueOf() / 1000);
}

// Add object to file (made async)
async function addObjectToFile(object, filePath) {
  try {
    const parentDir = path.dirname(filePath);
    if (!await fs.access(parentDir).then(() => true).catch(() => false)) {
      await fs.mkdir(parentDir, { recursive: true });
    }

    let existingData = [];
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      const data = await fs.readFile(filePath, 'utf8');
      existingData = JSON.parse(data);
      if (!Array.isArray(existingData)) {
        throw new Error('File does not contain an array');
      }
    }

    existingData.push(object);
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
  } catch (err) {
    console.error('Error adding object to file:', err);
    throw err;
  }
}

// Convert number to random string (unchanged)
function convertNumberToRandomString(number) {
  const mapping = {
    0: 'i',
    1: 'j',
    2: 'I',
    3: 'u',
    4: 'I',
    5: 'U',
    6: 'S',
    7: 'D',
    8: 'B',
    9: 'j',
  };

  const numStr = number.toString();
  let result = '';
  for (let i = 0; i < numStr.length; i++) {
    const digit = numStr[i];
    result += mapping[digit];
  }
  return result;
}

// Save JSON to file (made async)
async function saveJsonToFile(jsonData, dir) {
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}.json`;
    const jsonString = JSON.stringify(jsonData, null, 2);
    const directory = dir;
    if (!await fs.access(directory).then(() => true).catch(() => false)) {
      await fs.mkdir(directory, { recursive: true });
    }
    const filePath = path.join(directory, filename);
    await fs.writeFile(filePath, jsonString);
    console.log(`JSON data saved to ${filePath}`);
  } catch (err) {
    console.error('Error saving JSON to file:', err);
    throw err;
  }
}

// Validate email (unchanged)
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check mobile numbers (unchanged)
function areMobileNumbersFilled(array) {
  return array.every((item) => item.mobile);
}

// Get file extension (unchanged)
function getFileExtension(fileName) {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex !== -1 && dotIndex !== 0) {
    return fileName.substring(dotIndex + 1).toLowerCase();
  }
  return '';
}

// Write JSON to file (made async)
async function writeJsonToFile(filepath, jsonData) {
  try {
    const directory = path.dirname(filepath);
    await fs.mkdir(directory, { recursive: true });
    const jsonString = JSON.stringify(jsonData, null, 2);
    await fs.writeFile(filepath, jsonString, { flag: 'w' });
    return `JSON data has been written to '${filepath}'.`;
  } catch (err) {
    console.error('Error writing JSON to file:', err);
    throw err;
  }
}

// Delete file if exists (made async)
async function deleteFileIfExists(filePath) {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`File ${filePath} has been deleted.`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error deleting file ${filePath}:`, err);
      throw err;
    }
  }
}

// Read JSON from file (made async)
async function readJsonFromFile(filePath) {
  try {
    await fs.access(filePath); 
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading JSON file ${filePath}:`, err);
    return null; 
  }
}

// Read JSON file (updated for robustness)
async function readJSONFile(filePath, length) {
  try {
    console.log('Reading JSON file:', filePath);
    if (!await fs.access(filePath).then(() => true).catch(() => false)) {
      console.error('File not found:', filePath);
      return [];
    }

    let fileContent = await fs.readFile(filePath, 'utf8');

    // Fix common JSON issues
    if (fileContent.endsWith('}\n]  }\n]') || fileContent.endsWith('}\n]\n}\n]')) {
      console.log('Found invalid JSON ending, correcting...');
      fileContent = fileContent.replace(/}\n]\s*}\n]/, '\n}\n]');
      await fs.writeFile(filePath, fileContent);
      console.log('Corrected JSON written to file');
    }

    let jsonArray;
    try {
      jsonArray = JSON.parse(fileContent);
    } catch (error) {
      console.error('JSON parse error:', error.message);
      return [];
    }

    if (!Array.isArray(jsonArray)) {
      console.error('Invalid JSON format: not an array');
      return [];
    }

    return typeof length === 'number' && length > 0 ? jsonArray.slice(-length) : jsonArray;
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return [];
  }
}

// Update meta template message (updated to use Sequelize)
async function updateMetaTempletInMsg(uid, savObj, chatId, msgId) {
  try {
    console.log({ thisss: uid });
    const user = await User.findOne({ where: { uid } });
    if (!user) {
      return { success: false, msg: 'User not found' };
    }

    const userTimezone = getCurrentTimestampInTimeZone(user.timezone || Date.now() / 1000);
    const finalSaveMsg = {
      ...savObj,
      metaChatId: msgId,
      timestamp: userTimezone,
    };

    const chatPath = `${__dirname}/../conversations/inbox/${uid}/${chatId}.json`;
    await addObjectToFile(finalSaveMsg, chatPath);

    await Chat.update(
      {
        last_message_came: userTimezone,
        last_message: finalSaveMsg,
        is_opened: false,
      },
      { where: { chat_id: chatId, uid } }
    );

    await Chat.update({ is_opened: true }, { where: { chat_id: chatId, uid } });

    const io = getIOInstance();
    const room = await Room.findOne({ where: { uid } });
    const chats = await Chat.findAll({ where: { uid } });

    if (room) {
      io.to(room.socket_id).emit('update_conversations', { chats, notificationOff: true });
      io.to(room.socket_id).emit('push_new_msg', { msg: finalSaveMsg, chatId });
    }

    return { success: true };
  } catch (err) {
    console.error('Error in updateMetaTempletInMsg:', err);
    throw err;
  }
}

// Send API message (unchanged)
async function sendAPIMessage(obj, waNumId, waToken) {
  try {
    const url = `https://graph.facebook.com/v17.0/${waNumId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      ...obj,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${waToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data?.error) {
      return { success: false, message: data?.error?.message };
    }

    return {
      success: true,
      message: 'Message sent successfully!',
      data: data?.messages[0],
    };
  } catch (err) {
    console.error('Error in sendAPIMessage:', err);
    return { success: false, msg: err.toString(), err };
  }
}

// Send Meta message (updated to use Sequelize)
async function sendMetaMsg(uid, msgObj, toNumber, savObj, chatId) {
  try {
    const metaApi = await MetaApi.findOne({ where: { uid } });
    const user = await User.findOne({ where: { uid } }); // Fixed typo: MUNIuid -> uid

    if (!metaApi) {
      return { success: false, msg: 'Unable to find API' };
    }

    const waToken = metaApi.access_token;
    const waNumId = metaApi.business_phone_number_id;

    if (!waToken || !waNumId) {
      return { success: false, msg: 'Please add your meta token and phone number ID' };
    }

    const url = `https://graph.facebook.com/v17.0/${waNumId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toNumber,
      ...msgObj,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${waToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data?.error) {
      return { success: false, msg: data?.error?.message };
    }

    if (data?.messages[0]?.id) {
      const userTimezone = getCurrentTimestampInTimeZone(user?.timezone || Date.now() / 1000);
      const finalSaveMsg = {
        ...savObj,
        metaChatId: data?.messages[0]?.id,
        timestamp: userTimezone,
      };

      const chatPath = `${__dirname}/../conversations/inbox/${uid}/${chatId}.json`;
      await addObjectToFile(finalSaveMsg, chatPath);

      await Chat.update(
        {
          last_message_came: userTimezone,
          last_message: finalSaveMsg,
          is_opened: true,
        },
        { where: { chat_id: chatId, uid } }
      );

      const io = getIOInstance();
      const room = await Room.findOne({ where: { uid } });
      const chats = await Chat.findAll({ where: { uid } });

      if (room) {
        io.to(room.socket_id).emit('update_conversations', { chats, notificationOff: true });
        io.to(room.socket_id).emit('push_new_msg', { msg: finalSaveMsg, chatId });
      }

      const agentChat = await AgentChat.findOne({ where: { owner_uid: uid, chat_id: chatId } });
      if (agentChat) {
        const agentChats = await AgentChat.findAll({ where: { uid: agentChat.uid } });
        const chatIds = agentChats.map((i) => i.chat_id);
        const chatsGet = await Chat.findAll({ where: { chat_id: chatIds, uid } });
        const agentRoom = await Room.findOne({ where: { uid: agentChat.uid } });

        if (agentRoom) {
          io.to(agentRoom.socket_id).emit('update_conversations', { chats: chatsGet || [] });
          io.to(agentRoom.socket_id).emit('push_new_msg', { msg: finalSaveMsg, chatId });
        }
      }

      return { success: true, messageId: data?.messages[0]?.id };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in sendMetaMsg:', err);
    return { success: false, msg: err.toString(), err };
  }
}

// Merge arrays (unchanged)
function mergeArrays(arrA, arrB) {
  return arrB.map((objB) => {
    const matchingObject = arrA.find((objA) => objA.mobile === objB.sender_mobile);
    return matchingObject ? { ...objB, contact: matchingObject } : objB;
  });
}

// Get business phone number (unchanged)
async function getBusinessPhoneNumber(apiVersion, businessPhoneNumberId, bearerToken) {
  const url = `https://graph.facebook.com/${apiVersion}/${businessPhoneNumberId}`;
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Error fetching business phone number:', error);
    throw error;
  }
}

// Create Meta template (unchanged)
async function createMetaTemplet(apiVersion, waba_id, bearerToken, body) {
  const url = `https://graph.facebook.com/${apiVersion}/${waba_id}/message_templates`;
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Error creating Meta template:', error);
    throw error;
  }
}

// Get all Meta templates (unchanged)
async function getAllTempletsMeta(apiVersion, waba_id, bearerToken) {
  const url = `https://graph.facebook.com/${apiVersion}/${waba_id}/message_templates`;
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Error fetching Meta templates:', error);
    throw error;
  }
}

// Delete Meta template (unchanged)
async function delMetaTemplet(apiVersion, waba_id, bearerToken, name) {
  const url = `https://graph.facebook.com/${apiVersion}/${waba_id}/message_templates?name=${name}`;
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Error deleting Meta template:', error);
    throw error;
  }
}

// Send Meta template (updated to use Sequelize)
async function sendMetatemplet(toNumber, business_phone_number_id, token, template, example, dynamicMedia) {
  try {
    const checkBody = template?.components?.filter((i) => i.type === 'BODY');
    const getHeader = template?.components?.filter((i) => i.type === 'HEADER');
    const headerFormat = getHeader.length > 0 ? getHeader[0]?.format : '';

    let templ = {
      name: template?.name,
      language: { code: template?.language },
      components: [],
    };

    if (checkBody.length > 0) {
      const comp = checkBody[0]?.example?.body_text[0]?.map((i, key) => ({
        type: 'text',
        text: example[key] || i,
      }));
      if (comp) {
        templ.components.push({ type: 'body', parameters: comp });
      }
    }

    if (headerFormat === 'IMAGE' && getHeader.length > 0) {
      const media = await MetaTempletMedia.findOne({ where: { templet_name: template?.name } });
      templ.components.unshift({
        type: 'header',
        parameters: [
          {
            type: 'image',
            image: {
              link: dynamicMedia
                ? dynamicMedia
                : media
                  ? `${process.env.BACKURI}/media/${media.file_name}`
                  : getHeader[0].example?.header_handle[0],
            },
          },
        ],
      });
    }

    if (headerFormat === 'VIDEO' && getHeader.length > 0) {
      const media = await MetaTempletMedia.findOne({ where: { templet_name: template?.name } });
      templ.components.unshift({
        type: 'header',
        parameters: [
          {
            type: 'video',
            video: {
              link: dynamicMedia
                ? dynamicMedia
                : media
                  ? `${process.env.BACKURI}/media/${media.file_name}`
                  : getHeader[0].example?.header_handle[0],
            },
          },
        ],
      });
    }

    if (headerFormat === 'DOCUMENT' && getHeader.length > 0) {
      const media = await MetaTempletMedia.findOne({ where: { templet_name: template?.name } });
      templ.components.unshift({
        type: 'header',
        parameters: [
          {
            type: 'document',
            document: {
              link: dynamicMedia
                ? dynamicMedia
                : media
                  ? `${process.env.BACKURI}/media/${media.file_name}`
                  : getHeader[0].example?.header_handle[0],
              filename: 'document',
            },
          },
        ],
      });
    }

    const url = `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to: toNumber,
      type: 'template',
      template: templ,
    };

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Error sending Meta template:', error);
    throw error;
  }
}

// Get file info (made async)
async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const fileSizeInBytes = stats.size;
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    return { fileSizeInBytes, mimeType };
  } catch (err) {
    console.error('Error getting file info:', err);
    throw err;
  }
}

// Get session upload media Meta (unchanged)
async function getSessionUploadMediaMeta(apiVersion, app_id, bearerToken, fileSize, mimeType) {
  const url = `https://graph.facebook.com/${apiVersion}/${app_id}/uploads?file_length=${fileSize}&file_type=${mimeType}`;
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Error fetching session upload media:', error);
    throw error;
  }
}

// Upload file Meta (updated for robustness)
async function uploadFileMeta(sessionId, filePath, apiVersion, accessToken) {
  try {
    const fileData = await fs.readFile(filePath);
    const url = `https://graph.facebook.com/${apiVersion}/${sessionId}`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `OAuth ${accessToken}`,
        'Content-Type': 'application/pdf',
        Cookie: 'ps_l=0; ps_n=0',
      },
      body: fileData,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Error response:', errorResponse);
      return { success: false, data: errorResponse };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, data: error };
  }
}

// Get Meta number detail (unchanged)
async function getMetaNumberDetail(apiVersion, business_phone_number_id, bearerToken) {
  const url = `https://graph.facebook.com/${apiVersion}/${business_phone_number_id}`;
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Error fetching Meta number detail:', error);
    throw error;
  }
}

// Add days to timestamp (unchanged)
function addDaysToCurrentTimestamp(days) {
  const currentTimestamp = Date.now();
  const millisecondsToAdd = days * 24 * 60 * 60 * 1000;
  return currentTimestamp + millisecondsToAdd;
}

// Update user plan (updated to use Sequelize)
async function updateUserPlan(plan, uid) { 
  try {
    console.log({ plan });
    const planDays = parseInt(plan?.plan_duration_in_days || 0);
    const timeStamp = addDaysToCurrentTimestamp(planDays);
    await User.update(
      { plan: JSON.stringify(plan), plan_expire: timeStamp },
      { where: { uid } }
    );
  } catch (err) {
    console.error('Error updating user plan:', err);
    throw err;
  }
}

// Validate email (unchanged)
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Send email (unchanged)
async function sendEmail(host, port, email, pass, html, subject, from, to) {
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === '465',
      auth: { user: email, pass },
    });

    const info = await transporter.sendMail({
      from: `${from || 'Email From'} <${email}>`,
      to,
      subject: subject || 'Email',
      html,
    });

    return { success: true, info };
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, err: err.toString() || 'Invalid Email' };
  }
}

// Get user signups by month (updated to use Sequelize)
async function getUserSignupsByMonth() {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const users = await User.findAll();
  const { paidUsers, unpaidUsers } = users.reduce(
    (acc, user) => {
      const planExpire = user.plan_expire ? new Date(parseInt(user.plan_expire)) : null;
      const isPaid = planExpire ? planExpire > currentDate : false;
      if (isPaid) {
        acc.paidUsers.push(user);
      } else {
        acc.unpaidUsers.push(user);
      }
      return acc;
    },
    { paidUsers: [], unpaidUsers: [] }
  );

  const paidSignupsByMonth = months.map((month, monthIndex) => {
    const usersInMonth = paidUsers.filter((user) => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === monthIndex && userDate.getFullYear() === currentYear;
    });
    const numberOfSignups = usersInMonth.length;
    const userEmails = usersInMonth.map((user) => user.email);
    return { month, numberOfSignups, userEmails, paid: true };
  });

  const unpaidSignupsByMonth = months.map((month, monthIndex) => {
    const usersInMonth = unpaidUsers.filter((user) => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === monthIndex && userDate.getFullYear() === currentYear;
    });
    const numberOfSignups = usersInMonth.length;
    const userEmails = usersInMonth.map((user) => user.email);
    return { month, numberOfSignups, userEmails, paid: false };
  });

  return { paidSignupsByMonth, unpaidSignupsByMonth };
}

// Get user orders by month (updated to use Sequelize)
async function getUserOrderssByMonth() {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const orders = await Order.findAll(); // Assuming Order model exists
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = months[monthIndex];
    const ordersInMonth = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === currentYear;
    });
    return { month, numberOfOders: ordersInMonth.length };
  });
}

// Get number of days from timestamp (unchanged)
function getNumberOfDaysFromTimestamp(timestamp) {
  if (!timestamp || isNaN(timestamp)) {
    return 0;
  }

  const currentTimestamp = Date.now();
  if (timestamp <= currentTimestamp) {
    return 0;
  }

  const millisecondsInADay = 1000 * 60 * 60 * 24;
  return Math.ceil((timestamp - currentTimestamp) / millisecondsInADay);
}

// Get user plan days (updated to use Sequelize)
async function getUserPlayDays(uid) {
  try {
    const user = await User.findOne({ where: { uid } });
    if (!user || !user.plan_expire) {
      return 0;
    }
    return getNumberOfDaysFromTimestamp(user.plan_expire);
  } catch (err) {
    console.error('Error fetching user plan days:', err);
    return 0;
  }
}

// Check folder exists (made async)
async function folderExists(folderPath) {
  try {
    await fs.access(folderPath);
    return true;
  } catch (error) {
    return false;
  }
}

// Download and extract file (updated for async/await)
async function downloadAndExtractFile(filesObject, outputFolderPath) {
  try {
    const uploadedFile = filesObject.file;
    if (!uploadedFile) {
      return { success: false, msg: 'No file data found in FormData' };
    }

    const outputPath = path.join(outputFolderPath, uploadedFile.name);
    await new Promise((resolve, reject) => {
      uploadedFile.mv(outputPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await fs.createReadStream(outputPath)
      .pipe(unzipper.Extract({ path: outputFolderPath }))
      .promise();

    await fs.unlink(outputPath);
    return { success: true, msg: 'App was successfully installed/updated' };
  } catch (error) {
    console.error('Error downloading and extracting file:', error);
    return { success: false, msg: error.message };
  }
}

// Fetch profile (unchanged)
async function fetchProfileFun(mobileId, token) {
  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${mobileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.error
      ? { success: false, msg: data.error?.message }
      : { success: true, data };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

// Return widget (unchanged)
function returnWidget(image, imageSize, url, position) {
  let style = '';
  switch (position) {
    case 'TOP_RIGHT':
      style = 'position: fixed; top: 15px; right: 15px;';
      break;
    case 'TOP_CENTER':
      style = 'position: fixed; top: 15px; right: 50%; transform: translateX(-50%);';
      break;
    case 'TOP_LEFT':
      style = 'position: fixed; top: 15px; left: 15px;';
      break;
    case 'BOTTOM_RIGHT':
      style = 'position: fixed; bottom: 15px; right: 15px;';
      break;
    case 'BOTTOM_CENTER':
      style = 'position: fixed; bottom: 15px; right: 50%; transform: translateX(-50%);';
      break;
    case 'BOTTOM_LEFT':
      style = 'position: fixed; bottom: 15px; left: 15px;';
      break;
    case 'ALL_CENTER':
      style = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);';
      break;
    default:
      style = 'position: fixed; top: 15px; right: 15px;';
      break;
  }

  return `
    <a href="${url}">
      <img src="${image}" alt="Widget" id="widget-image"
        style="${style} width: ${imageSize}px; height: auto; cursor: pointer; z-index: 9999;">
    </a>
    <div class="widget-container" id="widget-container"
      style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #fff; border: 1px solid #ccc; border-radius: 5px; padding: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); display: none; z-index: 9999;">
      <span class="close-btn" id="close-btn"
        style="position: absolute; top: 5px; right: 5px; cursor: pointer;">×</span>
    </div>
    <script>
      const widgetImage = document.getElementById('widget-image');
      const widgetContainer = document.getElementById('widget-container');
      widgetImage.addEventListener('click', function () {
        window.location.href = '${url}';
      });
      const closeBtn = document.getElementById('close-btn');
      closeBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        widgetContainer.style.display = 'none';
      });
    </script>
  `;
}

// Generate WhatsApp URL (unchanged)
function generateWhatsAppURL(phoneNumber, text) {
  const baseUrl = 'https://wa.me/';
  const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `${baseUrl}${formattedPhoneNumber}?text=${encodedText}`;
}

// Make request (unchanged)
async function makeRequest({ method, url, body = null, headers = [] }) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const headersObject = headers.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    const requestBody =
      method === 'GET' || method === 'DELETE'
        ? undefined
        : JSON.stringify(
            body.reduce((acc, { key, value }) => {
              acc[key] = value;
              return acc;
            }, {})
          );

    const config = {
      method,
      headers: headersObject,
      body: requestBody,
      signal: controller.signal,
    };

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, msg: `HTTP error ${response.status}` };
    }

    const data = await response.json();
    return (typeof data === 'object' || Array.isArray(data))
      ? { success: true, data }
      : { success: false, msg: 'Invalid response format' };
  } catch (error) {
    return { success: false, msg: error.message };
  }
}

// Replace placeholders (unchanged)
function replacePlaceholders(template, data) {
  return template.replace(/{{{([^}]+)}}}/g, (match, key) => {
    key = key.trim();
    const arrayMatch = key.match(/^\[(\d+)]\.(.+)$/);
    if (arrayMatch) {
      const index = parseInt(arrayMatch[1], 10);
      const property = arrayMatch[2];
      if (Array.isArray(data) && index >= 0 && index < data.length) {
        let value = data[index];
        const nestedKeys = property.split('.');
        for (const k of nestedKeys) {
          if (value && Object.prototype.hasOwnProperty.call(value, k)) {
            value = value[k];
          } else {
            return 'NA';
          }
        }
        return value !== undefined ? value : 'NA';
      }
      return 'NA';
    }

    const keys = key.split('.');
    let value = data;
    for (const k of keys) {
      if (value && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k];
      } else {
        return 'NA';
      }
    }
    return value !== undefined ? value : 'NA';
  });
}

// Razorpay capture payment (unchanged)
const rzCapturePayment = (paymentId, amount, razorpayKey, razorpaySecret) => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const auth = 'Basic ' + Buffer.from(razorpayKey + ':' + razorpaySecret).toString('base64');

  return new Promise((resolve, reject) => {
    fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error('Error capturing payment:', data.error);
          reject(data.error);
        } else {
          console.log('Payment captured successfully:', data);
          resolve(data);
        }
      })
      .catch((error) => {
        console.error('Error capturing payment:', error);
        reject(error);
      });
  });
};

// Validate Facebook token (unchanged)
async function validateFacebookToken(userAccessToken, appId, appSecret) {
  const appAccessToken = `${appId}|${appSecret}`;
  const url = `https://graph.facebook.com/debug_token?input_token=${userAccessToken}&access_token=${appAccessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data && data.data.is_valid
      ? { success: true, response: data }
      : { success: false, response: data };
  } catch (error) {
    console.error('Error validating Facebook token:', error);
    return { success: false, response: error };
  }
};

// Parse CSV file (unchanged)
const parseCSVFile = async (fileData) => {
  try {
    return csv.parse(fileData, { columns: true, skip_empty_lines: true });
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return null;
  }
};

module.exports = {
  isValidEmail,
  downloadAndExtractFile,
  folderExists,
  sendAPIMessage,
  sendEmail,
  getUserPlayDays,
  getNumberOfDaysFromTimestamp,
  getUserOrderssByMonth,
  getUserSignupsByMonth,
  validateEmail,
  updateUserPlan,
  getFileInfo,
  uploadFileMeta,
  getMetaNumberDetail,
  getSessionUploadMediaMeta,
  sendMetaMsg,
  updateMetaTempletInMsg,
  sendMetatemplet,
  delMetaTemplet,
  getAllTempletsMeta,
  createMetaTemplet,
  getBusinessPhoneNumber,
  botWebhook,
  mergeArrays,
  readJSONFile,
  writeJsonToFile,
  getCurrentTimestampInTimeZone,
  saveWebhookConversation,
  saveJsonToFile,
  readJsonFromFile,
  deleteFileIfExists,
  areMobileNumbersFilled,
  getFileExtension,
  fetchProfileFun,
  returnWidget,
  generateWhatsAppURL,
  makeRequest,
  replacePlaceholders,
  runChatbot,
  rzCapturePayment,
  validateFacebookToken,
  addObjectToFile,
  convertNumberToRandomString,
  parseCSVFile,
};