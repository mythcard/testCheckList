const express = require("express");
const router = express.Router();
const Template = require("../../models/Template");
const Task = require("../../models/Task");

// Get all templates
router.get("/", async (req, res) => {
  try {
    const templates = await Template.getAll();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get template by ID
router.get("/:id", async (req, res) => {
  try {
    const template = await Template.getWithTasks(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new template
router.post("/", async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: "Template name is required" });
    }

    const template = await Template.create({
      name: req.body.name,
      description: req.body.description || "",
      tasks: req.body.tasks || [],
    });

    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update template
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Template name is required" });
    }

    const template = await Template.getById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const result = await Template.update(req.params.id, { name, description });
    res.json({
      id: req.params.id,
      name,
      description,
      updated: result.changes > 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete template
router.delete("/:id", async (req, res) => {
  try {
    const template = await Template.getById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const result = await Template.delete(req.params.id);
    res.json({ id: req.params.id, deleted: result.changes > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get template tasks
router.get("/:id/tasks", async (req, res) => {
  try {
    const tasks = await Template.getTemplateTasks(req.params.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add task to template
router.post("/:id/tasks", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const template = await Template.getById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const task = await Template.addTemplateTask(req.params.id, {
      title,
      description: description || "",
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update template task
router.put("/:templateId/tasks/:taskId", async (req, res) => {
  try {
    const { title, description, position } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const result = await Template.updateTemplateTask(req.params.taskId, {
      title,
      description,
      position,
    });

    res.json({
      id: parseInt(req.params.taskId),
      title,
      description,
      position,
      updated: result.changes > 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete template task
router.delete("/:templateId/tasks/:taskId", async (req, res) => {
  try {
    const result = await Template.deleteTemplateTask(req.params.taskId);
    res.json({
      id: parseInt(req.params.taskId),
      deleted: result.changes > 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
