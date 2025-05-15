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
      const {
        user_id,
        template_id,
        name,
        description,
        type = "normal",
      } = checklist;
      db.run(
        "INSERT INTO checklists (user_id, template_id, name, description, type) VALUES (?, ?, ?, ?, ?)",
        [user_id, template_id, name, description, type],
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
              type,
            });
          }
        }
      );
    });
  }

  static update(id, checklist) {
    return new Promise((resolve, reject) => {
      const { name, description, type } = checklist;

      // If type is provided, update it, otherwise just update name and description
      let query, params;
      if (type !== undefined) {
        query =
          "UPDATE checklists SET name = ?, description = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        params = [name, description, type, id];
      } else {
        query =
          "UPDATE checklists SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        params = [name, description, id];
      }

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
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

  static getByType(type) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM checklists WHERE type = ? ORDER BY created_at DESC",
        [type],
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
