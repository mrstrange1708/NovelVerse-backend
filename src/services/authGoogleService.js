require("dotenv").config();
const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Step 1: Redirect to Google login page
router.get("/", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
});

// Step 2: Google callback
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Authorization code not provided");
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    if (!data || !data.email) {
      return res.status(400).send("Failed to fetch user info from Google");
    }

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { firstName: data.given_name, lastName: data.family_name },
      create: {
        firstName: data.given_name,
        lastName: data.family_name,
        email: data.email,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/home?token=${token}`);
  } catch (err) {
    console.error("Google auth failed:", err);
    res.status(500).send("Google auth failed");
  }
});

module.exports = router;