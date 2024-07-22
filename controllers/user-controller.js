const userService = require("../service/user-service");
const tokenService = require("../service/token-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Помилка при валідації", errors.array()));
      }
      const { email, password } = req.body;
      const userData = await userService.registration(email, password);
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      console.log(`Login attempt for email: ${email}`);
      const userData = await userService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      console.error(`Login error for email ${req.body.email}:`, e);
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      const user = await userService.activate(activationLink);
      if (!user) {
        return res.status(400).json({ message: 'Invalid activation link' });
      }
  
      const tokens = tokenService.generateTokens({ id: user.id, email: user.email });
      await tokenService.saveToken(user.id, tokens.refreshToken);
  
      console.log('Activation complete for user:', user.id);
  
      // Виконати редирект на клієнтську частину після успішної активації
      const redirectUrl = `${process.env.CLIENT_URL}/activation-success?token=${tokens.accessToken}`;
      res.redirect(302, redirectUrl);
    } catch (e) {
      console.error(`Activation error: ${e.message}`);
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        console.error('No token provided');
        return res.status(401).json({ message: 'No token provided' });
      }

      console.log('Validating refresh token:', refreshToken);
      const userData = await userService.refresh(refreshToken);
      if (!userData) {
        console.error('Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      }

      console.log('Finding token in database:', refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);
      
      if (!tokenFromDb) {
        console.error('Token not found');
        return res.status(401).json({ message: 'Token not found' });
      }

      const user = await userService.getUserById(userData.id);
      if (!user) {
        console.error('User not found');
        return res.status(401).json({ message: 'User not found' });
      }

      const tokens = tokenService.generateTokens({ id: user.id, email: user.email });
      await tokenService.saveToken(user.id, tokens.refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'strict' });
      res.json(tokens);
    } catch (e) {
      console.error('Error in /refresh endpoint:', e);
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getUsers();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
