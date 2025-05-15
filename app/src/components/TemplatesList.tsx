import { useState, useEffect, MouseEvent } from "react";
import { Button } from "@heroui/react";
import { Template } from "@/api";
import apiClient from "@/api";
import TemplateForm from "./TemplateForm";

interface TemplatesListProps {
  onSelectTemplate?: (template: Template) => void;
  onCreateTemplate?: () => void;
}

export default function TemplatesList({
  onSelectTemplate,
  onCreateTemplate,
}: TemplatesListProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const templatesData = await apiClient.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setError("Failed to load templates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateClick = () => {
    setShowCreateForm(true);
    if (onCreateTemplate) {
      onCreateTemplate();
    }
  };

  const handleEditClick = (
    e: MouseEvent<HTMLButtonElement>,
    template: Template
  ) => {
    e.stopPropagation();
    setEditingTemplate(template);
  };

  const handleSaveTemplate = (template: Template) => {
    // Refresh the templates list
    fetchTemplates();
    setShowCreateForm(false);
    setEditingTemplate(null);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
  };

  // If create form is shown
  if (showCreateForm) {
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancelForm}
            className="text-indigo-600 hover:bg-indigo-50 flex items-center"
          >
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
            Back to Templates
          </Button>
        </div>
        <TemplateForm onSave={handleSaveTemplate} onCancel={handleCancelForm} />
      </div>
    );
  }

  // If editing a template
  if (editingTemplate) {
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancelForm}
            className="text-indigo-600 hover:bg-indigo-50 flex items-center"
          >
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
            Back to Templates
          </Button>
        </div>
        <TemplateForm
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

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
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Checklist Templates
          </h1>
          <p className="text-gray-500 mt-1">
            Reusable task lists for your projects
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
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
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Template
          </span>
        </Button>
      </div>

      {templates.length === 0 ? (
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
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
          <p className="text-gray-500 mb-4">No templates available.</p>
          <Button
            onClick={handleCreateClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group"
              onClick={() => onSelectTemplate && onSelectTemplate(template)}
            >
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition">
                  {template.name}
                </h2>

                <div className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium mb-3">
                  Template
                </div>

                {template.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e: MouseEvent<HTMLButtonElement>) =>
                      handleEditClick(e, template)
                    }
                    className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      onSelectTemplate && onSelectTemplate(template);
                    }}
                  >
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Use Template
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
