const LinkRepository = require("../repositories/linkRepository");

class LinkController {
  static async getGeneratedLinks(req, res) {
    try {
      const links = await LinkRepository.getGeneratedLinks();
      res.json({ data: links, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async deleteGeneratedLink(req, res) {
    try {
      const { id } = req.body;
      await LinkRepository.deleteGeneratedLink(id);
      res.json({ msg: "Generated link was deleted", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }
}

module.exports = LinkController;