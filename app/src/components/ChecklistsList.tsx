import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import { Button } from "@heroui/react";
import { Checklist, Template } from "@/api";
import apiClient from "@/api";

interface ChecklistsListProps {
  onSelectChecklist?: (checklist: Checklist) => void;
  onCreateChecklist?: () => void;
  userId?: string;
}

export default function ChecklistsList({
  onSelectChecklist,
  onCreateChecklist,
  userId,
}: ChecklistsListProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<"normal" | "sequential">(
    "normal"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [checklistsData, templatesData] = await Promise.all([
          apiClient.getChecklists(userId),
          apiClient.getTemplates(),
        ]);
        setChecklists(checklistsData);
        setTemplates(templatesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load checklists. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleCreateChecklist = async () => {
    if (!newChecklistName.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      let newChecklist;

      // If a template ID is selected, create from template
      if (selectedTemplateId) {
        newChecklist = await apiClient.createChecklistFromTemplate(
          selectedTemplateId,
          newChecklistName.trim(),
          userId,
          selectedType
        );
      } else {
        // Create a regular checklist if no template is selected
        newChecklist = await apiClient.createChecklist({
          name: newChecklistName.trim(),
          description: "",
          user_id: userId,
          type: selectedType,
        });
      }

      setChecklists((prev: Checklist[]) => [...prev, newChecklist]);
      setShowTemplateModal(false);
      setNewChecklistName("");
      setSelectedTemplateId(null);
      setSelectedType("normal");

      if (onSelectChecklist) {
        onSelectChecklist(newChecklist);
      }
    } catch (error) {
      console.error("Failed to create checklist:", error);
      setError("Failed to create checklist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewChecklistName(e.target.value);
  };

  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateId(Number(e.target.value) || null);
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as "normal" | "sequential");
  };

  const handleCardClick = (checklist: Checklist) => {
    if (onSelectChecklist) {
      onSelectChecklist(checklist);
    }
  };

  const handleButtonClick = (
    e: MouseEvent<HTMLButtonElement>,
    checklist: Checklist
  ) => {
    e.stopPropagation();
    if (onSelectChecklist) {
      onSelectChecklist(checklist);
    }
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
      <div className="text-center p-8 rounded-lg bg-red-50 border border-red-100">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Checklists</h1>
          <p className="text-gray-500 mt-1">Manage and track your tasks</p>
        </div>
        {onCreateChecklist && (
          <Button
            onClick={() => setShowTemplateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500"
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
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create Checklist
            </span>
          </Button>
        )}
      </div>

      {checklists.length === 0 ? (
        <div className="text-center p-10 border rounded-lg bg-white shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-500 mb-4">No checklists available.</p>
          {onCreateChecklist && (
            <Button
              onClick={() => setShowTemplateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create Your First Checklist
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {checklists.map((checklist: Checklist) => {
            const templateName = checklist.template_id
              ? templates.find((t: Template) => t.id === checklist.template_id)
                  ?.name
              : null;

            return (
              <div
                key={checklist.id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group"
                onClick={() => handleCardClick(checklist)}
              >
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition">
                    {checklist.name}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {templateName && (
                      <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        From template: {templateName}
                      </div>
                    )}
                    {checklist.type === "sequential" && (
                      <div className="text-xs bg-emerald-50 px-2 py-1 rounded-full text-emerald-700">
                        Sequential
                      </div>
                    )}
                  </div>

                  {checklist.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {checklist.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {new Date(
                        checklist.created_at || ""
                      ).toLocaleDateString()}
                    </div>
                    <Button
                      size="sm"
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={(e: MouseEvent<HTMLButtonElement>) =>
                        handleButtonClick(e, checklist)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for creating new checklist */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Checklist</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Fill in the details below. You can create a checklist with or
              without a template.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist Name
              </label>
              <input
                type="text"
                value={newChecklistName}
                onChange={handleChecklistNameChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter checklist name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist Type
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedType}
                onChange={handleTypeChange}
              >
                <option value="normal">Normal</option>
                <option value="sequential">Sequential (enforced order)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sequential checklists enforce the order of task completion.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Template (Optional)
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedTemplateId || ""}
                onChange={handleTemplateChange}
              >
                <option value="">
                  No template - Start with empty checklist
                </option>
                {templates.map((template: Template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Templates provide predefined tasks. You can add more tasks
                later.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowTemplateModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChecklist}
                disabled={isLoading || !newChecklistName.trim()}
                loading={isLoading}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
