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
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task: Task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
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
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error || "Checklist not found"}</p>
        {onBack && <Button onClick={onBack}>Go Back</Button>}
      </div>
    );
  }

  return (
    <div>
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

      <AddTaskForm checklistId={checklist.id} onTaskAdded={handleTaskAdded} />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Tasks</h2>

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tasks yet. Add your first task above.
          </p>
        ) : (
          <div>
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
