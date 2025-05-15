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
      setIsLoading(true);
      const task = tasks.find((task) => task.id === taskId);
      if (!task) return;

      const newStatus = !task.is_completed;
      const updatedTask = await apiClient.toggleTaskComplete(taskId, newStatus);

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
      setError("Failed to update task. Please try again.");
    } finally {
      setIsLoading(false);
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
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        {onBack && <Button onClick={onBack}>Go Back</Button>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-2">
              ← Back
            </Button>
          )}
          <h1 className="text-2xl font-bold">{checklist.name}</h1>
          {checklist.description && (
            <p className="text-gray-600 mt-1">{checklist.description}</p>
          )}
          <p className="italic text-gray-500 mt-1">Type: Sequential</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Progress</div>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{getProgress()}%</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Tasks (Sequential)</h2>

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks available.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task, idx) => (
              <li
                key={task.id}
                className={`p-4 border rounded-lg flex items-center justify-between ${
                  task.is_completed ? "bg-green-50" : "bg-white"
                } ${
                  !task.is_completed && idx > 0 && !tasks[idx - 1].is_completed
                    ? "opacity-60"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Switch
                    checked={task.is_completed}
                    onChange={() => handleToggleTask(task.id, idx)}
                    disabled={
                      isLoading ||
                      (idx > 0 &&
                        !tasks.slice(0, idx).every((t) => t.is_completed))
                    }
                    className="bg-white"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        task.is_completed
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        className={`text-sm ${
                          task.is_completed ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  color={task.is_completed ? "danger" : "primary"}
                  variant={task.is_completed ? "outline" : "solid"}
                  onClick={() => handleToggleTask(task.id, idx)}
                  disabled={
                    isLoading ||
                    (idx > 0 &&
                      !tasks.slice(0, idx).every((t) => t.is_completed))
                  }
                >
                  {task.is_completed ? "Undo" : "Complete"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
