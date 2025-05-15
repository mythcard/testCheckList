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

  const handleCreateFromTemplate = async () => {
    if (!newChecklistName.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      const newChecklist = await apiClient.createChecklistFromTemplate(
        selectedTemplateId || 0,
        newChecklistName.trim(),
        userId,
        selectedType
      );

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
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Checklists</h1>
        {onCreateChecklist && (
          <Button onClick={() => setShowTemplateModal(true)}>
            Create Checklist
          </Button>
        )}
      </div>

      {checklists.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No checklists available.</p>
          {onCreateChecklist && (
            <Button onClick={() => setShowTemplateModal(true)}>
              Create Your First Checklist
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {checklists.map((checklist: Checklist) => {
            const templateName = checklist.template_id
              ? templates.find((t: Template) => t.id === checklist.template_id)
                  ?.name
              : null;

            return (
              <div
                key={checklist.id}
                className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => handleCardClick(checklist)}
              >
                <h2 className="text-lg font-semibold mb-1">{checklist.name}</h2>
                {templateName && (
                  <div className="text-xs text-blue-600 mb-2">
                    From template: {templateName}
                  </div>
                )}
                {checklist.type === "sequential" && (
                  <div className="text-xs bg-green-100 inline-block px-2 py-0.5 rounded text-green-800 mb-2">
                    Sequential
                  </div>
                )}
                {checklist.description && (
                  <p className="text-gray-600 text-sm mb-3">
                    {checklist.description}
                  </p>
                )}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e: MouseEvent<HTMLButtonElement>) =>
                      handleButtonClick(e, checklist)
                    }
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* This would typically be a modal component, but we're keeping it simple */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Checklist</h2>

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
                <option value="">No template</option>
                {templates.map((template: Template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
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
                onClick={handleCreateFromTemplate}
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
