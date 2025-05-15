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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-5xl flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TaskMaster</h1>
          <button
            onClick={handleToggleView}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {activeView === "checklists" ? "View Templates" : "View Checklists"}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl flex-grow">
        {activeView === "checklists" ? (
          selectedChecklist ? (
            renderChecklist()
          ) : (
            <ChecklistsList
              onSelectChecklist={handleSelectChecklist}
              onCreateChecklist={() => setShowTemplateModal(true)}
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

      {/* <footer className="py-4 border-t border-gray-200 absolute bottom-0 w-full">
        <div className="container mx-auto px-4 max-w-5xl text-center text-gray-500 text-sm">
          TaskMaster &copy; {new Date().getFullYear()} - Checklist Management
          App
        </div>
      </footer> */}

      {/* Template to Checklist Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Create New Checklist
            </h2>

            {selectedTemplate ? (
              <p className="text-gray-600 mb-4">
                Using template:{" "}
                <span className="font-medium text-indigo-600">
                  {selectedTemplate.name}
                </span>
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter checklist name"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist Type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleBackFromTemplate}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFromTemplate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={isLoading || !newChecklistName.trim()}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Checklist"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
