const LinkRepository = require("../repositories/linkRepository");
const { formSuccess } = require("../utils/response.utils");

class LinkController {
  linkRepository;
  constructor(){
    this.linkRepository = new LinkRepository();
  }
   async getGeneratedLinks(req, res, next) {
    try {
      const links = await this.linkRepository.getGeneratedLinks();
      return formSuccess({ data: links});
    } catch (err) {
      next(err);
    }
  }

   async deleteGeneratedLink(req, res, next) {
    try {
      const { id } = req.body;
      await this.linkRepository.deleteGeneratedLink(id);
      return formSuccess({ msg: "Generated link was deleted"});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LinkController;