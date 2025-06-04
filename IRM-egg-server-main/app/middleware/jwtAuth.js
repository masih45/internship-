// app/utils/jwtAuth.js

/**
 * JWT authentication middleware.
 * Validates JWT signature and expiry, and checks token in the database.
 */
module.exports = (options) => {
  return async function jwtAuth(ctx, next) {
    // Get Authorization header
    const token = ctx.request.headers.authorization;
    console.log('[AUTH] Incoming Authorization header:', token);

    if (!token || !token.startsWith('Bearer ')) {
      console.log('[AUTH] No token or wrong format.');
      ctx.status = 401;
      ctx.body = { error: 'Authentication failed: No token provided' };
      return;
    }

    try {
      // 1. Extract JWT token
      const authToken = token.split(' ')[1];
      console.log('[AUTH] Extracted token:', authToken);

      // 2. Verify JWT signature and expiry (throws if invalid or expired)
      const decoded = ctx.app.jwt.verify(authToken, ctx.app.config.jwt.secret);
      ctx.state.user = decoded; // (Optional) user info in context
      console.log('[AUTH] Token decoded:', decoded);

      // 3. Optional: Check if token exists in DB and not expired (extra security)
      const authentication_token = await ctx.app.model.AuthenticationToken.findOne({
        where: { token: authToken },
      });
      console.log('[AUTH] Token record in DB:', authentication_token);

      if (!authentication_token) {
        console.log('[AUTH] Token not found in DB.');
        ctx.status = 401;
        ctx.body = { error: 'Authentication failed: Token mismatch or not found' };
        return;
      }

      // Check DB expiration
      const expiration_date = new Date(authentication_token.expiration_date);
      const current_date = new Date();
      console.log('[AUTH] Token expiration:', expiration_date, '| Current:', current_date);

      if (expiration_date < current_date) {
        console.log('[AUTH] Token expired!');
        ctx.status = 401;
        ctx.body = { error: 'Authentication failed: Invalid or expired token' };
        return;
      }

      // All checks passed, continue
      console.log('[AUTH] Token valid, proceeding to next middleware/controller.');
      await next();
    } catch (error) {
      console.log('[AUTH] JWT Error:', error);
      ctx.status = 401;
      // If it's a JWT error, respond accordingly
      if (error.name === 'TokenExpiredError') {
        ctx.body = { error: 'Authentication failed: Token has expired' };
      } else if (error.name === 'JsonWebTokenError') {
        ctx.body = { error: 'Authentication failed: Invalid token' };
      } else {
        ctx.body = { error: 'Authentication failed: Invalid or expired token' };
      }
    }
  };
};
