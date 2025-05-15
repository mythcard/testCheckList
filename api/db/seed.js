const db = require("./database");

// Seed templates and tasks
const seedDatabase = () => {
  console.log("Seeding database with sample data...");

  // Drop tables if they exist
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS tasks");
    db.run("DROP TABLE IF EXISTS checklists");
    db.run("DROP TABLE IF EXISTS template_tasks");
    db.run("DROP TABLE IF EXISTS templates");

    // Create tables fresh
    db.run(`
      CREATE TABLE templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE template_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        position INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE checklists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        template_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates (id)
      )
    `);

    db.run(`
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checklist_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        is_completed BOOLEAN DEFAULT 0,
        position INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (checklist_id) REFERENCES checklists (id) ON DELETE CASCADE
      )
    `);

    // Seed templates
    const templateStmt = db.prepare(
      "INSERT INTO templates (name, description) VALUES (?, ?)"
    );

    const templates = [
      {
        name: "Project Kickoff",
        description: "Template for starting new projects",
      },
      {
        name: "Sprint Planning",
        description: "Tasks to prepare for sprint planning",
      },
      {
        name: "Bug Report",
        description: "Standard bug report process",
      },
      {
        name: "Deployment Checklist",
        description: "Sequential checklist for deployment process",
      },
    ];

    templates.forEach((template) => {
      templateStmt.run([template.name, template.description]);
    });
    templateStmt.finalize();

    // Get template IDs
    db.all("SELECT id, name FROM templates", [], (err, rows) => {
      if (err) {
        console.error("Error getting templates:", err.message);
        return;
      }

      const templateIds = {};
      rows.forEach((row) => {
        templateIds[row.name] = row.id;
      });

      // Seed template tasks
      const templateTasksMap = {
        "Project Kickoff": [
          {
            title: "Create project repository",
            description: "Setup Git repository for the project",
            position: 0,
          },
          {
            title: "Schedule kickoff meeting",
            description: "Invite all stakeholders to the kickoff",
            position: 1,
          },
          {
            title: "Prepare project brief",
            description: "Document project goals, timeline, and deliverables",
            position: 2,
          },
          {
            title: "Setup project management tools",
            description: "Configure JIRA, Slack channels, etc.",
            position: 3,
          },
        ],
        "Deployment Checklist": [
          {
            title: "Initialize repository",
            description: "Setup Git repository for deployment",
            position: 0,
          },
          {
            title: "Configure CI/CD pipeline",
            description: "Set up continuous integration and deployment",
            position: 1,
          },
          {
            title: "Deploy to staging environment",
            description: "Deploy application to the staging server",
            position: 2,
          },
          {
            title: "Run smoke tests",
            description: "Verify basic functionality in staging",
            position: 3,
          },
          {
            title: "Deploy to production",
            description: "Deploy to production environment",
            position: 4,
          },
        ],
        "Sprint Planning": [
          {
            title: "Review backlog",
            description: "Go through backlog and prioritize items",
            position: 0,
          },
          {
            title: "Define sprint goal",
            description: "Set clear objectives for the sprint",
            position: 1,
          },
          {
            title: "Estimate tasks",
            description: "Estimate effort for each task",
            position: 2,
          },
          {
            title: "Assign resources",
            description: "Assign team members to tasks",
            position: 3,
          },
        ],
        "Bug Report": [
          {
            title: "Reproduce the issue",
            description: "Document steps to reproduce the bug",
            position: 0,
          },
          {
            title: "Capture logs/screenshots",
            description: "Collect all relevant error information",
            position: 1,
          },
          {
            title: "Assign priority",
            description: "Set bug priority based on impact",
            position: 2,
          },
          {
            title: "Create JIRA ticket",
            description: "Document the bug in tracking system",
            position: 3,
          },
        ],
      };

      // Insert template tasks
      for (const [templateName, tasks] of Object.entries(templateTasksMap)) {
        const templateId = templateIds[templateName];
        if (templateId) {
          const templateTaskStmt = db.prepare(
            "INSERT INTO template_tasks (template_id, title, description, position) VALUES (?, ?, ?, ?)"
          );

          tasks.forEach((task) => {
            templateTaskStmt.run([
              templateId,
              task.title,
              task.description,
              task.position,
            ]);
          });

          templateTaskStmt.finalize();
        }
      }

      // Seed normal checklist
      db.run(
        "INSERT INTO checklists (user_id, template_id, name, description, type) VALUES (?, ?, ?, ?, ?)",
        [
          "user1",
          templateIds["Project Kickoff"],
          "New Project Alpha",
          "Kickoff checklist for Project Alpha",
          "normal",
        ],
        function (err) {
          if (err) {
            console.error("Error creating checklist:", err.message);
            return;
          }

          const checklistId = this.lastID;

          // Seed tasks for the normal checklist
          const taskStmt = db.prepare(
            "INSERT INTO tasks (checklist_id, title, description, is_completed, position) VALUES (?, ?, ?, ?, ?)"
          );

          const tasks = [
            {
              title: "Create project repository",
              description: "Setup Git repository for the project",
              is_completed: 1,
              position: 0,
            },
            {
              title: "Schedule kickoff meeting",
              description: "Invite all stakeholders to the kickoff",
              is_completed: 0,
              position: 1,
            },
            {
              title: "Prepare project brief",
              description: "Document project goals, timeline, and deliverables",
              is_completed: 0,
              position: 2,
            },
            {
              title: "Setup project management tools",
              description: "Configure JIRA, Slack channels, etc.",
              is_completed: 0,
              position: 3,
            },
          ];

          tasks.forEach((task) => {
            taskStmt.run([
              checklistId,
              task.title,
              task.description,
              task.is_completed,
              task.position,
            ]);
          });

          taskStmt.finalize();

          // Seed sequential checklist
          db.run(
            "INSERT INTO checklists (user_id, template_id, name, description, type) VALUES (?, ?, ?, ?, ?)",
            [
              "user1",
              templateIds["Deployment Checklist"],
              "Application Deployment",
              "Sequential checklist for deploying our application",
              "sequential",
            ],
            function (err) {
              if (err) {
                console.error(
                  "Error creating sequential checklist:",
                  err.message
                );
                return;
              }

              const seqChecklistId = this.lastID;

              // Seed tasks for the sequential checklist
              const seqTaskStmt = db.prepare(
                "INSERT INTO tasks (checklist_id, title, description, is_completed, position) VALUES (?, ?, ?, ?, ?)"
              );

              const seqTasks = [
                {
                  title: "Initialize repository",
                  description: "Setup Git repository for deployment",
                  is_completed: 0,
                  position: 0,
                },
                {
                  title: "Configure CI/CD pipeline",
                  description: "Set up continuous integration and deployment",
                  is_completed: 0,
                  position: 1,
                },
                {
                  title: "Deploy to staging environment",
                  description: "Deploy application to the staging server",
                  is_completed: 0,
                  position: 2,
                },
                {
                  title: "Run smoke tests",
                  description: "Verify basic functionality in staging",
                  is_completed: 0,
                  position: 3,
                },
                {
                  title: "Deploy to production",
                  description: "Deploy to production environment",
                  is_completed: 0,
                  position: 4,
                },
              ];

              seqTasks.forEach((task) => {
                seqTaskStmt.run([
                  seqChecklistId,
                  task.title,
                  task.description,
                  task.is_completed,
                  task.position,
                ]);
              });

              seqTaskStmt.finalize();
              console.log("Database seeded successfully");
            }
          );
        }
      );
    });
  });
};

// Check if this script is being run directly
if (require.main === module) {
  seedDatabase();

  // Close database connection after seeding
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed");
      }
      process.exit(0);
    });
  }, 2000); // Increased timeout to ensure all operations complete
}

module.exports = { seedDatabase };
