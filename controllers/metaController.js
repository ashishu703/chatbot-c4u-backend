const metaService = require('../services/metaService');

class MetaController {
  async updateMeta(req, res) {
    try {
      const { waba_id, business_account_id, access_token, business_phone_number_id, app_id } = req.body;
      const result = await metaService.updateMeta(req.decode.uid, {
        waba_id,
        business_account_id,
        access_token,
        business_phone_number_id,
        app_id
      });
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async getMetaKeys(req, res) {
    try {
      const result = await metaService.getMetaKeys(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async addMetaTemplet(req, res) {
    try {
      const result = await metaService.addMetaTemplet(req.decode.uid, req.body);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async getMyMetaTemplets(req, res) {
    try {
      const result = await metaService.getMyMetaTemplets(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async deleteMetaTemplet(req, res) {
    try {
      const { name } = req.body;
      const result = await metaService.deleteMetaTemplet(req.decode.uid, name);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async returnMediaUrlMeta(req, res) {
    try {
      const { templet_name } = req.body;
      const result = await metaService.returnMediaUrlMeta(req.decode.uid, templet_name, req.files);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }
}

module.exports = new MetaController();