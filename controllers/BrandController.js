const FileService = require("../services/fileService");
const BrandRepository = require("../repositories/brandRepository");
const {formSuccess} = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
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
      return formSuccess(res,{ msg: __t("logo_was_uploaded"), });
    } catch (err) {
      next(err);
    }
  }

   async getBrands(req, res, next) {
    try {
      const brands = await this.brandRepository.getBrands();
      return formSuccess(res,{data: brands });
    } catch (err) {
      next(err);
    }
  }

   async deleteBrandLogo(req, res, next) {
    try {
      const { id } = req.body;
      await this.brandRepository.deleteBrand(id);
      return formSuccess(res,{ msg: __t("brand_was_deleted"),
        
       });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BrandController;