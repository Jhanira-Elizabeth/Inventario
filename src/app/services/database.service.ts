import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbInstance: SQLiteObject | null = null;

  constructor(private platform: Platform, private sqlite: SQLite) {}

  async init() {
    await this.platform.ready();
    this.dbInstance = await this.sqlite.create({
      name: 'inventario.db',
      location: 'default'
    });
    await this.createTables();
    await this.insertAdminUser();
  }

  private async createTables() {
    // Tabla users
    await this.dbInstance?.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
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
      );
    `, []);

    // Tabla materials
    await this.dbInstance?.executeSql(`
      CREATE TABLE IF NOT EXISTS materials (
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
      );
    `, []);

    // Tabla works
    await this.dbInstance?.executeSql(`
      CREATE TABLE IF NOT EXISTS works (
        id TEXT PRIMARY KEY,
        code TEXT,
        name TEXT,
        description TEXT,
        client TEXT,
        location TEXT,
        status TEXT,
        budget REAL,
        startDate TEXT,
        estimatedEndDate TEXT,
        endDate TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `, []);

    // Tabla movements
    await this.dbInstance?.executeSql(`
      CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        materialId TEXT,
        workId TEXT,
        userId TEXT,
        type TEXT,
        quantity INTEGER,
        notes TEXT,
        createdAt TEXT
      );
    `, []);
  }

  private async insertAdminUser() {
    const res = await this.dbInstance?.executeSql(
      `SELECT * FROM users WHERE username = ?`, ['admin']
    );
    if (res && res.rows.length === 0) {
      await this.dbInstance?.executeSql(
        `INSERT INTO users (id, username, password, role, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [this.uuidv4(), 'admin', 'admin123', 'administrador', 1]
      );
    }
  }

  private uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
