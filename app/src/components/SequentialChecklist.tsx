import { useState, useEffect } from "react";
import { Button, Switch } from "@heroui/react";
import { Task, Checklist } from "@/api";
import apiClient from "@/api";

interface SequentialChecklistProps {
  checklist: Checklist;
  onBack?: () => void;
}

export default function SequentialChecklist({
  checklist,
  onBack,
}: SequentialChecklistProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskInProgress, setTaskInProgress] = useState<number | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const checklistData = await apiClient.getChecklist(checklist.id);
        // Sort tasks by position if available
        const sortedTasks = checklistData.tasks || [];
        sortedTasks.sort((a: Task, b: Task) => {
          if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position;
          }
          return 0;
        });
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [checklist.id]);

  const handleToggleTask = async (taskId: number, index: number) => {
    // If enforcing sequential order, check if previous tasks are completed
    if (!tasks.slice(0, index).every((task) => task.is_completed)) {
      alert("Please complete previous tasks first.");
      return;
    }

    try {
      setTaskInProgress(taskId);
      const task = tasks.find((task) => task.id === taskId);
      if (!task) return;

      const newStatus = !task.is_completed;

      // Optimistically update UI
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, is_completed: newStatus } : t
      );
      setTasks(updatedTasks);

      // Apply minimum loading time of 1 second
      const startTime = Date.now();

      // Make the API call
      const updatedTask = await apiClient.toggleTaskComplete(taskId, newStatus);

      // Calculate remaining time for minimum 1s loading
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      setTimeout(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, is_completed: updatedTask.is_completed }
              : task
          )
        );
        setTaskInProgress(null);
      }, remainingTime);
    } catch (error) {
      console.error("Failed to update task status:", error);
      setError("Failed to update task. Please try again.");
      // Revert optimistic update
      const originalTask = tasks.find((task) => task.id === taskId);
      if (originalTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? originalTask : task))
        );
      }
      setTaskInProgress(null);
    }
  };

  const getProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.is_completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-500 mb-4">{error}</p>
        {onBack && (
          <Button
            onClick={onBack}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-8 border-b pb-4">
        <div>
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-3 text-indigo-600 hover:bg-indigo-50"
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
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Checklists
              </span>
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{checklist.name}</h1>
          {checklist.description && (
            <p className="text-gray-600 mt-1">{checklist.description}</p>
          )}
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
              Sequential
            </span>
            <span className="text-sm text-gray-500 ml-3">
              Created:{" "}
              {new Date(checklist.created_at || "").toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Progress</div>
          <div className="flex items-center">
            <div className="w-36 bg-gray-200 rounded-full h-2.5 mr-2">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{getProgress()}%</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Sequential Tasks
        </h2>

        <div className="mb-3 p-3 bg-indigo-50 text-indigo-700 rounded-md text-sm flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Tasks must be completed in sequence. You must complete each task
            before moving to the next one.
          </span>
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-gray-500 mb-1">No tasks available.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task, idx) => (
              <li
                key={task.id}
                className={`p-4 border rounded-lg flex items-center justify-between transition-all duration-300 ${
                  task.is_completed
                    ? "bg-green-50 border-green-100"
                    : "bg-white"
                } ${
                  !task.is_completed && idx > 0 && !tasks[idx - 1].is_completed
                    ? "opacity-75 bg-gray-50 border-gray-200"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Switch
                    checked={task.is_completed}
                    onChange={() => handleToggleTask(task.id, idx)}
                    disabled={
                      taskInProgress !== null ||
                      (idx > 0 &&
                        !tasks.slice(0, idx).every((t) => t.is_completed))
                    }
                    className="bg-white"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium transition-all duration-300 ${
                        task.is_completed
                          ? "text-gray-600 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        className={`text-sm transition-all duration-300 ${
                          task.is_completed ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                    {idx > 0 && !tasks[idx - 1].is_completed && (
                      <div className="text-xs text-amber-600 mt-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Complete previous tasks first
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {taskInProgress === task.id && (
                    <div className="mr-2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <Button
                    size="sm"
                    color={task.is_completed ? "danger" : "primary"}
                    variant={task.is_completed ? "outline" : "solid"}
                    onClick={() => handleToggleTask(task.id, idx)}
                    disabled={
                      taskInProgress !== null ||
                      (idx > 0 &&
                        !tasks.slice(0, idx).every((t) => t.is_completed))
                    }
                    className={
                      task.is_completed
                        ? "border-red-300 text-red-700 hover:bg-red-50"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }
                  >
                    {task.is_completed ? "Undo" : "Complete"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
