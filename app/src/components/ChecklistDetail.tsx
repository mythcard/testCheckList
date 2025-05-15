import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Checklist, Task } from "@/api";
import apiClient from "@/api";
import ChecklistItem from "./ChecklistItem";
import AddTaskForm from "./AddTaskForm";

interface ChecklistDetailProps {
  checklistId: number;
  onBack?: () => void;
}

export default function ChecklistDetail({
  checklistId,
  onBack,
}: ChecklistDetailProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setIsLoading(true);
        const checklistData = await apiClient.getChecklist(checklistId);
        setChecklist(checklistData);
        setTasks(checklistData.tasks || []);
      } catch (error) {
        console.error("Failed to fetch checklist:", error);
        setError("Failed to load checklist. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistId]);

  const handleTaskStatusChange = (updatedTask: Task) => {
    setTasks((prevTasks: Task[]) => {
      const newTasks = [...prevTasks];
      const index = newTasks.findIndex((task) => task.id === updatedTask.id);
      if (index !== -1) {
        newTasks[index] = updatedTask;
      }
      return newTasks;
    });
  };

  const handleTaskDelete = (taskId: number) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.filter((task: Task) => task.id !== taskId)
    );
  };

  const handleTaskAdded = (newTask: Task) => {
    setTasks((prevTasks: Task[]) => [...prevTasks, newTask]);
  };

  const getProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(
      (task: Task) => task.is_completed
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-500 mb-4">{error || "Checklist not found"}</p>
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
          <div className="mt-2 text-sm text-gray-500">
            Created: {new Date(checklist.created_at || "").toLocaleDateString()}
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

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <AddTaskForm checklistId={checklist.id} onTaskAdded={handleTaskAdded} />
      </div>

      <div className="mt-6">
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
          Tasks
        </h2>

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
              No tasks yet. Add your first task above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: Task) => (
              <ChecklistItem
                key={task.id}
                task={task}
                onStatusChange={handleTaskStatusChange}
                onDelete={handleTaskDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
