const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const mailService = require("./mail-service");
const tokenService = require("../service/token-service");
const UserDto = require("../dtos/dtos.js");
const ApiError = require("../exceptions/api-error.js");

class UserService {
  async registration(email, password) {
    try {
      const candidate = await UserModel.findOne({ email });
      if (candidate) {
        throw ApiError.BadRequest(`Користувач з поштовою адресою ${email} вже існує`);
      }

      const hashPassword = await bcrypt.hash(password, 3);
      const activationLink = uuidv4();
      const user = await UserModel.create({ email, password: hashPassword, activationLink });

      // Відправлення листа активації
      const activationEmailLink = `${process.env.API_URL}/api/activate/${activationLink}`;
      await mailService.sendActivationMail(email, activationEmailLink);

      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });

      // Збереження токену
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: userDto };
    } catch (error) {
      console.error(`Помилка при реєстрації користувача: ${error.message}`);
      throw error;
    }
  }

  async getUsers() {
    const users = await UserModel.find();
    return users;
  }

  async activate(activationLink) {
    console.log(`Активуємо посилання: ${activationLink}`);
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      console.log('Користувача не знайдено для активації');
      throw ApiError.BadRequest('Некоректне посилання для активації');
    }
    user.isActivated = true;
    await user.save();
    console.log('Користувач активований');
    return user;
  }

  async login(email, password) {
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest("Користувача не знайдено");
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest("Невірний пароль");
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        // Збереження токену
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: userDto };
    } catch (error) {
        console.error(`Помилка при вході користувача: ${error.message}`);
        throw error;
    }
}

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    if (!user) {
      throw ApiError.UnauthorizedError();
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    // Збереження токену
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: userDto };
  }

  async getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw ApiError.NotFoundError('Користувача не знайдено');
    }
    return user;
  }
}

module.exports = new UserService();
