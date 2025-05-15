const express = require("express");
const router = express.Router();
const Checklist = require("../../models/Checklist");
const Task = require("../../models/Task");

// Push checklist to JIRA
router.post("/push", async (req, res) => {
  try {
    const {
      checklist_id,
      jira_api_token,
      jira_base_url,
      jira_email,
      jira_project_key,
      parent_issue_key,
      create_as_subtasks,
    } = req.body;

    if (!checklist_id) {
      return res.status(400).json({ error: "Checklist ID is required" });
    }

    if (!jira_api_token || !jira_base_url || !jira_email || !jira_project_key) {
      return res
        .status(400)
        .json({ error: "JIRA credentials and project are required" });
    }

    // Get checklist data
    const checklist = await Checklist.getById(checklist_id);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    // Get tasks
    const tasks = await Task.getByChecklistId(checklist_id);
    if (!tasks || tasks.length === 0) {
      return res
        .status(400)
        .json({ error: "Checklist has no tasks to push to JIRA" });
    }

    // This is a mock implementation since we don't have actual JIRA integration yet
    // In a real implementation, this would make API calls to JIRA

    const tasksPushed = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      jira_status: "pushed",
      jira_issue_key: `MOCK-${Math.floor(Math.random() * 1000)}`,
    }));

    // Mock response
    res.json({
      success: true,
      checklist_name: checklist.name,
      jira_project: jira_project_key,
      tasks_pushed: tasksPushed,
      create_as_subtasks: !!create_as_subtasks,
      parent_issue_key: parent_issue_key || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get JIRA project issues (mock)
router.get("/projects/:projectKey/issues", (req, res) => {
  const projectKey = req.params.projectKey;

  // Mock implementation
  const mockIssues = [
    { key: `${projectKey}-1`, summary: "Example Issue 1", status: "To Do" },
    {
      key: `${projectKey}-2`,
      summary: "Example Issue 2",
      status: "In Progress",
    },
    { key: `${projectKey}-3`, summary: "Example Issue 3", status: "Done" },
  ];

  res.json(mockIssues);
});

// Get JIRA projects (mock)
router.get("/projects", (req, res) => {
  // Mock implementation
  const mockProjects = [
    { key: "PROJ", name: "Project One" },
    { key: "TEST", name: "Test Project" },
    { key: "DEV", name: "Development" },
  ];

  res.json(mockProjects);
});

module.exports = router;
