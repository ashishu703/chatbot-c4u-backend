const FileService = require("../services/fileService");
const BrandRepository = require("../repositories/brandRepository");

class BrandController {
  static async addBrandImage(req, res) {
    try {
      const file = req.files?.file;
      const filename = await FileService.uploadFile(file);
      await BrandRepository.addBrand(filename);
      res.json({ success: true, msg: "Logo was uploaded" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getBrands(req, res) {
    try {
      const brands = await BrandRepository.getBrands();
      res.json({ data: brands, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async deleteBrandLogo(req, res) {
    try {
      const { id } = req.body;
      await BrandRepository.deleteBrand(id);
      res.json({ success: true, msg: "Brand was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }
}

module.exports = BrandController;