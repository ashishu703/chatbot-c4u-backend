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

  async getTestimonials(query) {
    return this.paginate(query);
  }

  async deleteTestimonial(id) {
      return this.model.destroy({
    where: {
      id: id,
    },
  });
  }
}

module.exports = TestimonialRepository;
