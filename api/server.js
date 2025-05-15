const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Database connection
const db = require("./db/database");
const { seedDatabase } = require("./db/seed");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes/index"));

// Home route
app.get("/", (req, res) => {
  res.send("Express API is running");
});

// Seed database if in development mode
if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
  // Optional: Seed the database with sample data
  // Uncomment to enable auto-seeding on server start
  // seedDatabase();
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
