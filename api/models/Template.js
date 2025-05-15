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

  static create(template) {
    return new Promise((resolve, reject) => {
      const { name, description } = template;
      db.run(
        "INSERT INTO templates (name, description) VALUES (?, ?)",
        [name, description],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, name, description });
          }
        }
      );
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
}

module.exports = Template;
