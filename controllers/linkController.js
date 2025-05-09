const LinkRepository = require("../repositories/linkRepository");

class LinkController {
  linkRepository;
  constructor(){
    this.linkRepository = new LinkRepository();
  }
   async getGeneratedLinks(req, res) {
    try {
      const links = await this.linkRepository.getGeneratedLinks();
      res.json({ data: links, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async deleteGeneratedLink(req, res) {
    try {
      const { id } = req.body;
      await this.linkRepository.deleteGeneratedLink(id);
      res.json({ msg: "Generated link was deleted", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }
}

module.exports = LinkController;