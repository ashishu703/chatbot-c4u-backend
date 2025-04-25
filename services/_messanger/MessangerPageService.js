const ChatRepository = require("../../repositories/chatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const MessangerService = require("./MessangerService");


module.exports = class MessangerPageService extends MessangerService {
    page;
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async initActivePage(pageId) {
        this.page = await FacebookPageRepository.findByPageId(pageId);
        this.initPage();
    }

    async initInactivePage(pageId) {
        this.page = await FacebookPageRepository.findInactiveByPageId(pageId);
        this.initPage();
    }

    async initPage() {
        this.accessToken = this.page.token;
        return this;
    }

    async fetchProfile(psid) {
        return this.get(`/${psid}`, {
            fields: 'from',
            access_token: this.accessToken
        });
    }

    async fetchAndSavePages(accountId) {
        const { data: pages } = await this.fetchPages();

        pages.forEach(async (page) => {
            await this.savePage(page, accountId);
        });

        return pages;
    }
    async fetchPages() {
        return await this.get('/me/accounts?limit=1000', { fields: 'id,name,access_token' });
    }

    async savePage(page, accountId) {
        await FacebookPageRepository.updateOrCreate(
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
        this.subscribeWebhooks();
        await FacebookPageRepository.activatePagesByUserId(this.page.uid, [pageId]);
        await FacebookPageRepository.deleteInActiveByUserId(this.page.uid);
    }

    async removePage(pageId) {

        await this.initMeta();
        await this.initActivePage(pageId);
        this.unsubscribeWebhooks();
        await FacebookPageRepository.deleteByPageId(pageId);
        await ChatRepository.removePlatformChat(this.page.uid, 'MESSENGER');
    }


    subscribeWebhooks() {
        this.post(`/${this.page.page_id}/subscribed_apps`, {
            "subscribed_fields": [
                "messaging_account_linking",
                "messages",
                "message_reads",
                "message_reactions",
                "message_edits",
                "message_echoes",
                "message_deliveries",
                "message_context"
            ].join(',')
        }).then(response => {
            console.log(
                "Subscription successfully activated: " + this.page.page_id
            )
        }).catch(err => {
            console.log("Subscription activation failed: " + this.page.page_id, err)
        });
    }

    unsubscribeWebhooks() {
        this.delete(`/${this.page.page_id}/subscribed_apps`).then(response => {
            console.log(
                "Subscription successfully removed: " + this.page.page_id
            )
        }).catch(err => {
            console.log("Subscription removal failed: " + this.page.page_id, err)
        });
    }
}

