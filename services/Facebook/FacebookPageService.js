const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const FacebookService = require("./FacebookService");


module.exports = class FacebookPageService extends FacebookService {
    page;
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async setCurrentPage(pageId) {
        this.page = await FacebookPageRepository.findByPageId(pageId); 
        this.accessToken = this.page.token;
        return this;
    }

    async fetchProfile(psid) {  
        return this.get(`/${psid}`, {
            fields: 'first_name,last_name,profile_pic',
            access_token: this.accessToken
        });
    }

    async fetchAndSavePages() {
        const { data: pages } = await this.fetchPages();

        pages.forEach(async (page) => {
            await this.savePage(page);
        });

        return pages;
    }
    async fetchPages() {
        return await this.get('/me/accounts', { fields: 'id,name,access_token' });
    }

    async savePage(page) {
        await FacebookPageRepository.updateOrCreate(
            this.user.uid,
            page.id,
            page.name,
            page.access_token
        );
    }
}