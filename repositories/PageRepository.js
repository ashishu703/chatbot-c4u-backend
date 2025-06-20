const { Page } = require("../models");
const Repository = require("./Repository");

class PageRepository extends Repository {
  constructor() {
    super(Page);
  }
  async addPage({ title, content, slug, image }) {
    return this.updateOrCreate({ slug, title, image, content }, { slug });
  }

  async getPages() {
    return this.find({ where: { permanent: true } });
  }

  async deletePage(id) {
    await this.delete({ id });
  }

  async getPageBySlug(slug) {
    return await this.findFirst({ where: { slug } });
  }

  async updateTerms(title, content) {
    return this.updateOrCreate({ title, content, permanent: true }, { slug: "terms-and-conditions" });
  }

  async updatePrivacyPolicy(title, content) {
    return this.updateOrCreate({ title, content, permanent: true }, { slug: "privacy-policy" });
  }
}

module.exports = PageRepository;
