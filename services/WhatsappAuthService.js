const WhatsappAuthApi = require("../api/Whatsapp/WhatsappAuthApi");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");

class WhatsappAuthService {
  constructor(user, accessToken) {
    this.user = user;
    this.whatsappAuthApi = new WhatsappAuthApi(user, accessToken);
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async initiateUserAuth(code, phoneNumberId, wabaId, redirectUri = null) {
    console.log('[WhatsappAuthService] initMeta');
    await this.whatsappAuthApi.initMeta();
    console.log('[WhatsappAuthService] getLongLiveToken start');
    const tokenResponse = await this.whatsappAuthApi.getLongLiveToken(code, redirectUri);
    console.log("[WhatsappAuthService] token response:", JSON.stringify(tokenResponse, null, 2));
    
    const accessToken = tokenResponse?.access_token;
    if (!accessToken) {
      throw new Error("Failed to get access token from Facebook");
    }
    
    this.whatsappAuthApi.setToken(accessToken);
    console.log("[WhatsappAuthService] access token set, length:", accessToken.length);

    console.log("[WhatsappAuthService] initiateUserAuth", { hasCode: !!code, phoneNumberId, wabaId, hasRedirect: !!redirectUri });
    if (!phoneNumberId) {
      console.warn("[WhatsappAuthService] Missing phoneNumberId; attempting multiple resolution strategies...");
      try {
        // Strategy 1: Try direct WABA endpoint first
        console.log("[WhatsappAuthService] === Strategy 1: Direct WABA lookup ===");
        try {
          const directWabas = await this.whatsappAuthApi.getMyWhatsappBusinessAccounts();
          console.log("[WhatsappAuthService] Direct WABA response:", JSON.stringify(directWabas, null, 2));
          
          const wabaData = directWabas?.data || (Array.isArray(directWabas) ? directWabas : []);
          const firstWaba = Array.isArray(wabaData) ? wabaData[0] : null;
          
          if (firstWaba?.id) {
            wabaId = wabaId || firstWaba.id;
            console.log("[WhatsappAuthService] Found WABA from direct call:", wabaId);
            
            const phones = await this.whatsappAuthApi.getPhoneNumbersForWaba(wabaId);
            console.log("[WhatsappAuthService] Phone numbers for WABA:", JSON.stringify(phones, null, 2));
            
            const phoneData = phones?.data || (Array.isArray(phones) ? phones : []);
            const firstPhone = Array.isArray(phoneData) ? phoneData[0] : null;
            
            if (firstPhone?.id) {
              phoneNumberId = firstPhone.id;
              console.log("[WhatsappAuthService] Found phone number:", phoneNumberId);
            }
          }
        } catch (directError) {
          console.warn("[WhatsappAuthService] Direct WABA call failed:", directError?.response?.data || directError?.message);
        }

        // Strategy 2: Try via businesses if direct approach didn't work
        if (!wabaId || !phoneNumberId) {
          console.log("[WhatsappAuthService] === Strategy 2: Via Businesses ===");
          const biz = await this.whatsappAuthApi.getBusinesses();
          console.log("[WhatsappAuthService] getBusinesses response:", JSON.stringify(biz, null, 2));
          
          const bizData = biz?.data || (Array.isArray(biz) ? biz : []);
          const firstBiz = Array.isArray(bizData) ? bizData[0] : null;
          console.log("[WhatsappAuthService] first business:", firstBiz);
          
          if (firstBiz?.id) {
            const wabas = await this.whatsappAuthApi.getWabasForBusiness(firstBiz.id);
            console.log("[WhatsappAuthService] getWabasForBusiness response:", JSON.stringify(wabas, null, 2));
            
            const wabaData = wabas?.data || (Array.isArray(wabas) ? wabas : []);
            const firstWaba = Array.isArray(wabaData) ? wabaData[0] : null;
            console.log("[WhatsappAuthService] first waba:", firstWaba);
            
            if (firstWaba?.id) {
              wabaId = wabaId || firstWaba.id;
              const phones = await this.whatsappAuthApi.getPhoneNumbersForWaba(firstWaba.id);
              console.log("[WhatsappAuthService] getPhoneNumbersForWaba response:", JSON.stringify(phones, null, 2));
              
              const phoneData = phones?.data || (Array.isArray(phones) ? phones : []);
              const firstPhone = Array.isArray(phoneData) ? phoneData[0] : null;
              console.log("[WhatsappAuthService] first phone:", firstPhone);
              
              if (firstPhone?.id) {
                phoneNumberId = firstPhone.id;
              }
            }
          }
        }

        // Strategy 3: Try via pages (sometimes WABA is linked to a page)
        if (!wabaId || !phoneNumberId) {
          console.log("[WhatsappAuthService] === Strategy 3: Via Pages ===");
          try {
            const pages = await this.whatsappAuthApi.getMyPages();
            console.log("[WhatsappAuthService] getMyPages response:", JSON.stringify(pages, null, 2));
            
            const pageData = pages?.data || (Array.isArray(pages) ? pages : []);
            for (const page of pageData) {
              if (page?.whatsapp_business_account_id) {
                wabaId = wabaId || page.whatsapp_business_account_id;
                console.log("[WhatsappAuthService] Found WABA from page:", wabaId);
                
                const phones = await this.whatsappAuthApi.getPhoneNumbersForWaba(wabaId);
                console.log("[WhatsappAuthService] Phone numbers for page WABA:", JSON.stringify(phones, null, 2));
                
                const phoneData = phones?.data || (Array.isArray(phones) ? phones : []);
                const firstPhone = Array.isArray(phoneData) ? phoneData[0] : null;
                
                if (firstPhone?.id) {
                  phoneNumberId = firstPhone.id;
                  console.log("[WhatsappAuthService] Found phone number from page:", phoneNumberId);
                  break;
                }
              }
            }
          } catch (pageError) {
            console.warn("[WhatsappAuthService] Pages call failed:", pageError?.response?.data || pageError?.message);
          }
        }

        // Strategy 4: Check /me profile for any additional info
        if (!wabaId || !phoneNumberId) {
          console.log("[WhatsappAuthService] === Strategy 4: Check /me profile ===");
          const me = await this.whatsappAuthApi.getOwnerProfile();
          console.log("[WhatsappAuthService] me profile:", JSON.stringify(me, null, 2));
        }

        console.log("[WhatsappAuthService] === Final Resolution Results ===");
        console.log("[WhatsappAuthService] Resolved WABA ID:", wabaId);
        console.log("[WhatsappAuthService] Resolved Phone Number ID:", phoneNumberId);
        
      } catch (e) {
        console.error("[WhatsappAuthService] Resolution attempt failed", {
          error: e?.message,
          response: e?.response?.data,
          status: e?.response?.status,
          stack: e?.stack
        });
      }
    }
    // Ensure internal API state is aware of WABA for correct logging and any dependent calls
    if (wabaId) {
      try { this.whatsappAuthApi.setWabaId(wabaId); } catch {}
    }

    phoneNumberId && this.whatsappAuthApi.registerAccount(phoneNumberId)
      .then((resp) => console.log("[WhatsappAuthService] registerAccount ok", resp))
      .catch((err) => { console.log("[WhatsappAuthService] Account Registration Failed", err?.response?.data || err?.message || err) });

    wabaId && this.whatsappAuthApi.subscribeWebhook(wabaId)
      .then((resp) => console.log("[WhatsappAuthService] subscribeWebhook ok", resp))
      .catch((err) => { console.log("[WhatsappAuthService] Webhook Subscription Failed", err?.response?.data || err?.message || err) });

    let accountInfo = null;
    if (phoneNumberId) {
      accountInfo = await this.whatsappAuthApi.getNumberInfo(phoneNumberId);
      console.log("[WhatsappAuthService] number info", accountInfo);
    }

    // If we still do not have phoneNumberId or wabaId, throw error instead of saving incomplete data
    if (!wabaId || !phoneNumberId) {
      console.error("[WhatsappAuthService] FAILED: Missing required identifiers", { wabaId, phoneNumberId });
      throw new Error("Could not resolve WhatsApp Business Account ID and Phone Number ID. Please check your Facebook App permissions and WhatsApp Business setup.");
    }
    return this.saveCurrentSession(accountInfo, accessToken, phoneNumberId, wabaId);
  }



  async saveCurrentSession(accountInfo, accessToken, phoneNumberId, wabaId) {
    const { verified_name: name, display_phone_number: displayNumber } = accountInfo || {};
    console.log("[WhatsappAuthService] saveCurrentSession payload", { name, displayNumber, phoneNumberId, wabaId, hasToken: !!accessToken });
    const result = await this.socialAccountRepository.updateOrCreateWhatsappProfile(
      this.user.uid,
      wabaId,
      phoneNumberId,
      displayNumber,
      name,
      accessToken,
    );
    console.log("[WhatsappAuthService] saveCurrentSession result", result?.id || result);
    return result;
  }





};

module.exports = WhatsappAuthService