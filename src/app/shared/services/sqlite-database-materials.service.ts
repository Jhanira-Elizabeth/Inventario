import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Material } from '../models/material.model';

@Injectable({ providedIn: 'root' })
export class SqliteDatabaseMaterialsService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName = 'netstar_inventory.db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initDatabase(): Promise<void> {
    if (!this.db) {
      this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1);
      await this.db.open();
      await this.createTables();
    }
  }

  private async createTables(): Promise<void> {
    await this.db?.execute(
      `CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        code TEXT,
        unit TEXT,
        category TEXT,
        location TEXT,
        price REAL,
        currentStock INTEGER,
        isActive INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      );`
    );
  }

  async getMaterials(): Promise<Material[]> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM materials;');
    return res?.values || [];
  }

  async createMaterial(material: Material): Promise<void> {
    await this.initDatabase();
    await this.db?.run(
      `INSERT INTO materials (id, name, description, code, unit, category, location, price, currentStock, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        material.id,
        material.name,
        material.description,
        material.code,
        material.unit,
        material.category,
        material.location,
        material.price,
        material.currentStock,
        material.isActive ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<void> {
    await this.initDatabase();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    await this.db?.run(
      `UPDATE materials SET ${fields}, updatedAt = ? WHERE id = ?;`,
      [...values, new Date().toISOString(), id]
    );
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.initDatabase();
    await this.db?.run('DELETE FROM materials WHERE id = ?;', [id]);
  }
}
