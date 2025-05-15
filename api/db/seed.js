const db = require("./database");

// Seed templates and tasks
const seedDatabase = () => {
  console.log("Seeding database with sample data...");

  // Create tables if they don't exist
  db.serialize(() => {
    // Templates table
    db.run(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Checklists table
    db.run(`
      CREATE TABLE IF NOT EXISTS checklists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        template_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates (id)
      )
    `);

    // Tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
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

    // Clear existing data
    db.run("DELETE FROM tasks");
    db.run("DELETE FROM checklists");
    db.run("DELETE FROM templates");

    // Reset auto-increment counters
    db.run("DELETE FROM sqlite_sequence WHERE name='tasks'");
    db.run("DELETE FROM sqlite_sequence WHERE name='checklists'");
    db.run("DELETE FROM sqlite_sequence WHERE name='templates'");

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

      // Seed a sample checklist
      db.run(
        "INSERT INTO checklists (user_id, template_id, name, description) VALUES (?, ?, ?, ?)",
        [
          "user1",
          templateIds["Project Kickoff"],
          "New Project Alpha",
          "Kickoff checklist for Project Alpha",
        ],
        function (err) {
          if (err) {
            console.error("Error creating checklist:", err.message);
            return;
          }

          const checklistId = this.lastID;

          // Seed tasks for the checklist
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
          console.log("Database seeded successfully");
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
