const randomstring = require("randomstring");
const UserRepository = require("../repositories/UserRepository");
const AdminRepository = require("../repositories/AdminRepository");
const MetaApiRepository = require("../repositories/metaApiRepository");
const ContactRepository = require("../repositories/ContactRepository");
const BroadcastRepository = require("../repositories/broadcastRepository");
const BroadcastLogRepository = require("../repositories/broadcastLogRepository");
const { getMetaNumberDetail } = require("../functions/function");
const MetaApiKeysNotfoundException = require("../exceptions/CustomExceptions/MetaApiKeysNotfoundException");
const AdminNotFoundException = require("../exceptions/CustomExceptions/AdminNotFoundException");
const PhonebookNoMobileException = require("../exceptions/CustomExceptions/PhonebookNoMobileException");
const MetaKeysOrTokenInvalid = require("../exceptions/CustomExceptions/MetaKeysOrTokenInvalid");
const { SENT, DELIVERED, READ, FAILED, PENDING } = require("../types/broadcast-delivery-status.types");
const { metaApiVersion, defaultTimeZone } = require("../config/app.config");
const { QUEUE } = require("../types/broadcast-execution-status.types");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const { generateUid } = require("../utils/auth.utils");
const WhatsappProfileApi = require("../api/Whatsapp/WhatsappProfileApi");

class DashboardService {
  userRepository;
  adminRepository;
  metaApiRepository;
  contactRepository;
  broadcastRepository;
  broadcastLogRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.adminRepository = new AdminRepository();
    this.metaApiRepository = new MetaApiRepository();
    this.contactRepository = new ContactRepository();
    this.broadcastRepository = new BroadcastRepository();
    this.broadcastLogRepository = new BroadcastLogRepository();
    this.accountRepository = new SocialAccountRepository();
    this.whatsappProfileApi = new WhatsappProfileApi();
  }
  async getUserDashboardData(userUid) {
    const metaApi = await this.metaApiRepository.findByUid(userUid);
    if (!metaApi) {
      throw new MetaApiKeysNotfoundException();
    }
    const totalBroadcasts = await this.broadcastRepository.count({
      where: { uid: userUid },
    });
    const totalBroadcastLogs = await this.broadcastLogRepository.count({
      where: { uid: userUid },
    });
    const userData = await this.userRepository.findById(userUid);

    return {
      totalBroadcasts,
      totalBroadcastLogs,
      userDetails: userData,
    };
  }

  async getAdminDashboardData(adminUid) {
    const admin = await this.adminRepository.findById(adminUid);
    if (!admin) {
      throw new AdminNotFoundException();
    }
    const totalUsers = await this.userRepository.count();
    const totalBroadcasts = await this.broadcastRepository.count({
      where: { uid: adminUid },
    });
    const totalBroadcastLogs = await this.broadcastLogRepository.count({
      where: { uid: adminUid },
    });

    return {
      totalUsers,
      totalBroadcasts,
      totalBroadcastLogs,
      adminDetails: admin,
    };
  }
  async getAdminBroadcastLogs(adminUid) {
    const broadcasts = await this.broadcastRepository.findByAdminUid(adminUid);
    const broadcastLogs = [];
    for (const broadcast of broadcasts) {
      const logs = await this.broadcastLogRepository.findByBroadcastId(
        broadcast.broadcast_id,
        adminUid
      );

      const stats = {
        broadcast_id: broadcast.broadcast_id,
        totalLogs: logs.length,
        getSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        totalFailed: 0,
        totalPending: 0,
      };

      for (const log of logs) {
        switch (log.delivery_status) {
          case SENT:
            stats.getSent++;
            break;
          case DELIVERED:
            stats.totalDelivered++;
            break;
          case READ:
            stats.totalRead++;
            break;
          case FAILED:
            stats.totalFailed++;
            break;
          case PENDING:
            stats.totalPending++;
            break;
        }
      }


      broadcastLogs.push({
        broadcast: broadcast,
        stats,
        logs: logs,
      });
    }

    return broadcastLogs;
  }

  async addBroadcast(
    title,
    templet,
    phonebook,
    scheduleTimestamp,
    example,
    user,
  ) {

    const account = await this.accountRepository.getWhatsappAccount(user.uid);
    if (!account) {
      throw new MetaApiKeysNotfoundException();
    }


    const contacts = await this.contactRepository.findByPhonebookId(
      phonebook.id,
      user.uid
    );


    if (!contacts.length) {
      throw new PhonebookNoMobileException();
    }

    await this.whatsappProfileApi.initMeta();

    const broadcast_id = generateUid();

    const userData = await this.userRepository.findByUid(user.uid);

    const broadcast = await this.broadcastRepository.create({
      broadcast_id,
      uid: user.uid,
      title,
      templet: JSON.stringify(templet),
      phonebook_id: phonebook.id,
      status: QUEUE,
      schedule: scheduleTimestamp ? new Date(scheduleTimestamp) : null,
      timezone: userData.timezone || defaultTimeZone,
    });

    const broadcastLogs = contacts.map((contact) => ({
      uid: user.uid,
      broadcast_id: broadcast.id,
      templet_name: templet.name,
      sender_id: account.username,
      send_to: contact.mobile,
      delivery_status: PENDING,
      example,
      contact,
    }));

    return this.broadcastLogRepository.bulkCreate(broadcastLogs);
  }

  async changeBroadcastStatus(broadcast_id, status, uid) {
    return this.broadcastRepository.updateStatus(broadcast_id, status, uid);
  }

  async deleteBroadcast(broadcast_id, uid) {
    return this.broadcastRepository.delete({broadcast_id, uid});
  }


  async getBroadcasts(uid) {
    return this.broadcastRepository.find(
      {
        where: {
          uid,
        }
      },
      ["phonebook"]
    );
  }

  async getBroadcastLogs(broadcast_id, uid) {
    const logs = await this.broadcastLogRepository.find({ broadcast_id, uid });

    const getSent = logs?.filter(i => i.delivery_status === "sent")

    const totalDelivered = logs?.filter(i => i.delivery_status === "delivered")

    const totalRead = logs?.filter(i => i.delivery_status === "read")
    const totalFailed = logs?.filter(i => i.delivery_status === "failed")

    const totalPending = logs?.filter(i => i.delivery_status === "PENDING")


    return {
      data: logs,
      success: true,
      totalLogs: logs?.length,
      getSent: getSent?.length,
      totalRead: totalRead?.length,
      totalFailed: totalFailed?.length,
      totalPending: totalPending?.length,
      totalDelivered: totalDelivered?.length
    }

  }
}

module.exports = DashboardService;
