'use strict';

const Controller = require('egg').Controller;
const { validatePassword } = require('../utils/passwordValidation');
const { validateEmail } = require('../utils/emailValidation');
const { generateVerificationCode } = require('../utils/generationVerificationCode');
const uuid = require('uuid');

class LoginController extends Controller {
  // Registration
  // Email Length <= 80
  async register() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    ctx.body.type = ctx.body.type.toLowerCase();
    const email = ctx.body.email;
    const password = ctx.body.password;
    const type = ctx.body.type;
    console.log(ctx.body);
    let returnMap = {};

    const server_ref = uuid.v4();
    try {
      if (email === '' || password === '' || type === '') {
        throw new Error('Registration Verification Error', { cause: 'Email, Password or User role is empty' });
      }

      if (email.length > 80) {
        throw new Error('Registration Verification Error', { cause: 'Your email address length is not legal' });
      }

      const emailError = validateEmail(email);
      if (!emailError) {
        throw new Error('Registration Verification Error', { cause: 'Invalid email address' });
      }

      if (!email.endsWith('@student.wintec.ac.nz') && type === 'student') {
        throw new Error('Registration Verification Error', {
          cause: 'The type selected is student, but your email is not associated with Wintec students. Please check that you have selected the correct type',
        });
      } else if (email.endsWith('@student.wintec.ac.nz') && type !== 'student') {
        throw new Error('Registration Verification Error', {
          cause: 'Invalid industry selection. Your email is associated with a Wintec student. Please check your selection.',
        });
      }

      const passwordError = validatePassword(password);
      if (!passwordError) {
        throw new Error('Registration Verification Error', {
          cause: 'Password must include uppercase, lowercase letters, numbers, special characters, and must be at least 8 characters long',
        });
      }

      const users = await this.ctx.service.userService.addUser(ctx.body);

      const OTP = generateVerificationCode(6);
      const userVerification = {
        app_user_id: users.app_user_id,
        server_ref,
        code: OTP,
      };
      await this.ctx.service.userService.addUserVerification(userVerification);
      await this.ctx.service.emailService.sendOTP(server_ref);

      ctx.status = 200;
      returnMap = { server_ref, description: 'Registration successful and OTP sent' };

    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        ctx.status = 409;
        returnMap = { error: 'Email already registered, Please use another email or Sign In' };
      } else if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeDatabaseError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      } else {
        switch (error.cause) {
          case 'Email, Password or User role is empty':
            ctx.status = 400;
            returnMap = { error: error.cause };
            break;
          case 'Invalid email address':
            ctx.status = 404;
            returnMap = { error: error.cause };
            break;
          case 'Your email address length is not legal':
            ctx.status = 403;
            returnMap = { error: error.cause };
            break;
          case 'The type selected is student, but your email is not associated with Wintec students. Please check that you have selected the correct type':
            ctx.status = 403;
            returnMap = { error: error.cause };
            break;
          case 'Invalid industry selection. Your email is associated with a Wintec student. Please check your selection.':
            ctx.status = 403;
            returnMap = { error: error.cause };
            break;
          case 'Password must include uppercase, lowercase letters, numbers, special characters, and must be at least 8 characters long':
            ctx.status = 403;
            returnMap = { error: error.cause };
            break;
          default:
            ctx.status = 500;
            returnMap = { error: 'Something went wrong. Please try again later' };
            break;
        }
      }
    }
    ctx.body = returnMap;
  }
  async login() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    // Create a jason instance for parsing to frontend
    const email = ctx.body.email;
    const password = ctx.body.password;
    let returnMap = {};
    // console.log(ctx.body);

    try {
      if (password === '' || email === '') {
        throw new Error('Login Verification Error', { cause: 'Please provide email or password' });
      }

      const users = await this.app.model.ApplicationUser.findOne({
        where: { email, password },
      });

      // console.log(users);

      if (users === null) {
        throw new Error('Login Verification Error', { cause: 'Invalid username or password' });
      }

      // Check if the user is blocked, removed or pending
      if (users.status !== 'Active') {
        ctx.status = 403;
        returnMap = { error: 'Your account is not active. Please verify your email or contact support.' };

        if (users.status === 'Pending') {
          const OTP = generateVerificationCode(6);
          const serverRef = uuid.v4();
          const updateData = {
            server_ref: serverRef,
            code: OTP,
          };
          await this.ctx.service.userService.updateUserVerifications(users.app_user_id, updateData);
          await this.ctx.service.emailService.sendOTP(serverRef);
          returnMap = { error: 'OTP sent, Email verification required', server_ref: serverRef };
        }

        ctx.body = returnMap;
        return;
      }


      const token = ctx.app.jwt.sign({
        id: users.app_user_id,
        email: users.email,
        type: users.type,
      }, ctx.app.config.jwt.secret, {
        // 1m = 60000 ms
        // 1h = 1 hour
        expiresIn: '3h',
      });

      const expiration_date = new Date(Date.now() + 3 * 60 * 60 * 1000);
      // Insert token to authentication_user table
      const token_row = {
        app_user_id: users.app_user_id,
        token,
        expiration_date,
      };
      await this.app.model.AuthenticationToken.upsert(token_row);

      ctx.status = 200;
      returnMap = {
        auth_key: token,
        profile_data: {
          name: users.username,
          email: users.email,
          app_uid: users.app_user_id,
          user_type: users.type,
        },
      };

    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'Please provide email or password':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid username or password':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Sorry, account need to be actived':
          ctx.status = 403;
          {
            const users = await this.app.model.ApplicationUser.findOne({
              where: { email, password },
            });
            // Generate New OTP & Server Ref
            const OTP = generateVerificationCode(6);
            const serverRef = uuid.v4();
            console.log(serverRef);
            const updateData = {
              server_ref: serverRef,
              code: OTP,
            };
            await this.ctx.service.userService.updateUserVerifications(users.app_user_id, updateData);
            await this.ctx.service.emailService.sendOTP(serverRef);
            returnMap = { error: 'OTP sent, Email verification required', server_ref: serverRef };
          }
          break;
        case 'Sorry, account terminated or temporarily blocked':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }
    ctx.body = returnMap;
  }
  async emailVerification() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    console.log(ctx.body);
    const server_ref = ctx.body.server_ref;
    const OTP = ctx.body.otp;

    // Create a jason instance for parsing to frontend
    let returnMap = {};
    console.log(ctx.body);
    try {
      const userVerifications = await this.app.model.UserVerification.findOne({
        where: { server_ref, code: OTP },
      });
      console.log(userVerifications);

      if (OTP === '' || server_ref === '') {
        throw new Error('Email Verification Error', { cause: 'server_ref or OTP is empty' });
      }
      if (!userVerifications) {
        throw new Error('Email Verification Error', { cause: 'Invalid Server Ref. Please try again' });
      }
      if (userVerifications.code !== OTP) {
        throw new Error('Email Verification Error', { cause: 'Invalid OTP. Please try again' });
      }

      // Check if OTP is expired or not
      const currentTime = new Date();
      if (userVerifications.expiration_date < currentTime) {
        throw new Error('Email Verification Error', { cause: 'OTP expired' });
      }

      // If pass, update user verification & application user status
      // status: 1 - Active
      const updatedData = {
        status: 'Inactive',
        updated_date: new Date(),
      };
      await userVerifications.update(updatedData);
      await this.ctx.service.userService.updateUser(userVerifications.app_user_id, { status: 'Active' });
      console.log('User status updated to Active');
      ctx.status = 200;
      returnMap = { description: 'Email verification successful. Please Sign In' };
    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'server_ref or OTP is empty':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid server_ref. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. OTP has expired':
          ctx.status = 410;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }

    ctx.body = returnMap;
  }
  // When user click on resend button, call this function
  async sendOTP() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const server_ref = ctx.body.server_ref;
    let returnMap = {};
    try {
      const userVerifications = await this.app.model.UserVerification.findOne({
        where: { server_ref },
      });
      // console.log(ctx.body);
      console.log(userVerifications);

      if (!userVerifications) {
        throw new Error('Send OTP Error', { cause: 'Invalid Server Ref' });
      }

      // Update OTP & Expiration
      const OTP = generateVerificationCode(6);
      const currentDate = new Date();
      // After 30 minutes
      const expirationDate = new Date(currentDate.getTime() + 30 * 60000);
      // update server ref as well
      const updateData = {
        code: OTP,
        expiration_date: expirationDate,
      };
      await userVerifications.update(updateData);
      await this.ctx.service.emailService.sendOTP(server_ref);
      ctx.status = 200;
      returnMap = { description: 'OTP Sent Successfully' };
    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'Invalid Server Ref':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }
    ctx.body = returnMap;
  }
  async forgotPasswordRequest() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const email = ctx.body.email;
    let returnMap = {};
    try {
      if (email === '') {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide email' });
      }

      const emailError = validateEmail(email);

      if (!emailError) {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide a valid email address' });
      }

      const users = await this.app.model.ApplicationUser.findOne({
        where: { email },
      });

      if (!users) {
        throw new Error('Forgot Password Verification Error', { cause: 'Email is not registered' });
      }

      const userVerifications = await this.app.model.UserVerification.findOne({
        where: {
          app_user_id: users.app_user_id,
        },
      });

      // Update OTP & Expiration
      const OTP = generateVerificationCode(6);
      const currentDate = new Date();
      // After 30 minutes
      const expirationDate = new Date(currentDate.getTime() + 30 * 60000);
      // update server ref as well
      const updateData = {
        code: OTP,
        expiration_date: expirationDate,
        status: 'Active',
      };
      await userVerifications.update(updateData);
      await this.ctx.service.emailService.sendOTP(userVerifications.server_ref);
      ctx.status = 200;
      returnMap = { server_ref: userVerifications.server_ref, description: 'Password reset OTP sent' };
    } catch (error) {
      console.log(error);

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }
      switch (error.cause) {
        case 'Please provide email':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Email is not registered':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Please provide a valid email address':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }

    }
    ctx.body = returnMap;
  }
  async forgotPasswordVerify() {
    const { ctx } = this;
    ctx.body = ctx.request.body;

    const server_ref = ctx.body.server_ref;
    const OTP = ctx.body.otp;
    const email = ctx.body.email;

    let returnMap = {};

    try {
      // 1. Validate required fields
      if (!server_ref || !OTP || !email) {
        throw new Error('Forgot Password Verification Error', {
          cause: 'server_ref, email or OTP is empty',
        });
      }

      // 2. Find verification record by server_ref
      const userVerification = await this.app.model.UserVerification.findOne({
        where: { server_ref, code: OTP, status: 1 },
      });

      if (!userVerification) {
        throw new Error('Forgot Password Verification Error', {
          cause: 'Invalid OTP or server_ref',
        });
      }

      // 3. Check if OTP is expired
      const currentTime = new Date();
      if (userVerification.expiration_date < currentTime) {
        // Invalidate OTP
        await userVerification.update({ status: 'Inactive' });
        throw new Error('Forgot Password Verification Error', {
          cause: 'Invalid OTP. OTP has expired',
        });
      }

      // 4. Fetch user by app_user_id
      const user = await this.app.model.ApplicationUser.findOne({
        where: { app_user_id: userVerification.app_user_id },
      });

      if (!user || user.email !== email) {
        // Invalidate OTP
        await userVerification.update({ status: 'Inactive' });
        throw new Error('Forgot Password Verification Error', {
          cause: 'Invalid email. Please try again',
        });
      }

      // ✅ Success
      ctx.status = 200;
      returnMap = { description: 'OTP Matched' };

    } catch (error) {
      console.error('Verification failed:', {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });

      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }

      switch (error.cause) {
        case 'server_ref, email or OTP is empty':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP or server_ref':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid email. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. OTP has expired':
          ctx.status = 410;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }

    ctx.body = returnMap;
  }
  async forgotPasswordChange() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    console.log(ctx.body);
    let returnMap = {};
    const email = ctx.body.email;
    const otp = ctx.body.otp;
    const server_ref = ctx.body.server_ref;
    const password = ctx.body.password;
    try {

      // if (email === '' || server_ref === '' || otp === '') {
      //   throw new Error('Forgot Password Verification Error', { cause: 'server_ref, email or OTP is empty' });
      // }

      if (password === '') {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide a password' });
      }

      const emailError = validateEmail(email);
      if (!emailError) {
        throw new Error('Forgot Password Verification Error', { cause: 'Please provide a valid email address' });
      }

      const passwordError = validatePassword(password);
      if (!passwordError) {
        throw new Error('Forgot Password Verification Error', { cause: 'Password must include uppercase, lowercase letters, numbers, special characters, and must be at least 8 characters long' });
      }

      const users = await this.app.model.ApplicationUser.findOne({
        where: {
          email,
        },
      });

      console.log(users);
      if (!users) {
        throw new Error('Forgot Password Verification Error', { cause: 'Email address did not match' });
      }
      console.log('Finding userVerification with:', {
        server_ref,
        app_user_id: users.app_user_id,
      });

      const userVerifications = await this.app.model.UserVerification.findOne({
        where: {
          server_ref,
          app_user_id: users.app_user_id,
        },
      });

      if (!userVerifications) {
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid server_ref. Please try again' });
      }

      const currentTime = new Date();
      console.log('Current:', currentTime);
      console.log('Expires:', userVerifications.expiration_date);

      // ✅ Check expiration
      if (userVerifications.expiration_date < currentTime) {
        await userVerifications.update({ status: 'Inactive' });
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid OTP. OTP has expired' });
      }

      // ✅ Check if it's still active
      if (userVerifications.status !== 'Active') {
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid OTP. OTP has expired' });
      }

      if (otp !== userVerifications.code) {
        throw new Error('Forgot Password Verification Error', { cause: 'Invalid OTP. Please try again' });
      }

      // Update Password
      const updateData = {
        password,
      };

      await users.update(updateData);
      await userVerifications.update({ status: 'Inactive' }); // ✅ Invalidate OTP after use
      ctx.status = 200;
      returnMap = { description: 'Password changing successful. Please Sign In' };

    } catch (error) {
      console.log(error);
      if (error.name === 'SequelizeConnectionError') {
        ctx.status = 500;
        returnMap = { error: 'Something went wrong. Please try again later' };
      }
      switch (error.cause) {
        case 'server_ref, email or OTP is empty':
          ctx.status = 400;
          returnMap = { error: error.cause };
          break;
        case 'Email address did not match':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Please provide a password':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Please provide a valid email address':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        case 'Password must include uppercase, lowercase letters, numbers, special characters, and must be at least 8 characters long':
          ctx.status = 403;
          returnMap = { error: error.cause };
          break;
        case 'Invalid server_ref. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. OTP has expired':
          ctx.status = 410;
          returnMap = { error: error.cause };
          break;
        case 'Invalid OTP. Please try again':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        default:
          ctx.status = 500;
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }
    ctx.body = returnMap;
  }
  async getTokenExpirationDate() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
    const app_user_id = ctx.body.app_user_id;
    let returnMap = {};

    try {
      if (!app_user_id) {
        throw new Error('App User ID Verification Error', { cause: 'App User Id is empty' });
      }

      const application_token = await ctx.app.model.AuthenticationToken.findOne({
        where: {
          app_user_id,
        },
      });

      if (!application_token) {
        throw new Error('App User ID Verification Error', { cause: 'Invalid app user id' });
      }

      ctx.status = 200;
      returnMap = {
        app_uid: app_user_id,
        expiration_date: application_token.expiration_date,
      };

    } catch (error) {
      console.log(error);
      switch (error.cause) {
        case 'Invalid app user id':
          ctx.status = 401;
          returnMap = { error: error.cause };
          break;
        case 'App User Id is empty':
          ctx.status = 404;
          returnMap = { error: error.cause };
          break;
        default:
          returnMap = { error: 'Something went wrong. Please try again later' };
          break;
      }
    }

    ctx.body = returnMap;
  }
}

module.exports = LoginController;

