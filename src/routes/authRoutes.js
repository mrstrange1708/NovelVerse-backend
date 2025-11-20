const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const googleAuthRoutes = require("../services/authGoogleService");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticateToken, authController.me);
router.use("/google", googleAuthRoutes);

module.exports = router;
