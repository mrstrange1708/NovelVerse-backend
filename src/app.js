require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
app.use(express.json());

// Add CORS middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions)); // automatically handles OPTIONS preflight
app.options("/", cors(corsOptions));

// Mount auth routes first
app.use("/auth", authRoutes);
app.use("/", bookRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to NovelVerse");
});

module.exports = app;