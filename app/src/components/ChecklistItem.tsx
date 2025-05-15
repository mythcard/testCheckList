import { useState } from "react";
import { Switch, Button } from "@heroui/react";
import { Task } from "@/api";
import apiClient from "@/api";

interface ChecklistItemProps {
  task: Task;
  onStatusChange?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

export default function ChecklistItem({
  task,
  onStatusChange,
  onDelete,
}: ChecklistItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.is_completed);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);

      const updatedTask = await apiClient.toggleTaskComplete(
        task.id,
        newStatus
      );

      if (onStatusChange) {
        onStatusChange(updatedTask);
      }
    } catch (error) {
      console.error("Failed to toggle task status:", error);
      setIsCompleted(isCompleted); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.deleteTask(task.id);

      if (onDelete) {
        onDelete(task.id);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg mb-2 ${isCompleted ? "bg-gray-50" : "bg-white"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <Switch
            checked={isCompleted}
            onChange={handleToggle}
            disabled={isLoading}
            className="bg-white"
          />
          <div className="flex-1">
            <h3
              className={`font-medium ${isCompleted ? "text-gray-500 line-through" : "text-gray-900"}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p
                className={`text-sm ${isCompleted ? "text-gray-400" : "text-gray-700"}`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          color="danger"
          variant="ghost"
          onClick={handleDelete}
          disabled={isLoading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
