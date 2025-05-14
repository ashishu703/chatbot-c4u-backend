const LinkRepository = require("../repositories/linkRepository");

class LinkController {
  linkRepository;
  constructor(){
    this.linkRepository = new LinkRepository();
  }
   async getGeneratedLinks(req, res, next) {
    try {
      const links = await this.linkRepository.getGeneratedLinks();
      res.json({ data: links, success: true });
    } catch (err) {
      next(err);
    }
  }

   async deleteGeneratedLink(req, res, next) {
    try {
      const { id } = req.body;
      await this.linkRepository.deleteGeneratedLink(id);
      res.json({ msg: "Generated link was deleted", success: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LinkController;