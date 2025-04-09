'use strict';

const Controller = require('egg').Controller;
const { validateEmail } = require('../utils/emailValidation');
const axios = require('axios'); // required for reCAPTCHA verification

class UserController extends Controller {
  async completeApplication() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const {
      student_email, name, wintec_id, personal_email, phone_number, personal_statement,
      cv_link, linkedin_link, portfolio_link, github_link, average_grade,
      programme_of_study, area_of_study, skills, favourite_courses, references,
      internship_options, preferred_companies, first_preference, second_preference,
      gender, student_type,
    } = ctx.request.body;

    let returnMap = {};
    const token = ctx.request.headers.authorization;
    const authToken = token.split(' ')[1];
    const decoded = ctx.app.jwt.verify(authToken, ctx.app.config.jwt.secret);

    const formFields = {
      student_email, name, wintec_id, personal_email, phone_number, personal_statement,
      cv_link, linkedin_link, portfolio_link, github_link, average_grade,
      programme_of_study, area_of_study, skills, favourite_courses, references,
      internship_options, preferred_companies, first_preference, second_preference,
      gender, student_type,
    };

    try {
      const emptyFields = Object.keys(formFields).filter(key => formFields[key] === '');

      if (emptyFields.length > 0) {
        throw new Error('Application Fields Validation Error', {
          cause: `The following fields are missing: ${emptyFields.join(', ')}`,
        });
      }

      if (decoded.type !== 'Student') {
        throw new Error('Complete Application Error', { cause: 'Authentication failed. Please try again' });
      }

      if (!validateEmail(student_email)) {
        throw new Error('Complete Application Error', { cause: 'Student email address is not an email format' });
      }

      if (!validateEmail(personal_email)) {
        throw new Error('Complete Application Error', { cause: 'Personal email address is not an email format' });
      }

      const student = {
        app_user_id: decoded.id,
        name,
        wintec_id,
        personal_email,
        student_email,
        phone_number,
        personal_statement,
        cv_link,
        linkedin_link,
        portfolio_link,
        github_link,
        average_grade,
        programme_of_study,
        area_of_study,
        skills,
        favourite_courses,
        reference: references,
        internship_options: JSON.stringify(internship_options),
        preferred_companies: JSON.stringify(preferred_companies),
        first_preference,
        second_preference,
        gender,
        student_type,
      };

      await this.ctx.service.userService.addStudent(student);
      ctx.status = 200;
      returnMap = { description: 'Application saved' };
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      returnMap = { error: error.cause || 'Something went wrong. Please try again later' };

      if (
        error.cause === 'Student email address is not an email format' ||
        error.cause === 'Personal email address is not an email format' ||
        error.cause === 'Authentication failed. Please try again'
      ) {
        ctx.status = 401;
      }

      if (error.message === 'Application Fields Validation Error') {
        ctx.status = 401;
      }
    }

    ctx.body = returnMap;
  }

  async getStudentProfileData() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const user_id = ctx.body.user_id;
    let returnMap = {};

    try {
      if (!user_id) {
        throw new Error('Get Student Profile Data Error', { cause: 'Please provide user id' });
      }

      const student = await this.app.model.Student.findOne({
        where: { app_user_id: user_id },
      });

      if (!student) {
        throw new Error('Get Student Profile Data Error', { cause: 'User is not exist' });
      }

      ctx.status = 200;
      returnMap = { student };
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      returnMap = { error: error.cause || 'Something went wrong. Please try again later' };

      if (error.cause === 'Please provide user id') ctx.status = 400;
      if (error.cause === 'User is not exist') ctx.status = 404;
    }

    ctx.body = returnMap;
  }

  async getAllStudent() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const token = ctx.request.headers.authorization;
    const authToken = token.split(' ')[1];
    const decoded = ctx.app.jwt.verify(authToken, ctx.app.config.jwt.secret);
    let returnMap = {};

    try {
      if (decoded.type !== 'Admin' && decoded.type !== 'Industry') {
        throw new Error('Error', { cause: 'Only admin and industry client can access this resource' });
      }

      const students = await this.app.model.Student.findAll();
      ctx.status = 200;
      returnMap = { students };
    } catch (error) {
      console.log(error);
      ctx.status = 401;
      returnMap = { error: error.cause || 'Access denied' };
    }

    ctx.body = returnMap;
  }

  // ✅ Forgot password CAPTCHA-protected endpoint
  async forgotPassRequest() {
    const { ctx } = this;
    const { email, recaptcha } = ctx.request.body;
    let returnMap = {};

    try {
      if (!email || !recaptcha) {
        ctx.status = 400;
        returnMap = { error: 'Email and CAPTCHA are required.' };
        ctx.body = returnMap;
        return;
      }

      const secretKey = '6LeLaAwrAAAAAJbWYQIfbBvFVYlm39yjBtISfxWR';
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: secretKey,
            response: recaptcha,
          },
        }
      );

      if (!response.data.success) {
        ctx.status = 401;
        returnMap = { error: 'CAPTCHA verification failed.' };
        ctx.body = returnMap;
        return;
      }

      // ✅ Replace this with your real reset logic
      ctx.status = 200;
      returnMap = { description: 'Reset password instructions sent!', server_ref: 'mock-ref-123' };
    } catch (error) {
      console.error('CAPTCHA error:', error);
      ctx.status = 500;
      returnMap = { error: 'Server error during CAPTCHA verification.' };
    }

    ctx.body = returnMap;
  }
}

module.exports = UserController;
