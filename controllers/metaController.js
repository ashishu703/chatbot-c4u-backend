const MetaService = require('../services/metaService');

class MetaController {
  metaService;
  constructor(){
    this.metaService = new MetaService();
  }
  async updateMetaApi(req, res, next) {
    try {
      const result = await this.metaService.updateMetaApi(req.decode.uid, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMetaKeys(req, res, next) {
    try {
      const result = await this.metaService.getMetaKeys(req.decode.uid);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async addMetaTemplet(req, res, next) {
    try {
      const result = await this.metaService.addMetaTemplet(req.decode.uid, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyMetaTemplets(req, res, next) {
    try {
      const result = await this.metaService.getMyMetaTemplets(req.decode.uid);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteMetaTemplet(req, res, next) {
    try {
      const { name } = req.body;
      const result = await this.metaService.deleteMetaTemplet(req.decode.uid, name);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async returnMediaUrlMeta(req, res, next) {
    try {
      const { templet_name } = req.body;
      const file = req.files?.file;
      const getFileInfo = async (filePath) => {
        // Placeholder: Implement actual file info logic
        return { fileSizeInBytes: 1000, mimeType: file.mimetype };
      };
      const result = await this.metaService.returnMediaUrlMeta(req.decode.uid, templet_name, file, getFileInfo);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MetaController;