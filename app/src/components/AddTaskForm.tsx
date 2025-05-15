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

    try {
      const newTask = await apiClient.createTask({
        checklist_id: checklistId,
        title: title.trim(),
        description: description.trim(),
      });

      if (onTaskAdded) {
        onTaskAdded(newTask);
      }

      // Reset form
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to add task:", error);
      setError("Failed to add task. Please try again.");
    } finally {
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
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-lg bg-gray-50 mb-4"
    >
      <h3 className="font-medium text-gray-900 mb-2">Add New Task</h3>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <div className="mb-3">
        <Input
          placeholder="Task title"
          value={title}
          onChange={handleTitleChange}
          disabled={isLoading}
          required
          className="w-full"
        />
      </div>

      <div className="mb-3">
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={handleDescriptionChange}
          disabled={isLoading}
          className="w-full"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} loading={isLoading}>
          Add Task
        </Button>
      </div>
    </form>
  );
}
