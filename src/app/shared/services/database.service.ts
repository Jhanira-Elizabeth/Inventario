import { Injectable } from '@angular/core';
import { Material, MaterialMovement, MovementType } from '../models/material.model';
import { User, UserRole } from '../models/user.model';
import { Work, WorkStatus } from '../models/work.model';
import { Supplier } from '../models/supplier.model';
import { v4 as uuidv4 } from 'uuid';

export interface InventoryMovement {
  id: string;
  materialId: string;
  workId?: string;
  type: 'entrada' | 'salida' | 'transferencia' | 'ajuste' | 'salida_entrega';
  movementType?: MovementType;
  quantity: number;
  reason: string;
  userId: string;
  technicianId?: string;
  notes?: string;
  remainingStock?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkMaterial {
  id: string;
  workId: string;
  materialId: string;
  quantityRequired: number;
  quantityUsed: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialConsumption {
  materialId: string;
  materialName: string;
  totalQuantity: number;
  totalValue: number;
}

interface ProjectMaterialUsage {
  workId: string;
  workName: string;
  materials: Array<{
    materialId: string;
    materialName: string;
    quantityUsed: number;
    value: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {
  /**
   * Alias para compatibilidad con APP_INITIALIZER
   */
  public async initDatabase(): Promise<void> {
    return this.initializeDatabase();
  }
  /**
   * Normaliza cualquier valor a booleano para isActive
   */
  private normalizeIsActive(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
    return false;
  }
  constructor() {
    this.initializeDatabase();
  }

//   /**
//    * Borra todas las tablas principales de la base de datos (para reset/desarrollo)
//    */
  public async dropAllTables(): Promise<void> {
    localStorage.removeItem('netstar_users');
    localStorage.removeItem('netstar_materials');
    localStorage.removeItem('netstar_works');
    localStorage.removeItem('netstar_movements');
    await this.initializeDatabase();
  }

//   // Métodos stub para evitar errores de compilación en reports y auth
  async getMaterialConsumptionByPeriod(period: any): Promise<any[]> {
    // TODO: Implementar lógica real
    return [];
  }

  async getProjectMaterialUsageByPeriod(period: any): Promise<any[]> {
    // TODO: Implementar lógica real
    return [];
  }

  async validateUserCredentials(username: string, password: string): Promise<any | null> {
    await this.initializeDatabase();
    const users = JSON.parse(localStorage.getItem('netstar_users') || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user && user.isActive) {
      return user;
    }
    return null;
  }

  async initializeDatabase(): Promise<void> {
    // Seed admin user if not exists
    const users = JSON.parse(localStorage.getItem('netstar_users') || '[]');
    if (!users || users.length === 0) {
      const adminUser = {
        id: 'admin-id',
        username: 'admin',
        password: 'admin123',
        firstName: 'Administrador',
        lastName: 'Principal',
        email: 'admin@netstar.com',
        role: 'administrador',
        isActive: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('netstar_users', JSON.stringify([adminUser]));
    }
    // Inicializa otras tablas si es necesario
    if (!localStorage.getItem('netstar_materials')) {
      localStorage.setItem('netstar_materials', JSON.stringify([]));
    }
    if (!localStorage.getItem('netstar_works')) {
      localStorage.setItem('netstar_works', JSON.stringify([]));
    }
    if (!localStorage.getItem('netstar_movements')) {
      localStorage.setItem('netstar_movements', JSON.stringify([]));
    }
  }
  async getUsers(): Promise<User[]> {
    await this.initializeDatabase();
    const users = JSON.parse(localStorage.getItem('netstar_users') || '[]');
    return users.map((row: any) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async getUserById(id: string): Promise<User | null> {
    await this.initializeDatabase();
    const users = JSON.parse(localStorage.getItem('netstar_users') || '[]');
    const user = users.find((u: any) => u.id === id);
    return user ? { ...user, createdAt: new Date(user.createdAt), updatedAt: new Date(user.updatedAt) } : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    await this.initializeDatabase();
    const users = JSON.parse(localStorage.getItem('netstar_users') || '[]');
    const user = users.find((u: any) => u.username === username);
    return user ? { ...user, createdAt: new Date(user.createdAt), updatedAt: new Date(user.updatedAt) } : null;
  }

  async createUser(user: User): Promise<void> {
    await this.initializeDatabase();
    const users = JSON.parse(localStorage.getItem('netstar_users') || '[]');
    users.push({
      ...user,
      id: user.id || uuidv4(),
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
    });
    localStorage.setItem('netstar_users', JSON.stringify(users));
  }

// ...existing code...
  async getMaterials(): Promise<Material[]> {
    await this.initializeDatabase();
    const materials = JSON.parse(localStorage.getItem('netstar_materials') || '[]');
    return materials.map((row: any) => ({
      ...row,
      isActive: this.normalizeIsActive(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async createMaterial(material: Material): Promise<void> {
    await this.initializeDatabase();
    const materials = JSON.parse(localStorage.getItem('netstar_materials') || '[]');
    const normalizedIsActive = this.normalizeIsActive(material.isActive);
    console.log('[DEBUG] createMaterial - isActive value:', material.isActive, 'normalized:', normalizedIsActive, 'type:', typeof normalizedIsActive);
    materials.push({
      ...material,
      id: material.id || uuidv4(),
      isActive: normalizedIsActive,
      createdAt: material.createdAt ? material.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: material.updatedAt ? material.updatedAt.toISOString() : new Date().toISOString()
    });
    localStorage.setItem('netstar_materials', JSON.stringify(materials));
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<void> {
    await this.initializeDatabase();
    const materials = JSON.parse(localStorage.getItem('netstar_materials') || '[]');
    const idx = materials.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      let normalizedIsActive = materials[idx].isActive;
      if (updates.isActive !== undefined) {
        normalizedIsActive = this.normalizeIsActive(updates.isActive);
      }
      console.log('[DEBUG] updateMaterial - isActive update:', updates.isActive, 'normalized:', normalizedIsActive, 'type:', typeof normalizedIsActive);
      materials[idx] = {
        ...materials[idx],
        ...updates,
        isActive: normalizedIsActive,
        updatedAt: updates.updatedAt ? updates.updatedAt.toISOString() : new Date().toISOString()
      };
      localStorage.setItem('netstar_materials', JSON.stringify(materials));
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.initializeDatabase();
    let materials = JSON.parse(localStorage.getItem('netstar_materials') || '[]');
    materials = materials.filter((m: any) => m.id !== id);
    localStorage.setItem('netstar_materials', JSON.stringify(materials));
  }

// ...existing code...
  async getWorks(): Promise<Work[]> {
    await this.initializeDatabase();
    const works = JSON.parse(localStorage.getItem('netstar_works') || '[]');
    return works.map((row: any) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      status: row.status
    }));
  }

  async createWork(work: Work): Promise<void> {
    await this.initializeDatabase();
    const works = JSON.parse(localStorage.getItem('netstar_works') || '[]');
    works.push({
      ...work,
      id: work.id || uuidv4(),
      createdAt: work.createdAt ? work.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: work.updatedAt ? work.updatedAt.toISOString() : new Date().toISOString()
    });
    localStorage.setItem('netstar_works', JSON.stringify(works));
  }

// ...existing code...
  async getInventoryMovements(): Promise<MaterialMovement[]> {
    await this.initializeDatabase();
    const movements = JSON.parse(localStorage.getItem('netstar_movements') || '[]');
    return movements.map((row: any) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      movementType: row.movementType
    }));
  }

  async createInventoryMovement(movement: Omit<MaterialMovement, 'id' | 'createdAt'>): Promise<MaterialMovement> {
    await this.initializeDatabase();
    const movements = JSON.parse(localStorage.getItem('netstar_movements') || '[]');
    const newMovement: MaterialMovement = {
      ...movement,
      id: uuidv4(),
      createdAt: new Date()
    };
    movements.push(newMovement);
    localStorage.setItem('netstar_movements', JSON.stringify(movements));
    return newMovement;
  }

// ...existing code...
  async createDemoData(): Promise<void> {
    await this.initializeDatabase();
    // Material demo
    let materials = JSON.parse(localStorage.getItem('netstar_materials') || '[]');
    // Elimina materiales demo previos para evitar duplicados y asegura que al menos uno esté activo
    materials = materials.filter((m: any) => m.id !== 'material-demo');
    materials.push({
      id: 'material-demo',
      code: 'DEMO-001',
      name: 'Material Demo',
      description: 'Material de ejemplo para pruebas',
      category: 'General',
      unit: 'unidad',
      price: 0,
      currentStock: 10,
      minimumStock: 1,
      maximumStock: 100,
      location: '',
      supplierId: '',
      isActive: true,
      qrCode: '',
      barcode: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem('netstar_materials', JSON.stringify(materials));
    // User demo
    const users = await this.getUsers();
    if (!users || users.length === 0) {
      await this.createUser({
        id: 'admin-demo',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'Demo',
        email: 'admin@demo.com',
        role: UserRole.ADMINISTRADOR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    // Work demo
    const works = await this.getWorks();
    if (!works || works.length === 0) {
      await this.createWork({
        id: 'work-demo',
        name: 'Obra Demo',
        description: 'Obra de ejemplo',
        status: WorkStatus.ACTIVA,
        location: '',
        startDate: new Date(),
        assignedTechnicians: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    // Movement demo
    const movements = await this.getInventoryMovements();
    if (!movements || movements.length === 0) {
      await this.createInventoryMovement({
        materialId: 'material-demo',
        quantity: 1,
        movementType: MovementType.ENTRADA,
        workId: undefined,
        technicianId: undefined,
        notes: 'Movimiento de ejemplo automático',
        type: MovementType.ENTRADA,
        reason: 'Demo',
        userId: 'admin-demo',
        updatedAt: new Date()
      });
    }
  }

// ...existing code...
  async getWorksByPeriod(period: 'month' | 'quarter' | 'all'): Promise<Work[]> {
    const works = await this.getWorks();
    const currentDate = new Date();
    if (period === 'all') {
      return works;
    }
    let filterDate: Date;
    if (period === 'month') {
      filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    } else { // quarter
      const quarter = Math.floor(currentDate.getMonth() / 3);
      filterDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
    }
    return works.filter(work => new Date(work.createdAt) >= filterDate);
  }

  async getInventoryMovementsByPeriod(period: 'month' | 'quarter' | 'all'): Promise<MaterialMovement[]> {
    const movements = await this.getInventoryMovements();
    const currentDate = new Date();
    if (period === 'all') {
      return movements;
    }
    let filterDate: Date;
    if (period === 'month') {
      filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    } else { // quarter
      const quarter = Math.floor(currentDate.getMonth() / 3);
      filterDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
    }
    return movements.filter(movement => new Date(movement.createdAt) >= filterDate);
  }

// ...existing code...

// ...existing code...
}