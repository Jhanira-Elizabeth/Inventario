import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class SqliteDatabaseService {
  // Método de depuración para listar todos los usuarios en consola
  async debugPrintUsers(): Promise<void> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM users;');
    console.log('Usuarios en SQLite:', res?.values);
  }
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
      await this.seedDefaultUsers();
    }
  }

  private async createTables(): Promise<void> {
    // Tabla de usuarios
    await this.db?.execute(
      `CREATE TABLE IF NOT EXISTS users (
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
      );`
    );
    // Tabla de materiales
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
    // Tabla de obras
    await this.db?.execute(
      `CREATE TABLE IF NOT EXISTS works (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        status TEXT,
        location TEXT,
        startDate TEXT,
        assignedTechnicians TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`
    );
  }

  private async seedDefaultUsers(): Promise<void> {
    // Verifica si ya existen usuarios
    const res = await this.db?.query('SELECT COUNT(*) as count FROM users;');
    if (res?.values && res.values[0].count === 0) {
      // Inserta admin y técnico por defecto
      await this.db?.run(
        `INSERT INTO users (id, username, password, firstName, lastName, email, role, isActive, createdAt, updatedAt) VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          'admin-id', 'admin', 'admin123', 'Administrador', 'Principal', 'admin@netstar.com', UserRole.ADMINISTRADOR, 1, new Date().toISOString(), new Date().toISOString(),
          'tecnico1-id', 'tecnico1', 'tecnico123', 'Técnico', 'Demo', 'tecnico@netstar.com', UserRole.TECNICO, 1, new Date().toISOString(), new Date().toISOString()
        ]
      );
    }
  }

  // CRUD Materiales
  async getMaterials(): Promise<any[]> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM materials;');
    return res?.values || [];
  }

  async createMaterial(material: any): Promise<void> {
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

  async updateMaterial(id: string, updates: Partial<any>): Promise<void> {
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

  // CRUD Obras
  async getWorks(): Promise<any[]> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM works;');
    return res?.values || [];
  }

  async createWork(work: any): Promise<void> {
    await this.initDatabase();
    await this.db?.run(
      `INSERT INTO works (id, name, description, status, location, startDate, assignedTechnicians, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        work.id,
        work.name,
        work.description,
        work.status,
        work.location,
        work.startDate,
        JSON.stringify(work.assignedTechnicians || []),
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
  }

  async updateWork(id: string, updates: Partial<any>): Promise<void> {
    await this.initDatabase();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    await this.db?.run(
      `UPDATE works SET ${fields}, updatedAt = ? WHERE id = ?;`,
      [...values, new Date().toISOString(), id]
    );
  }

  async deleteWork(id: string): Promise<void> {
    await this.initDatabase();
    await this.db?.run('DELETE FROM works WHERE id = ?;', [id]);
  }
  // CRUD Usuarios
  async getUsers(): Promise<User[]> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM users;');
    return res?.values || [];
  }

  async getUserById(id: string): Promise<User | null> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM users WHERE id = ?;', [id]);
    return res?.values && res.values.length > 0 ? res.values[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM users WHERE username = ?;', [username]);
    return res?.values && res.values.length > 0 ? res.values[0] : null;
  }

  async createUser(user: User): Promise<void> {
    await this.initDatabase();
    await this.db?.run(
      `INSERT INTO users (id, username, password, firstName, lastName, email, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        user.id,
        user.username,
        user.password,
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        user.isActive ? 1 : 0,
        user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
        user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
      ]
    );
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await this.initDatabase();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    await this.db?.run(
      `UPDATE users SET ${fields}, updatedAt = ? WHERE id = ?;`,
      [...values, new Date().toISOString(), id]
    );
  }

  async deleteUser(id: string): Promise<void> {
    await this.initDatabase();
    await this.db?.run('DELETE FROM users WHERE id = ?;', [id]);
  }
}
