import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class SqliteDatabaseService {
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
    // ...aquí puedes agregar otras tablas (materials, works, movements, etc.)
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
          'tecnico-id', 'tecnico', 'tecnico123', 'Técnico', 'Demo', 'tecnico@netstar.com', UserRole.TECNICO, 1, new Date().toISOString(), new Date().toISOString()
        ]
      );
    }
  }

  // Ejemplo de método para obtener usuarios
  async getUsers(): Promise<User[]> {
    await this.initDatabase();
    const res = await this.db?.query('SELECT * FROM users;');
    return res?.values || [];
  }

  // ...aquí puedes replicar los demás métodos del DatabaseService
}
