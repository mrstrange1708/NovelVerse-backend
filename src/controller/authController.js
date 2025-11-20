const authService = require("../services/authService.js");

class AuthController {
  async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const result = await authService.register(
        firstName,
        lastName,
        email,
        password
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async me(req, res) {
    try {
      const userId = req.user.userId;
      const user = await authService.getUserById(userId);
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AuthController();
