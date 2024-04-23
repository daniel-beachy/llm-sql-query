import sqlite3 from "sqlite3";

// Function to get table definitions from a sqlite database
export async function getTablesSchema(dbFile) {
  try {
    const db = await new Promise((resolve, reject) => {
      const dbConnection = new sqlite3.Database(
        dbFile,
        sqlite3.OPEN_READONLY,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(dbConnection);
        }
      );
    });

    const tableData = {}; // Object to store table data (name and schema)

    // First, get all table names
    const tableNames = await new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map((row) => row.name));
        }
      );
    });

    // Then, for each table, get its schema
    const schemaPromises = tableNames.map((tableName) => {
      return new Promise((resolve, reject) => {
        db.all(`PRAGMA TABLE_INFO(${tableName})`, (err, schema) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            [tableName]: schema.map((col) => ({
              name: col.name,
              type: col.type,
              primaryKey: col.pk,
            })),
          });
        });
      });
    });

    // Wait for all schema promises to resolve
    const allSchemas = await Promise.all(schemaPromises);

    // Combine all schemas into the tableData object
    allSchemas.forEach((schema) => {
      Object.assign(tableData, schema);
    });

    await db.close(); // Ensure database is closed even on success
    return tableData; // Return object containing table names and schemas
  } catch (err) {
    throw err; // Re-throw for handling in the calling code
  }
}

// Function to execute a query on a sqlite database
export function executeQuery(dbFile, query) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        reject(err);
        return;
      }
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });
    });
  });
}
