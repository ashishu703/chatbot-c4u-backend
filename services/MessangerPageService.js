const ChatRepository = require("../repositories/ChatRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessengerPageApi = require("../api/Messanger/MessengerPageApi");
const { MESSANGER } = require("../types/social-platform-types");
const { INACTIVE } = require("../types/facebook-page-status.types");
const { Op } = require("sequelize");

class MessangerPageService {
  constructor(user = null, accessToken = null) {
    this.user = user;
    this.facebookPageRepository = new FacebookPageRepository();
    this.chatRepository = new ChatRepository();
    this.messengerPageApi = new MessengerPageApi(user, accessToken);
  }

  async initActivePage(pageId) {
    this.page = await this.facebookPageRepository.findByPageId(pageId);
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
    await this.messengerPageApi.initMeta();

    const { data: pages } = await this.messengerPageApi.fetchPages();
    for await (const page of pages) {
      const {
        id,
        name,
        picture: pictureObject,
        access_token: accessToken,
      } = page;
      const picture = pictureObject?.data?.url || "";
      await this.savePage(id, name, picture, accessToken, accountId);
    };

    return pages;
  }


  async savePage(id, name, picture, accessToken, accountId) {

    return this.facebookPageRepository.updateOrCreate(
      {
        uid: this.user.uid,
        account_id: accountId,
        page_id: id,
        name,
        token: accessToken,
        avatar: picture,
        status: INACTIVE
      },
      {
        uid: this.user.uid,
        account_id: accountId,
        page_id: id,
      }
    );
  }

  async activatePage(userId, pageId) {
    await this.messengerPageApi.initMeta();
    const pages = await this.facebookPageRepository.find({ where: { page_id: { [Op.in]: [pageId] } } });
    for await (const page of pages) {
      const pageId = page.page_id;
      const accessToken = page.token;
      await this.messengerPageApi.setToken(accessToken).subscribeWebhooks(pageId);
      await this.facebookPageRepository.activatePagesByUserId(userId, [pageId]);
      await this.facebookPageRepository.deleteInActiveByUserId(userId);
    }

  }

  async removePage(pageId) {
    const page = await this.facebookPageRepository.findByPageId(pageId);
    await this.messengerPageApi.initMeta();
    await this.messengerPageApi.setToken(page.token).unsubscribeWebhooks(pageId);
    await this.facebookPageRepository.deleteByPageId(pageId);
  }


};


module.exports = MessangerPageService