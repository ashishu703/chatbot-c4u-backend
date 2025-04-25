const TestimonialRepository = require("../repositories/testimonialRepository");

class TestimonialController {
  static async addTestimonial(req, res) {
    try {
      const testimonialData = req.body;
      await TestimonialRepository.addTestimonial(testimonialData);
      res.json({ success: true, msg: "Testimonial was added" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getTestimonials(req, res) {
    try {
      const testimonials = await TestimonialRepository.getTestimonials();
      res.json({ success: true, data: testimonials });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  static async deleteTestimonial(req, res) {
    try {
      const { id } = req.body;
      await TestimonialRepository.deleteTestimonial(id);
      res.json({ success: true, msg: "Testimonial was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }
}

module.exports = TestimonialController;