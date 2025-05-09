const FileService = require("../services/fileService");
const BrandRepository = require("../repositories/brandRepository");

class BrandController {
  brandRepository;
  fileService;
  constructor(){
    this.brandRepository = new BrandRepository();
    this.fileService = new FileService();

  }
   async addBrandImage(req, res) {
    try {
      const file = req.files?.file;
      const filename = await this.fileService.uploadFile(file);
      await this.brandRepository.addBrand(filename);
      res.json({ success: true, msg: "Logo was uploaded" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getBrands(req, res) {
    try {
      const brands = await this.brandRepository.getBrands();
      res.json({ data: brands, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async deleteBrandLogo(req, res) {
    try {
      const { id } = req.body;
      await this.brandRepository.deleteBrand(id);
      res.json({ success: true, msg: "Brand was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }
}

module.exports = BrandController;