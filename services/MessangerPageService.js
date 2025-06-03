const ChatRepository = require("../repositories/ChatRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessengerPageApi = require("../api/Messanger/MessengerPageApi");
const { MESSANGER } = require("../types/social-platform-types");

class MessangerPageService {
  page;
  constructor(user = null, accessToken = null) {
    this.facebookPageRepository = new FacebookPageRepository();
    this.chatRepository = new ChatRepository();
    this.messengerPageApi = new MessengerPageApi(user, accessToken);
  }

  async initActivePage(pageId) {
    this.page = await this.facebookPageRepository.findByPageId(pageId);
    this.initPage();
  }

  async initInactivePage(pageId) {
    this.page = await this.facebookPageRepository.findInactiveByPageId(pageId);
    this.initPage();
  }

  async initPage() {
    this.accessToken = this.page.token;
    return this;
  }

  async fetchProfile(psid) {
    return this.get(`/${psid}`, {
      fields: "from",
      access_token: this.accessToken,
    });
  }

  async fetchAndSavePages(accountId) {
    const { data: pages } = await this.messengerPageApi.fetchPages();

    pages.forEach(async (page) => {
      await this.savePage(page, accountId);
    });

    return pages;
  }


  async savePage(page, accountId) {
    await this.facebookPageRepository.updateOrCreate(
      this.user.uid,
      accountId,
      page.id,
      page.name,
      page.access_token,
      false
    );
  }

  async activatePage(pageId) {
    await this.initMeta();
    await this.initInactivePage(pageId);
    await this.messengerPageApi.subscribeWebhooks(pageId);
    await this.facebookPageRepository.activatePagesByUserId(this.page.uid, [pageId]);
    await this.facebookPageRepository.deleteInActiveByUserId(this.page.uid);
  }

  async removePage(pageId) {
    await this.initMeta();
    await this.initActivePage(pageId);
    await this.messengerPageApi.unsubscribeWebhooks(pageId);
    await this.facebookPageRepository.deleteByPageId(pageId);
    await this.chatRepository.removePlatformChat(this.page.uid, MESSANGER);
  }


};


module.exports = MessangerPageService