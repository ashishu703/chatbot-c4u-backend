const FileService = require("../services/fileService");
const BrandRepository = require("../repositories/brandRepository");

class BrandController {
  brandRepository;
  fileService;
  constructor(){
    this.brandRepository = new BrandRepository();
    this.fileService = new FileService();

  }
   async addBrandImage(req, res, next) {
    try {
      const file = req.files?.file;
      const filename = await this.fileService.uploadFile(file);
      await this.brandRepository.addBrand(filename);
      res.json({ success: true, msg: "Logo was uploaded" });
    } catch (err) {
      next(err);
    }
  }

   async getBrands(req, res, next) {
    try {
      const brands = await this.brandRepository.getBrands();
      res.json({ data: brands, success: true });
    } catch (err) {
      next(err);
    }
  }

   async deleteBrandLogo(req, res, next) {
    try {
      const { id } = req.body;
      await this.brandRepository.deleteBrand(id);
      res.json({ success: true, msg: "Brand was deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BrandController;