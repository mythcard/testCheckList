// API base URL
const API_URL = "http://localhost:3001/api";

// Types
export interface Template {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: number;
  checklist_id: number;
  title: string;
  description: string;
  is_completed: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface Checklist {
  id: number;
  user_id?: string;
  template_id?: number;
  name: string;
  description: string;
  type?: "normal" | "sequential";
  created_at?: string;
  updated_at?: string;
  tasks?: Task[];
}

// API Client
class ApiClient {
  // Templates
  async getTemplates(): Promise<Template[]> {
    const response = await fetch(`${API_URL}/templates`);
    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }
    return response.json();
  }

  async getTemplate(id: number): Promise<Template> {
    const response = await fetch(`${API_URL}/templates/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch template ${id}`);
    }
    return response.json();
  }

  async createTemplate(template: Partial<Template>): Promise<Template> {
    const response = await fetch(`${API_URL}/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error("Failed to create template");
    }
    return response.json();
  }

  async updateTemplate(
    id: number,
    template: Partial<Template>
  ): Promise<Template> {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error(`Failed to update template ${id}`);
    }
    return response.json();
  }

  async deleteTemplate(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete template ${id}`);
    }
  }

  // Checklists
  async getChecklists(
    userId?: string,
    type?: "normal" | "sequential"
  ): Promise<Checklist[]> {
    let url = `${API_URL}/checklists`;
    const params = new URLSearchParams();

    if (userId) params.append("userId", userId);
    if (type) params.append("type", type);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch checklists");
    }
    return response.json();
  }

  async getSequentialChecklists(userId?: string): Promise<Checklist[]> {
    return this.getChecklists(userId, "sequential");
  }

  async getChecklist(id: number): Promise<Checklist> {
    const response = await fetch(`${API_URL}/checklists/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch checklist ${id}`);
    }
    return response.json();
  }

  async createChecklist(checklist: Partial<Checklist>): Promise<Checklist> {
    const response = await fetch(`${API_URL}/checklists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checklist),
    });
    if (!response.ok) {
      throw new Error("Failed to create checklist");
    }
    return response.json();
  }

  async createChecklistFromTemplate(
    templateId: number,
    name: string,
    userId?: string,
    type?: "normal" | "sequential"
  ): Promise<Checklist> {
    const response = await fetch(
      `${API_URL}/checklists/from-template/${templateId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, user_id: userId, type }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to create checklist from template");
    }
    return response.json();
  }

  async updateChecklist(
    id: number,
    checklist: Partial<Checklist>
  ): Promise<Checklist> {
    const response = await fetch(`${API_URL}/checklists/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checklist),
    });
    if (!response.ok) {
      throw new Error(`Failed to update checklist ${id}`);
    }
    return response.json();
  }

  async deleteChecklist(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/checklists/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete checklist ${id}`);
    }
  }

  // Tasks
  async getTasks(checklistId: number): Promise<Task[]> {
    const response = await fetch(`${API_URL}/tasks/checklist/${checklistId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks for checklist ${checklistId}`);
    }
    return response.json();
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error("Failed to create task");
    }
    return response.json();
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Failed to update task ${id}`);
    }
    return response.json();
  }

  async toggleTaskComplete(id: number, isCompleted?: boolean): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}/toggle`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_completed: isCompleted }),
    });
    if (!response.ok) {
      throw new Error(`Failed to toggle task ${id}`);
    }
    return response.json();
  }

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete task ${id}`);
    }
  }

  // JIRA Integration
  async pushToJira(
    checklistId: number,
    jiraConfig: {
      jira_api_token: string;
      jira_base_url: string;
      jira_email: string;
      jira_project_key: string;
      parent_issue_key?: string;
      create_as_subtasks?: boolean;
    }
  ): Promise<any> {
    const response = await fetch(`${API_URL}/jira/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checklist_id: checklistId,
        ...jiraConfig,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to push checklist to JIRA");
    }
    return response.json();
  }

  async getJiraProjects(): Promise<any[]> {
    const response = await fetch(`${API_URL}/jira/projects`);
    if (!response.ok) {
      throw new Error("Failed to fetch JIRA projects");
    }
    return response.json();
  }

  async getJiraIssues(projectKey: string): Promise<any[]> {
    const response = await fetch(
      `${API_URL}/jira/projects/${projectKey}/issues`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch issues for JIRA project ${projectKey}`);
    }
    return response.json();
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
