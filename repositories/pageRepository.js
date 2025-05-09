const { Page } = require("../models");

class PageRepository {
  static async addPage({ title, content, slug, image }) {
    if (!title || !content || !slug) throw new Error("Please fill all fields");
    if (!image) throw new Error("No image was selected");

    const reservedSlugs = ["contact-form", "privacy-policy", "terms-and-conditions"];
    if (reservedSlugs.includes(slug)) {
      throw new Error("This slug is already used by system please use another slug.");
    }

    const existingPage = await Page.findOne({ where: { slug } });
    if (existingPage) {
      throw new Error("This slug was already used by another page.");
    }

    await Page.create({ slug, title, image, content });
  }

  static async getPages() {
    return await Page.findAll({ where: { permanent: true } });
  }

  static async deletePage(id) {
    await Page.destroy({ where: { id } });
  }

  static async getPageBySlug(slug) {
    return await Page.findOne({ where: { slug } });
  }

  static async updateTerms(title, content) {
    const slug = "terms-and-conditions";
    const existing = await Page.findOne({ where: { slug } });
    if (existing) {
      await Page.update({ title, content }, { where: { slug } });
    } else {
      await Page.create({ slug, title, content, permanent: true });
    }
  }

  static async updatePrivacyPolicy(title, content) {
    const slug = "privacy-policy";
    const existing = await Page.findOne({ where: { slug } });
    if (existing) {
      await Page.update({ title, content }, { where: { slug } });
    } else {
      await Page.create({ slug, title, content, permanent: true });
    }
  }
}

module.exports = PageRepository;
