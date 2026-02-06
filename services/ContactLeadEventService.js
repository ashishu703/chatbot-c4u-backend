class ContactLeadEventService {
  async processLeadEvent(data, topic, partition, message) {
    try {
      const { name, mobile, email } = data;
      if (!mobile && !email) return { success: false };
      console.log(`[ContactLead] name=${name} mobile=${mobile} email=${email}`);
      return { success: true };
    } catch (err) {
      console.error("ContactLeadEventService error:", err);
      return { success: false };
    }
  }
}

module.exports = ContactLeadEventService;
