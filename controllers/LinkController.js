const LinkRepository = require("../repositories/linkRepository");
const { formSuccess } = require("../utils/response.utils");
const { __t }= require("../utils/locale.utils")

class LinkController {
  linkRepository;
  constructor(){
    this.linkRepository = new LinkRepository();
  }
   async getGeneratedLinks(req, res, next) {
    try {
      const links = await this.linkRepository.getGeneratedLinks();
      return formSuccess(res,{ data: links});
    } catch (err) {
      next(err);
    }
  }

   async deleteGeneratedLink(req, res, next) {
    try {
      const { id } = req.body;
      await this.linkRepository.deleteGeneratedLink(id);
      return formSuccess(res,{ msg: __t("generated_link_was_deleted"),
        
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LinkController;