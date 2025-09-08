const DripCampaignRepository = require("../repositories/DripCampaignRepository");
const DripCampaignMessageRepository = require("../repositories/DripCampaignMessageRepository");
const UserRepository = require("../repositories/UserRepository");
const FlowRepository = require("../repositories/FlowRepository");
const { generateUid } = require("../utils/auth.utils");
const moment = require("moment-timezone");
const { defaultTimeZone } = require("../config/app.config");

const parseSelectedDays = (selectedDays) => {
  const defaultDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (!selectedDays) return defaultDays;
  
  if (typeof selectedDays === 'string') {
    try {
      return JSON.parse(selectedDays);
    } catch (e) {
      return selectedDays.split(',').map(day => day.trim());
    }
  } else if (Array.isArray(selectedDays)) {
    return selectedDays;
  }
  
  return defaultDays;
};

class MessageScheduler {
  constructor(message, campaign) {
    this.message = message;
    this.campaign = campaign;
    this.timezone = campaign.timezone;
  }

  calculate() {
    const scheduledTime = this._getBaseTime();
    
    if (this.message.time_unit === 'immediately') {
      return scheduledTime.toDate();
    }

    this._addDelay(scheduledTime);
    this._applyTimeInterval(scheduledTime);
    
    return scheduledTime.toDate();
  }

  _getBaseTime() {
    return moment().tz(this.timezone);
  }

  _addDelay(scheduledTime) {
    const delayMinutes = this._convertToMinutes(this.message.delay_value, this.message.time_unit);
    scheduledTime.add(delayMinutes, 'minutes');
  }

  _applyTimeInterval(scheduledTime) {
    const timeConfig = this._getTimeConfig();
    
    if (!timeConfig.enabled) return;

    this._adjustTimeWindow(scheduledTime, timeConfig);
    this._adjustDaySelection(scheduledTime, timeConfig);
  }

  _getTimeConfig() {
    return {
      enabled: this.message.time_interval_enabled ?? this.campaign.time_interval_enabled,
      startTime: this.message.start_time || this.campaign.start_time,
      endTime: this.message.end_time || this.campaign.end_time,
      selectedDays: this._parseSelectedDays()
    };
  }

  _parseSelectedDays() {
    return parseSelectedDays(this.message.selected_days) || parseSelectedDays(this.campaign.selected_days);
  }

  _adjustTimeWindow(scheduledTime, timeConfig) {
    const startMoment = moment(timeConfig.startTime, 'HH:mm');
    const endMoment = moment(timeConfig.endTime, 'HH:mm');
    
    if (scheduledTime.hour() < startMoment.hour() || scheduledTime.hour() > endMoment.hour()) {
      scheduledTime.hour(startMoment.hour()).minute(startMoment.minute());
    }
  }

  _adjustDaySelection(scheduledTime, timeConfig) {
    const dayName = scheduledTime.format('dddd');
    
    if (timeConfig.selectedDays && !timeConfig.selectedDays.includes(dayName)) {
      const nextDay = this._findNextAvailableDay(scheduledTime, timeConfig);
      scheduledTime.year(nextDay.year()).month(nextDay.month()).date(nextDay.date());
    }
  }

  _findNextAvailableDay(scheduledTime, timeConfig) {
    let nextDay = scheduledTime.clone().add(1, 'day');
    const startMoment = moment(timeConfig.startTime, 'HH:mm');
    
    while (!timeConfig.selectedDays.includes(nextDay.format('dddd'))) {
      nextDay.add(1, 'day');
    }
    
    return nextDay.hour(startMoment.hour()).minute(startMoment.minute());
  }

  _convertToMinutes(value, unit) {
    const conversions = {
      'minutes': value,
      'hours': value * 60,
      'days': value * 24 * 60
    };
    return conversions[unit] || 0;
  }
}

class MessageBuilder {
  constructor(campaignId) {
    this.campaignId = campaignId;
  }

  buildFromData(messageData, campaign) {
    return {
      message_id: generateUid(),
      campaign_id: this.campaignId,
      flow_id: messageData.flow_id,
      flow_title: messageData.flow_title,
      delay_value: messageData.delay_value,
      time_unit: messageData.time_unit,
      status: 'pending',
      scheduled_at: new MessageScheduler(messageData, campaign).calculate(),
      time_interval_enabled: messageData.time_interval_enabled || false,
      start_time: messageData.start_time || '00:00',
      end_time: messageData.end_time || '23:00',
      selected_days: parseSelectedDays(messageData.selected_days),
    };
  }
}

class CampaignBuilder {
  constructor(user, userData) {
    this.user = user;
    this.userData = userData;
  }

  buildFromData(campaignData) {
    return {
      campaign_id: generateUid(),
      uid: this.user.uid,
      title: campaignData.title,
      status: 'active',
      timezone: this.userData.timezone || defaultTimeZone,
    };
  }
}

class DripCampaignService {
  constructor() {
    this.dripCampaignRepository = new DripCampaignRepository();
    this.dripCampaignMessageRepository = new DripCampaignMessageRepository();
    this.userRepository = new UserRepository();
    this.flowRepository = new FlowRepository();
  }

  async createCampaign(campaignData, user) {
    const userData = await this.userRepository.findByUid(user.uid);
    const campaignBuilder = new CampaignBuilder(user, userData);
    
    const campaign = await this.dripCampaignRepository.create(
      campaignBuilder.buildFromData(campaignData)
    );

    const messageBuilder = new MessageBuilder(campaign.id);
    const messages = campaignData.messages.map(msg => messageBuilder.buildFromData(msg, campaign));

    await this.dripCampaignMessageRepository.bulkCreate(messages);
    
    return campaign;
  }

  async getCampaigns(uid, query = {}) {
    const { page = 1, limit = 10, search } = query;
    
    return this.dripCampaignRepository.paginate({
      where: { uid },
      include: ['messages'],
      page,
      limit,
      search,
      searchFields: 'title',
    });
  }

  async getCampaign(campaign_id, uid) {
    return this.dripCampaignRepository.findByCampaignId(campaign_id, uid);
  }

  async updateCampaignStatus(campaign_id, status, uid) {
    return this.dripCampaignRepository.updateStatus(campaign_id, status, uid);
  }

  async updateCampaign(campaign_id, campaignData, uid) {
    const existingCampaign = await this.dripCampaignRepository.findByCampaignId(campaign_id, uid);
    
    if (!existingCampaign) {
      throw new Error('Campaign not found');
    }

    await this.dripCampaignMessageRepository.delete({ campaign_id: existingCampaign.id });

    const updatedCampaign = await this.dripCampaignRepository.update({
      title: campaignData.title,
    }, { campaign_id, uid });

    const messageBuilder = new MessageBuilder(existingCampaign.id);
    const messages = campaignData.messages.map(msg => 
      messageBuilder.buildFromData(msg, { ...existingCampaign, ...campaignData })
    );

    await this.dripCampaignMessageRepository.bulkCreate(messages);
    
    return updatedCampaign;
  }

  async deleteCampaign(campaign_id, uid) {
    const existingCampaign = await this.dripCampaignRepository.findByCampaignId(campaign_id, uid);
    
    if (!existingCampaign) {
      throw new Error('Campaign not found');
    }

    await this.dripCampaignMessageRepository.delete({ campaign_id: existingCampaign.id });
    
    return this.dripCampaignRepository.delete({ campaign_id, uid });
  }

  async processPendingMessages() {
    const pendingMessages = await this.dripCampaignMessageRepository.findPendingMessages();
    
    for (const message of pendingMessages) {
      try {
        await this.executeMessage(message);
        await this.dripCampaignMessageRepository.updateStatus(message.message_id, 'sent');
      } catch (error) {
        await this.dripCampaignMessageRepository.updateStatus(message.message_id, 'failed');
      }
    }
  }

  async executeMessage(message) {
    const flow = await this.flowRepository.findById(message.flow_id);
    if (!flow) {
      throw new Error('Flow not found');
    }

    console.log(`Executing message: ${message.flow_title} for flow: ${flow.flow_id}`);
    
    return {
      flow_id: flow.flow_id,
      flow_title: message.flow_title,
      executed_at: new Date(),
    };
  }
}

module.exports = DripCampaignService;
