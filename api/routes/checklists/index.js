const express = require("express");
const router = express.Router();
const Checklist = require("../../models/Checklist");
const Task = require("../../models/Task");
const Template = require("../../models/Template");

// Get all checklists (optionally filtered by user)
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    const type = req.query.type;

    let checklists;
    if (type) {
      checklists = await Checklist.getByType(type);
      // Filter by user if needed
      if (userId) {
        checklists = checklists.filter(
          (checklist) => checklist.user_id === userId
        );
      }
    } else {
      checklists = await Checklist.getAll(userId);
    }

    res.json(checklists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get checklist by ID with tasks
router.get("/:id", async (req, res) => {
  try {
    const checklist = await Checklist.getById(req.params.id);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const tasks = await Task.getByChecklistId(req.params.id);

    res.json({
      ...checklist,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new checklist
router.post("/", async (req, res) => {
  try {
    const { user_id, template_id, name, description, tasks, type } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Checklist name is required" });
    }

    // Create checklist
    const checklist = await Checklist.create({
      user_id,
      template_id,
      name,
      description: description || "",
      type: type || "normal",
    });

    // If tasks are provided, create them
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const taskObjects = tasks.map((task, index) => ({
        checklist_id: checklist.id,
        title: task.title,
        description: task.description || "",
        position: index,
      }));

      await Task.createMultiple(taskObjects);
    }
    // If template_id is provided but no tasks, copy tasks from template
    else if (template_id) {
      // Create tasks from template (implementation needed)
      // This would require additional logic to fetch template tasks
    }

    // Get the created checklist with tasks
    const result = await Checklist.getById(checklist.id);
    const checklistTasks = await Task.getByChecklistId(checklist.id);

    res.status(201).json({
      ...result,
      tasks: checklistTasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update checklist
router.put("/:id", async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Checklist name is required" });
    }

    const checklist = await Checklist.getById(req.params.id);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const result = await Checklist.update(req.params.id, {
      name,
      description,
      type,
    });
    res.json({
      id: req.params.id,
      name,
      description,
      type: type || checklist.type,
      updated: result.changes > 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete checklist
router.delete("/:id", async (req, res) => {
  try {
    const checklist = await Checklist.getById(req.params.id);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const result = await Checklist.delete(req.params.id);
    res.json({ id: req.params.id, deleted: result.changes > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create checklist from template
router.post("/from-template/:templateId", async (req, res) => {
  try {
    const { user_id, name, type } = req.body;
    const templateId = req.params.templateId;

    if (!name) {
      return res.status(400).json({ error: "Checklist name is required" });
    }

    // Get template to ensure it exists
    const template = await Template.getById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Create checklist
    const checklist = await Checklist.create({
      user_id,
      template_id: templateId,
      name,
      description: req.body.description || template.description || "",
      type: type || "normal",
    });

    // TODO: Copy tasks from template to checklist
    // This would require additional implementation to get template tasks

    res.status(201).json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
