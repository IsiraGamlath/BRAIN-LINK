const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const groupRoutes = require("./routes/groupRoutes");
const profileRoutes = require("./routes/profileRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://admin:h1vG6BK4PpmeQbEl@ac-p0umdby-shard-00-00.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-01.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-02.1hh0nlu.mongodb.net:27017/brainlink?ssl=true&authSource=admin&replicaSet=atlas-qe3hdm-shard-0&retryWrites=true&w=majority";

// CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/groups", groupRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/requests", requestRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("It is working");
});

// MongoDB connection + API startup
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    const errorMessage = err && err.message ? err.message : "Unknown MongoDB connection error";
    console.error(`MongoDB connection failed: ${errorMessage}`);
    console.error("If you are using MongoDB Atlas, check Network Access IP allowlist and credentials.");
    process.exit(1);
  }
}

startServer();