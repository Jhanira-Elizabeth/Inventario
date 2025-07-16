import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Movement } from '../models/movement.model';

@Injectable({ providedIn: 'root' })
export class MovementService {
  constructor(private db: DatabaseService) {}

  async getAll(): Promise<Movement[]> {
    const res = await this.db['dbInstance']?.executeSql('SELECT * FROM movements', []);
    const movements: Movement[] = [];
    if (res) {
      for (let i = 0; i < res.rows.length; i++) {
        movements.push(res.rows.item(i));
      }
    }
    return movements;
  }

  async add(movement: Movement): Promise<void> {
    await this.db['dbInstance']?.executeSql(
      `INSERT INTO movements (id, materialId, workId, userId, type, quantity, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [movement.id, movement.materialId, movement.workId, movement.userId, movement.type, movement.quantity, movement.notes]
    );
  }

  // Otros métodos CRUD pueden agregarse aquí
}
