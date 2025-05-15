const db = require("../db/database");

class Task {
  static getByChecklistId(checklistId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM tasks WHERE checklist_id = ? ORDER BY position",
        [checklistId],
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

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static create(task) {
    return new Promise((resolve, reject) => {
      const { checklist_id, title, description, position = 0 } = task;
      db.run(
        "INSERT INTO tasks (checklist_id, title, description, position) VALUES (?, ?, ?, ?)",
        [checklist_id, title, description, position],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              checklist_id,
              title,
              description,
              position,
              is_completed: 0,
            });
          }
        }
      );
    });
  }

  static update(id, task) {
    return new Promise((resolve, reject) => {
      const { title, description, is_completed, position } = task;
      db.run(
        `UPDATE tasks 
         SET title = ?, 
             description = ?, 
             is_completed = ?, 
             position = ?,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [title, description, is_completed, position, id],
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

  static toggleComplete(id, isCompleted) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE tasks SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [isCompleted ? 1 : 0, id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, changes: this.changes, is_completed: isCompleted });
          }
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static createMultiple(tasks) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        "INSERT INTO tasks (checklist_id, title, description, position) VALUES (?, ?, ?, ?)"
      );

      let results = [];

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        tasks.forEach((task, index) => {
          const { checklist_id, title, description } = task;
          const position = task.position || index;

          stmt.run(
            [checklist_id, title, description, position],
            function (err) {
              if (err) {
                console.error(err);
              } else {
                results.push({
                  id: this.lastID,
                  checklist_id,
                  title,
                  description,
                  position,
                  is_completed: 0,
                });
              }
            }
          );
        });

        stmt.finalize();

        db.run("COMMIT", (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });
  }
}

module.exports = Task;
