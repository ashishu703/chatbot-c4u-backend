const SmiService = require("../../services/SmiService");
const fetch = require("node-fetch");
const InstagramApi = require("./InstagramApi");
class InstagramAuthApi extends InstagramApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }




    async authorizeAuthCode(code, redirectUri = null) {

        // Exchange code via Facebook Graph OAuth (Meta) instead of legacy Instagram endpoint
        // Use the redirect_uri passed from frontend, or fallback to config
        const finalRedirectUri = redirectUri || this.redirectUri || (new SmiService()).prepareInstagramRedirectUri();

        const params = new URLSearchParams();
        params.append('client_id', this.AppId);
        params.append('client_secret', this.AppSecret);
        params.append('redirect_uri', finalRedirectUri);
        params.append('code', code);

        // Facebook Graph token endpoint (respect configured graph version when available)
        const graphVersion = this.oauthGraphVersion || 'v18.0';
        console.log('🔍 Instagram OAuth - exchanging code with:', {
            clientId: this.AppId ? '***' : 'missing',
            clientSecret: this.AppSecret ? '***' : 'missing',
            redirectUri: finalRedirectUri,
            graphVersion,
            code: code ? '***' : 'missing'
        });
        
        const response = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Instagram OAuth token exchange failed:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                url: `https://graph.facebook.com/${graphVersion}/oauth/access_token`
            });
            throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
        }

        return this.handleResponse(response);
    }


    async getLongLiveToken() {
        // Use Facebook long-lived token exchange for Meta user tokens
        const graphVersion = this.oauthGraphVersion || 'v18.0';
        const url = `https://graph.facebook.com/${graphVersion}/oauth/access_token`;
        
        console.log('🔍 Exchanging for long-lived token...');
        
        const response = await fetch(`${url}?grant_type=fb_exchange_token&client_id=${this.AppId}&client_secret=${this.AppSecret}&fb_exchange_token=${this.accessToken}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to get long-lived token:', response.status, errorText);
            // Return original token if exchange fails
            return { access_token: this.accessToken };
        }
        
        const result = await response.json();
        console.log('✅ Long-lived token obtained:', !!result.access_token);
        return result;
    }

    async fetchOwnerProfile() {
        // Resolve Instagram Business Account via Facebook Graph Pages
        const graphVersion = this.oauthGraphVersion || 'v18.0';
        console.log('🔍 InstagramAuthApi.fetchOwnerProfile - starting with token:', this.accessToken ? '***' : 'missing');
        
        try {
            // 1) Get user pages
            const pagesUrl = `https://graph.facebook.com/${graphVersion}/me/accounts?access_token=${this.accessToken}&fields=id,name,access_token`;
            console.log('🔍 Fetching pages from:', pagesUrl);
            
            const pagesResp = await fetch(pagesUrl);
            if (!pagesResp.ok) {
                const errorText = await pagesResp.text();
                console.error('❌ Failed to fetch pages:', pagesResp.status, errorText);
                throw new Error(`Failed to fetch pages: ${pagesResp.status}`);
            }
            
            const pagesData = await pagesResp.json();
            const pages = pagesData?.data || [];
            console.log('📋 Found pages:', pages.length);
            
            // 2) Find first page with instagram_business_account
            for (const page of pages) {
                const igUrl = `https://graph.facebook.com/${graphVersion}/${page.id}?fields=instagram_business_account&access_token=${page.access_token || this.accessToken}`;
                console.log('🔍 Checking page for IG account:', page.id, page.name);
                
                const igResp = await fetch(igUrl);
                if (igResp.ok) {
                    const igData = await igResp.json();
                    const ig = igData?.instagram_business_account;
                    if (ig && ig.id) {
                        console.log('✅ Found Instagram business account:', ig.id);
                        
                        // 3) Fetch IG account details
                        const igDetailsUrl = `https://graph.facebook.com/${graphVersion}/${ig.id}?fields=id,username,name,profile_picture_url&access_token=${page.access_token || this.accessToken}`;
                        const igDetailsResp = await fetch(igDetailsUrl);
                        
                        if (igDetailsResp.ok) {
                            const igDetails = await igDetailsResp.json();
                            console.log('✅ IG account details fetched:', {
                                id: igDetails.id,
                                username: igDetails.username,
                                name: igDetails.name
                            });
                            
                            return {
                                id: igDetails.id,
                                profile_picture_url: igDetails.profile_picture_url || null,
                                username: igDetails.username || '',
                                name: igDetails.name || '',
                                user_id: igDetails.id,
                                page_id: page.id,
                                page_access_token: page.access_token
                            };
                        }
                    }
                }
            }
            
            console.log('⚠️ No Instagram business account found in pages');
            // Fallback empty
            return { id: '', profile_picture_url: null, username: '', name: '', user_id: '' };
            
        } catch (error) {
            console.error('❌ Error in fetchOwnerProfile:', error);
            throw error;
        }
    }

    async subscribeWebhook(profile) {
        console.log('🔍 instagram profile ',profile);
        // Subscribe app to IG Business account events using the PAGE ID and PAGE access token
        const graphVersion = this.oauthGraphVersion || 'v18.0';
        const pageId = profile.page_id;
        const pageAccessToken = profile.page_access_token || this.accessToken;
        const url = `https://graph.facebook.com/${graphVersion}/${pageId}/subscribed_apps`;
        
        console.log('🔍 Subscribing to webhook for Page:', pageId);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                access_token: pageAccessToken,
                subscribed_fields: this.subscribedFields.join(','),
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to subscribe webhook:', response.status, errorText);
            return false;
        }
        
        const result = await response.json();
        console.log('✅ Webhook subscribed successfully:', result);
        return result;
    }
};

module.exports = InstagramAuthApi
