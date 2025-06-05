const TestimonialRepository = require("../repositories/testimonialRepository");
const { formSuccess } = require("../utils/response.utils");
const{ __t }=require("../utils/locale.utils")

class TestimonialController {

   async addTestimonial(req, res, next) {
    try {
      const testimonialData = req.body;
      await TestimonialRepository.addTestimonial(testimonialData);
      return formSuccess(res,{  msg: __t("testimonial_was_added"),

       });
    } catch (err) {
      next(err);
    }
  }

   async getTestimonials(req, res, next) {
    try {
      const testimonials = await TestimonialRepository.getTestimonials();
      return formSuccess(res,{  data: testimonials });
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
    return formSuccess(res,{  msg: __t("testimonial_was_deleted"),
      
     });
  } catch (err) {
   next(err);
  }
}

}

module.exports = TestimonialController;
