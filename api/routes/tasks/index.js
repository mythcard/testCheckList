const express = require("express");
const router = express.Router();
const Task = require("../../models/Task");

// Get all tasks for a checklist
router.get("/checklist/:checklistId", async (req, res) => {
  try {
    const tasks = await Task.getByChecklistId(req.params.checklistId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    const { checklist_id, title, description, position } = req.body;

    if (!checklist_id) {
      return res.status(400).json({ error: "Checklist ID is required" });
    }

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const task = await Task.create({
      checklist_id,
      title,
      description: description || "",
      position: position || 0,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, is_completed, position } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const result = await Task.update(req.params.id, {
      title,
      description: description || "",
      is_completed:
        is_completed !== undefined ? is_completed : task.is_completed,
      position: position !== undefined ? position : task.position,
    });

    res.json({
      id: req.params.id,
      title,
      description: description || "",
      is_completed:
        is_completed !== undefined ? is_completed : task.is_completed,
      position: position !== undefined ? position : task.position,
      updated: result.changes > 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle task completion status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const newStatus =
      req.body.is_completed !== undefined
        ? !!req.body.is_completed
        : !task.is_completed;

    const result = await Task.toggleComplete(req.params.id, newStatus);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const result = await Task.delete(req.params.id);
    res.json({ id: req.params.id, deleted: result.changes > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
