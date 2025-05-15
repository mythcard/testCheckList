import { useState, useEffect } from "react";
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
  const [localTask, setLocalTask] = useState<Task>(task);

  // Update local state when task prop changes
  useEffect(() => {
    setLocalTask(task);
    setIsCompleted(task.is_completed);
  }, [task]);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const newStatus = !isCompleted;

      // Optimistically update UI
      setIsCompleted(newStatus);

      // Apply minimum loading time of 1 second
      const startTime = Date.now();

      console.log("localTask", localTask);
      // Make the API call
      const updatedTask = await apiClient.toggleTaskComplete(
        localTask.id,
        newStatus
      );
      console.log("updatedTask", updatedTask);

      // Calculate how much time has passed
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      // Set a timeout for the minimum loading time
      setTimeout(() => {
        setLocalTask((prevTask) => ({
          ...prevTask,
          is_completed: updatedTask.is_completed,
        }));

        if (onStatusChange) {
          onStatusChange(updatedTask);
        }
        setIsLoading(false);
      }, remainingTime);
    } catch (error) {
      console.error("Failed to toggle task status:", error);
      // Revert UI on error
      setIsCompleted(localTask.is_completed);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setIsLoading(true);

      // Apply minimum loading time of 1 second
      const startTime = Date.now();

      await apiClient.deleteTask(localTask.id);

      // Calculate remaining time for minimum 1s loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      setTimeout(() => {
        if (onDelete) {
          onDelete(localTask.id);
        }
        setIsLoading(false);
      }, remainingTime);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg mb-2 transition-colors duration-300 ${
        isCompleted ? "bg-gray-50 border-gray-200" : "bg-white"
      } hover:shadow-sm`}
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
              className={`font-medium transition-all duration-300 ${
                isCompleted ? "text-gray-600 line-through" : "text-gray-900"
              }`}
            >
              {localTask.title}
            </h3>
            {localTask.description && (
              <p
                className={`text-sm transition-all duration-300 ${
                  isCompleted ? "text-gray-500" : "text-gray-700"
                }`}
              >
                {localTask.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {isLoading && (
            <div className="mr-3 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <Button
            size="sm"
            color="danger"
            variant="ghost"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-600 hover:bg-red-50"
          >
            <span className="flex items-center">
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
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
