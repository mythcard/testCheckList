import { useState, useEffect, ChangeEvent } from "react";
import { Button, Input } from "@heroui/react";
import { Template, TemplateTask } from "@/api";
import apiClient from "@/api";

interface TemplateFormProps {
  template?: Template | null;
  onSave?: (template: Template) => void;
  onCancel?: () => void;
}

export default function TemplateForm({
  template,
  onSave,
  onCancel,
}: TemplateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with template data if provided
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      if (template.tasks) {
        setTasks([...template.tasks]);
      } else {
        // Fetch tasks if not already provided
        const fetchTemplateTasks = async () => {
          try {
            const templateTasks = await apiClient.getTemplateTasks(template.id);
            setTasks(templateTasks);
          } catch (error) {
            console.error("Failed to fetch template tasks:", error);
            setError("Failed to load template tasks");
          }
        };
        fetchTemplateTasks();
      }
    }
  }, [template]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleNewTaskTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTaskTitle(e.target.value);
  };

  const handleNewTaskDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTaskDescription(e.target.value);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: TemplateTask = {
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      position: tasks.length,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const removeTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    // Update positions
    setTasks(
      updatedTasks.map((task, idx) => ({
        ...task,
        position: idx,
      }))
    );
  };

  const moveTaskUp = (index: number) => {
    if (index === 0) return;
    const updatedTasks = [...tasks];
    const task = updatedTasks[index];
    updatedTasks[index] = updatedTasks[index - 1];
    updatedTasks[index - 1] = task;
    // Update positions
    setTasks(
      updatedTasks.map((task, idx) => ({
        ...task,
        position: idx,
      }))
    );
  };

  const moveTaskDown = (index: number) => {
    if (index === tasks.length - 1) return;
    const updatedTasks = [...tasks];
    const task = updatedTasks[index];
    updatedTasks[index] = updatedTasks[index + 1];
    updatedTasks[index + 1] = task;
    // Update positions
    setTasks(
      updatedTasks.map((task, idx) => ({
        ...task,
        position: idx,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let savedTemplate: Template;

      // Create or update template
      if (template?.id) {
        // Update existing template
        savedTemplate = await apiClient.updateTemplate(template.id, {
          name: name.trim(),
          description: description.trim(),
        });

        // Handle tasks separately - in a real app, you might want to implement
        // a more sophisticated diff approach to only update what changed

        // For this demo, we'll delete all tasks and recreate them
        const existingTasks = await apiClient.getTemplateTasks(template.id);

        // Delete existing tasks
        for (const task of existingTasks) {
          if (task.id) {
            await apiClient.deleteTemplateTask(template.id, task.id);
          }
        }

        // Add new tasks
        for (const [index, task] of tasks.entries()) {
          await apiClient.addTemplateTask(template.id, {
            title: task.title,
            description: task.description,
            position: index,
          });
        }

        // Refresh template with tasks
        savedTemplate = await apiClient.getTemplate(template.id);
      } else {
        // Create new template with tasks
        savedTemplate = await apiClient.createTemplate({
          name: name.trim(),
          description: description.trim(),
          tasks: tasks.map((task, index) => ({
            ...task,
            position: index,
          })),
        });
      }

      if (onSave) {
        onSave(savedTemplate);
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      setError("Failed to save template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {template ? "Edit Template" : "Create New Template"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Template Name
            </label>
            <Input
              id="name"
              placeholder="Enter template name"
              value={name}
              onChange={handleNameChange}
              disabled={isLoading}
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optional)
            </label>
            <Input
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={handleDescriptionChange}
              disabled={isLoading}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Template Tasks</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="taskTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Task Title
            </label>
            <Input
              id="taskTitle"
              placeholder="Enter task title"
              value={newTaskTitle}
              onChange={handleNewTaskTitleChange}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="taskDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Task Description (optional)
            </label>
            <Input
              id="taskDescription"
              placeholder="Enter task description"
              value={newTaskDescription}
              onChange={handleNewTaskDescriptionChange}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div>
            <Button
              type="button"
              onClick={addTask}
              disabled={isLoading || !newTaskTitle.trim()}
              className="w-full"
            >
              Add Task
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-800">Tasks List:</h3>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-sm p-4 text-center bg-gray-50 border rounded-md">
              No tasks added yet
            </p>
          ) : (
            <ul className="border rounded-md divide-y">
              {tasks.map((task, index) => (
                <li key={index} className="p-3 flex items-start">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => moveTaskUp(index)}
                      disabled={index === 0 || isLoading}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => moveTaskDown(index)}
                      disabled={index === tasks.length - 1 || isLoading}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color="danger"
                      variant="ghost"
                      onClick={() => removeTask(index)}
                      disabled={isLoading}
                    >
                      ×
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} loading={isLoading}>
          {template ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
