require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

// Add CORS middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions)); // automatically handles OPTIONS preflight
app.options("/", cors(corsOptions));

// Mount auth routes first
app.use("/auth", authRoutes);

// Root route should come after other routes
app.get('/', (req, res) => {
    res.send("Welcome to NovelVerse");
});

module.exports = app;