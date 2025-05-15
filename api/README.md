# Checklist API Server

This folder contains the Express.js API server for the checklist-based productivity tool.

## Features

- RESTful API for managing checklist templates and user checklists
- SQLite database storage
- JIRA integration for pushing checklists to JIRA boards

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a `.env` file with the following content:

   ```
   PORT=3001
   NODE_ENV=development
   ```

3. Seed the database with sample data:
   ```
   node db/seed.js
   ```

## Running the server

Development mode with auto-reload:

```
npm run dev
```

Production mode:

```
npm start
```

## Database Schema

- **templates**: Reusable checklist templates

  - id, name, description, created_at, updated_at

- **checklists**: User-specific checklists (can be based on templates)

  - id, user_id, template_id, name, description, created_at, updated_at

- **tasks**: Individual checklist items
  - id, checklist_id, title, description, is_completed, position, created_at, updated_at

## API Endpoints

### Templates

- `GET /api/templates`: Get all templates
- `GET /api/templates/:id`: Get template by ID
- `POST /api/templates`: Create new template
- `PUT /api/templates/:id`: Update template
- `DELETE /api/templates/:id`: Delete template

### Checklists

- `GET /api/checklists`: Get all checklists (optionally filtered by user_id)
- `GET /api/checklists/:id`: Get checklist by ID (includes tasks)
- `POST /api/checklists`: Create new checklist
- `PUT /api/checklists/:id`: Update checklist
- `DELETE /api/checklists/:id`: Delete checklist
- `POST /api/checklists/from-template/:templateId`: Create checklist from template

### Tasks

- `GET /api/tasks/checklist/:checklistId`: Get all tasks for a checklist
- `GET /api/tasks/:id`: Get task by ID
- `POST /api/tasks`: Create new task
- `PUT /api/tasks/:id`: Update task
- `PATCH /api/tasks/:id/toggle`: Toggle task completion status
- `DELETE /api/tasks/:id`: Delete task

### JIRA Integration

- `POST /api/jira/push`: Push checklist to JIRA
- `GET /api/jira/projects`: Get JIRA projects (mock)
- `GET /api/jira/projects/:projectKey/issues`: Get JIRA project issues (mock)
