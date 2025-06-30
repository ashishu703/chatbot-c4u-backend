const TestimonialRepository = require("../repositories/testimonialRepository");
const { formSuccess } = require("../utils/response.utils");
const{ __t }=require("../utils/locale.utils")

class TestimonialController {

  constructor() {
    this.testimonialRepository = new TestimonialRepository();
  }

   async addTestimonial(req, res, next) {
    try {
      const testimonialData = req.body;
      await this.testimonialRepository.addTestimonial(testimonialData);
      return formSuccess(res,{  msg: __t("testimonial_was_added"),

       });
    } catch (err) {
      next(err);
    }
  }

   async getTestimonials(req, res, next) {
    try {
      const query  = req.query;
      const testimonials = await this.testimonialRepository.getTestimonials(query);
      return formSuccess(res,{  ...testimonials });
    } catch (err) {
      next(err);
    }
  }

 async deleteTestimonial(req, res, next) {
  try {
    const { id } = req.body;
    const deleted = await this.testimonialRepository.deleteTestimonial(id);
    return formSuccess(res,{  msg: __t("testimonial_was_deleted"),
      
     });
  } catch (err) {
   next(err);
  }
}

}

module.exports = TestimonialController;
