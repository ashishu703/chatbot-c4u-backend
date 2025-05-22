const { Testimonial } = require("../models");
const Repository = require("./Repository");

class TestimonialRepository extends Repository {
  constructor() {
    super(Testimonial);
  }

  async addTestimonial({
    title,
    description,
    reviewer_name,
    reviewer_position,
  }) {
    return this.create({
      title,
      description,
      reviewer_name,
      reviewer_position,
    });
  }

  async getTestimonials() {
    return this.find();
  }

  async deleteTestimonial(id) {
    return this.delete(id);
  }
}

module.exports = TestimonialRepository;
