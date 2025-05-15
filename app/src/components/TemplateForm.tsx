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
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          {template ? "Edit Template" : "Create New Template"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-red-500 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
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
              className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
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
              className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Template Tasks
        </h2>

        <div className="space-y-4 mb-6">
          <div className="p-3 bg-indigo-50 rounded-md mb-4">
            <p className="text-sm text-indigo-700">
              Add tasks that will be included when users create checklists from
              this template.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
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
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1">
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
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-shrink-0 md:self-end">
              <Button
                type="button"
                onClick={addTask}
                disabled={isLoading || !newTaskTitle.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto mt-6 md:mt-0"
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Task
                </span>
              </Button>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center p-10 border border-dashed rounded-lg bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 18v-6M9 15h6"
              />
            </svg>
            <p className="text-gray-500 mb-1">
              No tasks added yet. Add your first task above.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                          disabled={isLoading || index === 0}
                          onClick={() => moveTaskUp(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                          disabled={isLoading || index === tasks.length - 1}
                          onClick={() => moveTaskDown(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          disabled={isLoading}
                          onClick={() => removeTask(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !name.trim() || tasks.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : template ? (
            "Update Template"
          ) : (
            "Create Template"
          )}
        </Button>
      </div>
    </form>
  );
}
