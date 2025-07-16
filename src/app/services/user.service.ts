import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private db: DatabaseService) {}

  async getAll(): Promise<User[]> {
    const res = await this.db['dbInstance']?.executeSql('SELECT * FROM users', []);
    const users: User[] = [];
    if (res) {
      for (let i = 0; i < res.rows.length; i++) {
        users.push(res.rows.item(i));
      }
    }
    return users;
  }

  async add(user: User): Promise<void> {
    await this.db['dbInstance']?.executeSql(
      `INSERT INTO users (id, username, password, firstName, lastName, email, role, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [user.id, user.username, user.password, user.firstName, user.lastName, user.email, user.role, user.isActive]
    );
  }

  // Otros métodos CRUD pueden agregarse aquí
}
