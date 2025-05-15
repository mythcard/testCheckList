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
  };

  const handleBackFromChecklist = () => {
    setSelectedChecklist(null);
  };

  const handleBackFromTemplate = () => {
    setSelectedTemplate(null);
  };

  const handleToggleView = () => {
    setActiveView(activeView === "checklists" ? "templates" : "checklists");
    setSelectedChecklist(null);
    setSelectedTemplate(null);
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
              onCreateChecklist={() => {}}
              userId="user1" // Hardcoded for demo purposes
            />
          )
        ) : selectedTemplate ? (
          <div className="p-4 border rounded-lg">
            <button
              onClick={handleBackFromTemplate}
              className="mb-4 text-blue-600 hover:underline"
            >
              ← Back to Templates
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedTemplate.name}</h2>
            {selectedTemplate.description && (
              <p className="text-gray-600 mb-4">
                {selectedTemplate.description}
              </p>
            )}
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
              Create Checklist from Template
            </button>
          </div>
        ) : (
          <TemplatesList
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={() => {}}
          />
        )}
      </main>
    </div>
  );
}

export default App;
