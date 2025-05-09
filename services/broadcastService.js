const randomstring = require("randomstring");
const UserRepository = require("../repositories/userRepository");
const AdminRepository = require("../repositories/AdminRepository");
const MetaApiRepository = require("../repositories/metaApiRepository");
const ContactRepository = require("../repositories/contactRepository");
const BroadcastRepository = require("../repositories/broadcastRepository");
const BroadcastLogRepository = require("../repositories/broadcastLogRepository");
const { getMetaNumberDetail } = require("../functions/function");

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
  }
   async getUserDashboardData(userUid) {
    const metaApi = await this.metaApiRepository.findByUid(userUid);
    if (!metaApi) {
      throw new Error("We could not find your Meta API keys");
    }
    const totalBroadcasts = await this.broadcastRepository.count({ where: { uid: userUid } });
    const totalBroadcastLogs = await this.broadcastLogRepository.count({ where: { uid: userUid } });
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
      throw new Error("Admin not found");
    }
    const totalUsers = await this.userRepository.count();
    const totalBroadcasts = await this.broadcastRepository.count({ where: { uid: adminUid } });
    const totalBroadcastLogs = await this.broadcastLogRepository.count({ where: { uid: adminUid } });

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
      const logs = await this.broadcastLogRepository.findByBroadcastId(broadcast.broadcast_id, adminUid);
      const stats = {
        broadcast_id: broadcast.broadcast_id,
        totalLogs: logs.length,
        getSent: logs.filter((log) => log.delivery_status === "sent").length,
        totalDelivered: logs.filter((log) => log.delivery_status === "delivered").length,
        totalRead: logs.filter((log) => log.delivery_status === "read").length,
        totalFailed: logs.filter((log) => log.delivery_status === "failed").length,
        totalPending: logs.filter((log) => log.delivery_status === "PENDING").length,
      };

      broadcastLogs.push({
        broadcast: broadcast,
        stats,
        logs: logs,
      });
    }

    return broadcastLogs;
  }

   async addBroadcast({ title, templet, phonebook, scheduleTimestamp, example, user }) {
    const metaApi = await this.metaApiRepository.findByUid(user.uid);
    if (!metaApi) {
      throw new Error("We could not find your Meta API keys");
    }

    const contacts = await this.contactRepository.findByPhonebookId(phonebook.id, user.uid);
    if (!contacts.length) {
      throw new Error("The phonebook you have selected does not have any mobile number in it");
    }

    const metaDetails = await getMetaNumberDetail("v18.0", metaApi.business_phone_number_id, metaApi.access_token);
    if (metaDetails.error) {
      throw new Error("Either your Meta API keys are invalid or your access token has been expired");
    }

    const broadcast_id = randomstring.generate();
    const userData = await this.userRepository.findById(user.uid);

    const broadcastLogs = contacts.map((contact) => ({
      uid: user.uid,
      broadcast_id,
      templet_name: templet.name || "NA",
      sender_mobile: metaDetails.display_phone_number,
      send_to: contact.mobile,
      delivery_status: "PENDING",
      example,
      contact,
    }));
    await this.broadcastLogRepository.bulkCreate(broadcastLogs);

    const broadcast = {
      broadcast_id,
      uid: user.uid,
      title,
      templet,
      phonebook,
      status: "QUEUE",
      schedule: scheduleTimestamp ? new Date(scheduleTimestamp) : null,
      timezone: userData.timezone || "Asia/Kolkata",
    };

    await this.broadcastRepository.create(broadcast);

    return { success: true, msg: "Your broadcast has been added" };
  }

   async changeBroadcastStatus(broadcast_id, status, uid) {
    await this.broadcastRepository.updateStatus(broadcast_id, status, uid);
    return { success: true, msg: "Campaign status updated" };
  }

   async deleteBroadcast(broadcast_id, uid) {
    await this.broadcastRepository.delete(broadcast_id, uid);
    await this.broadcastLogRepository.deleteByBroadcastId(broadcast_id, uid);
    return { success: true, msg: "Broadcast was deleted" };
  }
}

module.exports = DashboardService;
