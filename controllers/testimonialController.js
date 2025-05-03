const TestimonialRepository = require("../repositories/testimonialRepository");

class TestimonialController {

   async addTestimonial(req, res) {
    try {
      const testimonialData = req.body;
      await TestimonialRepository.addTestimonial(testimonialData);
      res.json({ success: true, msg: "Testimonial was added" });
    } catch (err) {
      console.error("Add Error:", err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getTestimonials(req, res) {
    try {
      const testimonials = await TestimonialRepository.getTestimonials();
      res.json({ success: true, data: testimonials });
    } catch (err) {
      console.error("Get Error:", err);
      res.json({ success: false, msg: "Server error" });
    }
  }

 async deleteTestimonial(req, res) {
  try {
    const { id } = req.body;
    console.log("Deleting testimonial with ID:", id);  
    const deleted = await TestimonialRepository.deleteTestimonial(id);
    console.log("Deleted?", deleted);  
    res.json({ success: true, msg: "Testimonial was deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error" });
  }
}

}

module.exports = TestimonialController;
