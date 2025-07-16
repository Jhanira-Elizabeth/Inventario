import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Work } from '../models/work.model';

@Injectable({ providedIn: 'root' })
export class WorkService {
  constructor(private db: DatabaseService) {}

  async getAll(): Promise<Work[]> {
    const res = await this.db['dbInstance']?.executeSql('SELECT * FROM works', []);
    const works: Work[] = [];
    if (res) {
      for (let i = 0; i < res.rows.length; i++) {
        works.push(res.rows.item(i));
      }
    }
    return works;
  }

  async add(work: Work): Promise<void> {
    await this.db['dbInstance']?.executeSql(
      `INSERT INTO works (id, code, name, description, client, location, status, budget, startDate, estimatedEndDate, endDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [work.id, work.code, work.name, work.description, work.client, work.location, work.status, work.budget, work.startDate, work.estimatedEndDate, work.endDate]
    );
  }

  // Otros métodos CRUD pueden agregarse aquí
}
