import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({ providedIn: 'root' })
export class SQLiteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName = 'netstar_inventory.db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }


  async open(): Promise<void> {
    if (!this.db) {
      // createConnection(dbName, encrypted, mode, version, vfs = null)
      this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
      await this.db.open();
    }
  }

  async execute(query: string, params: any[] = []): Promise<any> {
    await this.open();
    return this.db!.run(query, params);
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    await this.open();
    const res = await this.db!.query(query, params);
    return res.values || [];
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.dbName, false);
      this.db = null;
    }
  }

  async createTables(): Promise<void> {
    await this.open();
    // Tabla de usuarios
    await this.execute(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      role TEXT,
      isActive INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    )`);

    // Tabla de materiales
    await this.execute(`CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      code TEXT,
      name TEXT,
      description TEXT,
      category TEXT,
      unit TEXT,
      price REAL,
      currentStock INTEGER,
      minimumStock INTEGER,
      maximumStock INTEGER,
      location TEXT,
      supplierId TEXT,
      isActive INTEGER,
      qrCode TEXT,
      barcode TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`);
    // Puedes agregar aquí las demás tablas necesarias (works, movements, etc.)
  }
}
