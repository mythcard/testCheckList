const express = require("express");
const router = express.Router();

// Main API status route
router.get("/", (req, res) => {
  res.json({
    status: "API is operational",
    message: "Welcome to the Checklist API",
  });
});

// Register all routes
router.use("/templates", require("./templates"));
router.use("/checklists", require("./checklists"));
router.use("/tasks", require("./tasks"));
router.use("/jira", require("./jira"));

module.exports = router;
