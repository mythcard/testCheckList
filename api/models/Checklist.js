const db = require("../db/database");

class Checklist {
  static getAll(userId = null) {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM checklists";
      const params = [];

      if (userId) {
        query += " WHERE user_id = ?";
        params.push(userId);
      }

      query += " ORDER BY created_at DESC";

      db.all(query, params, (err, rows) => {
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
      db.get("SELECT * FROM checklists WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static create(checklist) {
    return new Promise((resolve, reject) => {
      const { user_id, template_id, name, description } = checklist;
      db.run(
        "INSERT INTO checklists (user_id, template_id, name, description) VALUES (?, ?, ?, ?)",
        [user_id, template_id, name, description],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              user_id,
              template_id,
              name,
              description,
            });
          }
        }
      );
    });
  }

  static update(id, checklist) {
    return new Promise((resolve, reject) => {
      const { name, description } = checklist;
      db.run(
        "UPDATE checklists SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
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
      db.run("DELETE FROM checklists WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static getFromTemplate(templateId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM checklists WHERE template_id = ?",
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
}

module.exports = Checklist;
