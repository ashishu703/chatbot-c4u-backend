class ContactEventService {
  async processContactEvent(data, topic, partition, message) {
    try {
      const { event, uid, contact } = data;
      if (!contact || !contact.mobile) return { success: false };
      console.log(`[ContactEvent] ${event} uid=${uid} mobile=${contact.mobile}`);
      return { success: true };
    } catch (err) {
      console.error("ContactEventService error:", err);
      return { success: false };
    }
  }
}

module.exports = ContactEventService;
