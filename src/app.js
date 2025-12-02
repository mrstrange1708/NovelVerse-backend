require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const readingRoutes = require("./routes/readingRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");

const app = express();
app.use(express.json());
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/", cors(corsOptions));

app.use("/auth", authRoutes);
app.use("/", bookRoutes);
app.use("/reading", readingRoutes);
app.use("/favorites", favoritesRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to NovelVerse");
});

module.exports = app;
