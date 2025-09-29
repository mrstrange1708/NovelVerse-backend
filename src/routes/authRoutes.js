const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const googleAuthRoutes = require("../services/authGoogleService");

// Regular auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.use("/google", googleAuthRoutes);

module.exports = router;