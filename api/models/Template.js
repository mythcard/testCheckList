const db = require("../db/database");

class Template {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM templates ORDER BY name", [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM templates WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getWithTasks(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM templates WHERE id = ?", [id], (err, template) => {
        if (err) {
          reject(err);
          return;
        }

        if (!template) {
          resolve(null);
          return;
        }

        // Get template tasks
        db.all(
          "SELECT * FROM template_tasks WHERE template_id = ? ORDER BY position",
          [id],
          (err, tasks) => {
            if (err) {
              reject(err);
              return;
            }

            resolve({
              ...template,
              tasks: tasks || [],
            });
          }
        );
      });
    });
  }

  static create(template) {
    return new Promise((resolve, reject) => {
      const { name, description, tasks } = template;

      // Begin transaction
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run(
          "INSERT INTO templates (name, description) VALUES (?, ?)",
          [name, description],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              reject(err);
              return;
            }

            const templateId = this.lastID;

            // If tasks are provided, add them
            if (tasks && Array.isArray(tasks) && tasks.length > 0) {
              const stmt = db.prepare(
                "INSERT INTO template_tasks (template_id, title, description, position) VALUES (?, ?, ?, ?)"
              );

              let hasError = false;

              tasks.forEach((task, index) => {
                stmt.run(
                  [templateId, task.title, task.description || "", index],
                  (err) => {
                    if (err && !hasError) {
                      hasError = true;
                      db.run("ROLLBACK");
                      stmt.finalize();
                      reject(err);
                    }
                  }
                );
              });

              stmt.finalize();

              if (hasError) return;
            }

            db.run("COMMIT", (err) => {
              if (err) {
                db.run("ROLLBACK");
                reject(err);
                return;
              }

              resolve({
                id: templateId,
                name,
                description,
                tasks: tasks || [],
              });
            });
          }
        );
      });
    });
  }

  static update(id, template) {
    return new Promise((resolve, reject) => {
      const { name, description } = template;
      db.run(
        "UPDATE templates SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, description, id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, changes: this.changes });
          }
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM templates WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static getTemplateTasks(templateId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM template_tasks WHERE template_id = ? ORDER BY position",
        [templateId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static addTemplateTask(templateId, task) {
    return new Promise((resolve, reject) => {
      // Get highest position
      db.get(
        "SELECT MAX(position) as maxPos FROM template_tasks WHERE template_id = ?",
        [templateId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          const position = row && row.maxPos !== null ? row.maxPos + 1 : 0;

          db.run(
            "INSERT INTO template_tasks (template_id, title, description, position) VALUES (?, ?, ?, ?)",
            [templateId, task.title, task.description || "", position],
            function (err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  id: this.lastID,
                  template_id: templateId,
                  title: task.title,
                  description: task.description || "",
                  position,
                });
              }
            }
          );
        }
      );
    });
  }

  static updateTemplateTask(taskId, task) {
    return new Promise((resolve, reject) => {
      const { title, description, position } = task;

      let query, params;

      if (position !== undefined) {
        query =
          "UPDATE template_tasks SET title = ?, description = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        params = [title, description || "", position, taskId];
      } else {
        query =
          "UPDATE template_tasks SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        params = [title, description || "", taskId];
      }

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: taskId, changes: this.changes });
        }
      });
    });
  }

  static deleteTemplateTask(taskId) {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM template_tasks WHERE id = ?",
        [taskId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: taskId, changes: this.changes });
          }
        }
      );
    });
  }
}

module.exports = Template;
