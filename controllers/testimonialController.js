const TestimonialRepository = require("../repositories/testimonialRepository");
const { formSuccess } = require("../utils/response.utils");

class TestimonialController {

   async addTestimonial(req, res, next) {
    try {
      const testimonialData = req.body;
      await TestimonialRepository.addTestimonial(testimonialData);
      return formSuccess({  msg: "Testimonial was added" });
    } catch (err) {
      next(err);
    }
  }

   async getTestimonials(req, res, next) {
    try {
      const testimonials = await TestimonialRepository.getTestimonials();
      return formSuccess({  data: testimonials });
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
    return formSuccess({  msg: "Testimonial was deleted" });
  } catch (err) {
   next(err);
  }
}

}

module.exports = TestimonialController;
