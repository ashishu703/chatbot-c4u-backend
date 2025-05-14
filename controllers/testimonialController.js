const TestimonialRepository = require("../repositories/testimonialRepository");

class TestimonialController {

   async addTestimonial(req, res, next) {
    try {
      const testimonialData = req.body;
      await TestimonialRepository.addTestimonial(testimonialData);
      res.json({ success: true, msg: "Testimonial was added" });
    } catch (err) {
      next(err);
    }
  }

   async getTestimonials(req, res, next) {
    try {
      const testimonials = await TestimonialRepository.getTestimonials();
      res.json({ success: true, data: testimonials });
    } catch (err) {
      next(err);
    }
  }

 async deleteTestimonial(req, res, next) {
  try {
    const { id } = req.body;
    console.log("Deleting testimonial with ID:", id);  
    const deleted = await TestimonialRepository.deleteTestimonial(id);
    console.log("Deleted?", deleted);  
    res.json({ success: true, msg: "Testimonial was deleted" });
  } catch (err) {
   next(err);
  }
}

}

module.exports = TestimonialController;
