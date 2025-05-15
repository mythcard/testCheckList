import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import ChecklistsList from "@/components/ChecklistsList";
import TemplatesList from "@/components/TemplatesList";
import ChecklistDetail from "@/components/ChecklistDetail";
import SequentialChecklist from "@/components/SequentialChecklist";
import { Checklist, Template } from "@/api";
import apiClient from "@/api";

function App() {
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [activeView, setActiveView] = useState<"checklists" | "templates">(
    "checklists"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [selectedChecklistType, setSelectedChecklistType] = useState<
    "normal" | "sequential"
  >("normal");

  const handleSelectChecklist = async (checklist: Checklist) => {
    try {
      setIsLoading(true);
      // Fetch the full checklist with tasks
      const fullChecklist = await apiClient.getChecklist(checklist.id);
      setSelectedChecklist(fullChecklist);
    } catch (error) {
      console.error("Failed to load checklist details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleBackFromChecklist = () => {
    setSelectedChecklist(null);
  };

  const handleBackFromTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateModal(false);
  };

  const handleToggleView = () => {
    setActiveView(activeView === "checklists" ? "templates" : "checklists");
    setSelectedChecklist(null);
    setSelectedTemplate(null);
    setShowTemplateModal(false);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate && !newChecklistName.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      let newChecklist;

      if (selectedTemplate) {
        // Create checklist from template
        newChecklist = await apiClient.createChecklistFromTemplate(
          selectedTemplate.id,
          newChecklistName.trim(),
          "user1", // Hardcoded for demo
          selectedChecklistType
        );
      } else {
        // Create empty checklist if no template
        newChecklist = await apiClient.createChecklist({
          name: newChecklistName.trim(),
          description: "",
          user_id: "user1", // Hardcoded for demo
          type: selectedChecklistType,
        });
      }

      // Close modal and show the new checklist
      setShowTemplateModal(false);
      setNewChecklistName("");
      setSelectedTemplate(null);
      setActiveView("checklists");

      // Fetch the full checklist with tasks and select it
      const fullChecklist = await apiClient.getChecklist(newChecklist.id);
      setSelectedChecklist(fullChecklist);
    } catch (error) {
      console.error("Failed to create checklist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewChecklistName(e.target.value);
  };

  const handleChecklistTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedChecklistType(e.target.value as "normal" | "sequential");
  };

  // Render the appropriate checklist component based on type
  const renderChecklist = () => {
    if (!selectedChecklist) return null;

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      );
    }

    if (selectedChecklist.type === "sequential") {
      return (
        <SequentialChecklist
          checklist={selectedChecklist}
          onBack={handleBackFromChecklist}
        />
      );
    } else {
      return (
        <ChecklistDetail
          checklistId={selectedChecklist.id}
          onBack={handleBackFromChecklist}
        />
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-blue-600">Checklist App</h1>
        <button
          onClick={handleToggleView}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {activeView === "checklists" ? "View Templates" : "View Checklists"}
        </button>
      </header>

      <main>
        {activeView === "checklists" ? (
          selectedChecklist ? (
            renderChecklist()
          ) : (
            <ChecklistsList
              onSelectChecklist={handleSelectChecklist}
              onCreateChecklist={() => setActiveView("templates")}
              userId="user1" // Hardcoded for demo purposes
            />
          )
        ) : (
          <TemplatesList
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={() => {}}
          />
        )}
      </main>

      {/* Template to Checklist Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Checklist</h2>

            {selectedTemplate ? (
              <p className="text-gray-600 mb-4">
                Using template:{" "}
                <span className="font-medium">{selectedTemplate.name}</span>
              </p>
            ) : (
              <p className="text-gray-600 mb-4">
                Creating a new empty checklist
              </p>
            )}

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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist Type
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedChecklistType}
                onChange={handleChecklistTypeChange}
              >
                <option value="normal">Normal</option>
                <option value="sequential">Sequential (enforced order)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sequential checklists enforce the order of task completion.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleBackFromTemplate}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFromTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isLoading || !newChecklistName.trim()}
              >
                {isLoading ? "Creating..." : "Create Checklist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
