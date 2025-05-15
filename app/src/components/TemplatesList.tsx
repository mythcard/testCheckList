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
            className="text-gray-600"
          >
            ← Back to Templates
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
            className="text-gray-600"
          >
            ← Back to Templates
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
        <h1 className="text-2xl font-bold">Checklist Templates</h1>
        <Button onClick={handleCreateClick}>Create Template</Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No templates available.</p>
          <Button onClick={handleCreateClick}>
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => onSelectTemplate && onSelectTemplate(template)}
            >
              <h2 className="text-lg font-semibold mb-2">{template.name}</h2>
              {template.description && (
                <p className="text-gray-600 text-sm mb-3">
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
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onSelectTemplate && onSelectTemplate(template);
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
