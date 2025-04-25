const { Testimonial } = require("../models/testimonial");

class TestimonialRepository {
  static async addTestimonial({ title, description, reviewer_name, reviewer_position }) {
    if (!title || !description || !reviewer_name || !reviewer_position) {
      throw new Error("Please fill all fields");
    }
    await Testimonial.create({ title, description, reviewer_name, reviewer_position });
  }

  static async getTestimonials() {
    return await Testimonial.findAll();
  }

  static async deleteTestimonial(id) {
    await Testimonial.destroy({ where: { id } });
  }
}

module.exports = TestimonialRepository;