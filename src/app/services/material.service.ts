import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Material } from '../models/material.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  constructor(private db: DatabaseService) {}

  async getAll(): Promise<Material[]> {
    const res = await this.db['dbInstance']?.executeSql('SELECT * FROM materials', []);
    const materials: Material[] = [];
    if (res) {
      for (let i = 0; i < res.rows.length; i++) {
        materials.push(res.rows.item(i));
      }
    }
    return materials;
  }

  async add(material: Material): Promise<void> {
    await this.db['dbInstance']?.executeSql(
      `INSERT INTO materials (id, code, name, description, category, unit, price, currentStock, minimumStock, maximumStock, location, supplierId, isActive, qrCode, barcode, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [material.id, material.code, material.name, material.description, material.category, material.unit, material.price, material.currentStock, material.minimumStock, material.maximumStock, material.location, material.supplierId, material.isActive, material.qrCode, material.barcode]
    );
  }

  // Otros métodos CRUD pueden agregarse aquí
}
