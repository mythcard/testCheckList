import { useState, ChangeEvent } from "react";
import { Button, Input } from "@heroui/react";
import { Task } from "@/api";
import apiClient from "@/api";

interface AddTaskFormProps {
  checklistId: number;
  onTaskAdded?: (task: Task) => void;
}

export default function AddTaskForm({
  checklistId,
  onTaskAdded,
}: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setError("");
    setIsLoading(true);

    // Start timing for minimum 1s loading
    const startTime = Date.now();

    try {
      const newTask = await apiClient.createTask({
        checklist_id: checklistId,
        title: title.trim(),
        description: description.trim(),
      });

      // Calculate remaining time for minimum 1s loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      // Delay completion by remaining time
      setTimeout(() => {
        if (onTaskAdded) {
          onTaskAdded(newTask);
        }

        // Reset form
        setTitle("");
        setDescription("");
        setIsLoading(false);
      }, remainingTime);
    } catch (error) {
      console.error("Failed to add task:", error);
      setError("Failed to add task. Please try again.");
      setIsLoading(false);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg">
      <h3 className="font-medium text-gray-800 mb-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-indigo-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add New Task
      </h3>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Task title"
            value={title}
            onChange={handleTitleChange}
            disabled={isLoading}
            required
            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-1">
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={handleDescriptionChange}
            disabled={isLoading}
            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-shrink-0">
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
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
    </form>
  );
}
