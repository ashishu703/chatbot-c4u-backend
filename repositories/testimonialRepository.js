const { Testimonial } = require("../models");

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
  console.log("Inside delete repository with id:", id); 
  const deleted = await Testimonial.destroy({ where: { id } });
  console.log("Delete result:", deleted);  
  if (deleted === 0) {
    console.warn(`Testimonial with id ${id} not found`);
  }
  return deleted;
}

}

module.exports = TestimonialRepository;
