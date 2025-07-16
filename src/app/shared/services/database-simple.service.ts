// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { User, UserRole } from '../models/user.model';
// import { Material } from '../models/material.model';
// import { Work, WorkStatus } from '../models/work.model';
// import { Supplier } from '../models/supplier.model';

// export interface InventoryMovement {
//   id: string;
//   materialId: string;
//   workId?: string;
//   type: 'entrada' | 'salida' | 'transferencia' | 'ajuste';
//   quantity: number;
//   reason: string;
//   userId: string;
//   createdAt: string;
// }

// export interface WorkMaterial {
//   id: string;
//   workId: string;
//   materialId: string;
//   quantityRequired: number;
//   quantityUsed: number;
//   createdAt: string;
//   updatedAt: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class DatabaseService {
//   private dbReady = new BehaviorSubject<boolean>(false);
//   public dbState$ = this.dbReady.asObservable();

//   constructor() {
//     this.initDatabase();
//   }

//   async initDatabase() {
//     console.log('Iniciando configuración de base de datos simple...');
//     try {
//       // Verificar si ya existen datos iniciales
//       if (!this.getFromLocalStorage('users').length) {
//         await this.seedInitialData();
//       }
      
//       console.log('Base de datos inicializada correctamente');
//       this.dbReady.next(true);
//     } catch (error) {
//       console.error('Error al inicializar la base de datos:', error);
//       this.dbReady.next(true); // Continuar de todos modos
//     }
//   }

//   private generateId(): string {
//     return Date.now().toString() + Math.random().toString(36).substr(2, 9);
//   }

//   private getStorageKey(table: string): string {
//     return `netstar_${table}`;
//   }

//   private saveToLocalStorage(table: string, data: any[]) {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
//     }
//   }

//   private getFromLocalStorage(table: string): any[] {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       const data = localStorage.getItem(this.getStorageKey(table));
//       return data ? JSON.parse(data) : [];
//     }
//     return [];
//   }

//   private async seedInitialData() {
//     const now = new Date();

//     // Usuarios iniciales
//     const users: User[] = [
//       {
//         id: '1',
//         username: 'admin',
//         email: 'admin@netstar.com',
//         firstName: 'Administrador',
//         lastName: 'Sistema',
//         role: UserRole.ADMINISTRADOR,
//         isActive: true,
//         createdAt: now,
//         updatedAt: now
//       },
//       {
//         id: '2',
//         username: 'tecnico',
//         email: 'tecnico@netstar.com',
//         firstName: 'Técnico',
//         lastName: 'General',
//         role: UserRole.TECNICO,
//         isActive: true,
//         createdAt: now,
//         updatedAt: now
//       }
//     ];

//     // Necesitamos agregar las contraseñas por separado para el sistema de autenticación
//     const usersWithPasswords = users.map(user => ({
//       ...user,
//       password: user.username === 'admin' ? 'admin123' : 'tecnico123'
//     }));

//     // Materiales iniciales
//     const materials: Material[] = [
//       {
//         id: '1',
//         code: 'CAB-UTP-001',
//         name: 'Cable UTP Cat6',
//         description: 'Cable de red categoría 6',
//         category: 'Cables',
//         currentStock: 100,
//         minimumStock: 20,
//         unit: 'metros',
//         price: 2.5,
//         location: 'Almacén A',
//         isActive: true,
//         createdAt: now,
//         updatedAt: now
//       },
//       {
//         id: '2',
//         code: 'ROU-WIFI-001',
//         name: 'Router WiFi',
//         description: 'Router inalámbrico dual band',
//         category: 'Equipos',
//         currentStock: 15,
//         minimumStock: 5,
//         unit: 'unidades',
//         price: 120.0,
//         location: 'Almacén B',
//         isActive: true,
//         createdAt: now,
//         updatedAt: now
//       }
//     ];

//     // Obras iniciales
//     const works: Work[] = [
//       {
//         id: '1',
//         name: 'Instalación Red Empresa ABC',
//         description: 'Instalación de red completa para oficina',
//         startDate: now,
//         endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         status: WorkStatus.ACTIVA,
//         assignedTechnicians: ['2'],
//         location: 'Ambato Centro',
//         createdAt: now,
//         updatedAt: now
//       }
//     ];

//     // Proveedores iniciales
//     const suppliers: Supplier[] = [
//       {
//         id: '1',
//         name: 'TechSupply Ecuador',
//         contactPerson: 'Carlos Pérez',
//         email: 'ventas@techsupply.ec',
//         phone: '0998765432',
//         address: 'Av. Cevallos 123, Ambato',
//         isActive: true,
//         createdAt: now,
//         updatedAt: now
//       }
//     ];

//     this.saveToLocalStorage('users', usersWithPasswords);
//     this.saveToLocalStorage('materials', materials);
//     this.saveToLocalStorage('works', works);
//     this.saveToLocalStorage('suppliers', suppliers);
//     this.saveToLocalStorage('inventory_movements', []);
//     this.saveToLocalStorage('work_materials', []);

//     console.log('Datos iniciales insertados');
//   }

//   // USUARIOS
//   async getUsers(): Promise<User[]> {
//     return this.getFromLocalStorage('users');
//   }

//   async getUserById(id: string): Promise<User | null> {
//     const users = this.getFromLocalStorage('users');
//     return users.find((u: User) => u.id === id) || null;
//   }

//   async getUserByUsername(username: string): Promise<User | null> {
//     const users = this.getFromLocalStorage('users');
//     return users.find((u: User) => u.username === username) || null;
//   }

//   async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
//     const users = this.getFromLocalStorage('users');
//     const now = new Date();
//     const newUser: User = {
//       ...user,
//       id: this.generateId(),
//       createdAt: now,
//       updatedAt: now
//     };
//     users.push(newUser);
//     this.saveToLocalStorage('users', users);
//     return true;
//   }

//   async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
//     const users = this.getFromLocalStorage('users');
//     const index = users.findIndex((u: User) => u.id === id);
//     if (index !== -1) {
//       users[index] = { ...users[index], ...updates, updatedAt: new Date() };
//       this.saveToLocalStorage('users', users);
//       return true;
//     }
//     return false;
//   }

//   async deleteUser(id: string): Promise<boolean> {
//     const users = this.getFromLocalStorage('users');
//     const filtered = users.filter((u: User) => u.id !== id);
//     this.saveToLocalStorage('users', filtered);
//     return true;
//   }

//   // MATERIALES
//   async getMaterials(): Promise<Material[]> {
//     const materials = this.getFromLocalStorage('materials');
//     console.log('DatabaseService.getMaterials - Materiales obtenidos:', materials.length);
    
//     // Log específico para el Cable UTP Cat 6
//     const cableUTP = materials.find((m: Material) => m.name === 'Cable UTP Cat 6');
//     if (cableUTP) {
//       console.log('DatabaseService.getMaterials - Cable UTP Cat 6 estado en localStorage:', cableUTP.isActive);
//     }
    
//     return materials;
//   }

//   async getMaterialById(id: string): Promise<Material | null> {
//     const materials = this.getFromLocalStorage('materials');
//     return materials.find((m: Material) => m.id === id) || null;
//   }

//   async createMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
//     const materials = this.getFromLocalStorage('materials');
//     const now = new Date();
//     const newMaterial: Material = {
//       ...material,
//       id: this.generateId(),
//       createdAt: now,
//       updatedAt: now
//     };
//     materials.push(newMaterial);
//     this.saveToLocalStorage('materials', materials);
//     return true;
//   }

//   async updateMaterial(id: string, updates: Partial<Material>): Promise<boolean> {
//     console.log('DatabaseService.updateMaterial - ID:', id, 'Updates:', updates);
//     const materials = this.getFromLocalStorage('materials');
//     const index = materials.findIndex((m: Material) => m.id === id);
//     if (index !== -1) {
//       const originalMaterial = materials[index];
//       console.log('Material encontrado en posición:', index, 'Datos originales:', originalMaterial);
//       materials[index] = { ...materials[index], ...updates, updatedAt: new Date() };
//       console.log('Material actualizado:', materials[index]);
//       this.saveToLocalStorage('materials', materials);
//       console.log('Material guardado en localStorage');
//       return true;
//     }
//     console.error('Material no encontrado con ID:', id);
//     return false;
//   }

//   async deleteMaterial(id: string): Promise<boolean> {
//     const materials = this.getFromLocalStorage('materials');
//     const filtered = materials.filter((m: Material) => m.id !== id);
//     this.saveToLocalStorage('materials', filtered);
//     return true;
//   }

//   // OBRAS
//   async getWorks(): Promise<Work[]> {
//     return this.getFromLocalStorage('works');
//   }

//   async getWorkById(id: string): Promise<Work | null> {
//     const works = this.getFromLocalStorage('works');
//     return works.find((w: Work) => w.id === id) || null;
//   }

//   async createWork(work: Omit<Work, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
//     const works = this.getFromLocalStorage('works');
//     const now = new Date();
//     const newWork: Work = {
//       ...work,
//       id: this.generateId(),
//       createdAt: now,
//       updatedAt: now
//     };
//     works.push(newWork);
//     this.saveToLocalStorage('works', works);
//     return true;
//   }

//   async updateWork(id: string, updates: Partial<Work>): Promise<boolean> {
//     const works = this.getFromLocalStorage('works');
//     const index = works.findIndex((w: Work) => w.id === id);
//     if (index !== -1) {
//       works[index] = { ...works[index], ...updates, updatedAt: new Date() };
//       this.saveToLocalStorage('works', works);
//       return true;
//     }
//     return false;
//   }

//   async deleteWork(id: string): Promise<boolean> {
//     const works = this.getFromLocalStorage('works');
//     const filtered = works.filter((w: Work) => w.id !== id);
//     this.saveToLocalStorage('works', filtered);
//     return true;
//   }

//   // PROVEEDORES
//   async getSuppliers(): Promise<Supplier[]> {
//     return this.getFromLocalStorage('suppliers');
//   }

//   async createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
//     const suppliers = this.getFromLocalStorage('suppliers');
//     const now = new Date();
//     const newSupplier: Supplier = {
//       ...supplier,
//       id: this.generateId(),
//       createdAt: now,
//       updatedAt: now
//     };
//     suppliers.push(newSupplier);
//     this.saveToLocalStorage('suppliers', suppliers);
//     return true;
//   }

//   // MOVIMIENTOS DE INVENTARIO
//   async getInventoryMovements(): Promise<InventoryMovement[]> {
//     return this.getFromLocalStorage('inventory_movements');
//   }

//   async createInventoryMovement(movement: Omit<InventoryMovement, 'id'>): Promise<boolean> {
//     const movements = this.getFromLocalStorage('inventory_movements');
//     const newMovement: InventoryMovement = {
//       ...movement,
//       id: this.generateId()
//     };
//     movements.push(newMovement);
//     this.saveToLocalStorage('inventory_movements', movements);
//     return true;
//   }

//   // MATERIALES DE OBRA
//   async getWorkMaterials(): Promise<WorkMaterial[]> {
//     return this.getFromLocalStorage('work_materials');
//   }

//   async getWorkMaterialsByWorkId(workId: string): Promise<WorkMaterial[]> {
//     const workMaterials = this.getFromLocalStorage('work_materials');
//     return workMaterials.filter((wm: WorkMaterial) => wm.workId === workId);
//   }

//   // MÉTODOS PARA REPORTES
//   async getWorksByPeriod(period: 'month' | 'quarter' | 'all'): Promise<Work[]> {
//     const works = await this.getWorks();
//     const now = new Date();
    
//     return works.filter(work => {
//       const workDate = new Date(work.createdAt);
      
//       switch (period) {
//         case 'month':
//           return workDate.getMonth() === now.getMonth() && 
//                  workDate.getFullYear() === now.getFullYear();
//         case 'quarter':
//           const currentQuarter = Math.floor(now.getMonth() / 3);
//           const workQuarter = Math.floor(workDate.getMonth() / 3);
//           return workQuarter === currentQuarter && 
//                  workDate.getFullYear() === now.getFullYear();
//         case 'all':
//         default:
//           return true;
//       }
//     });
//   }

//   async getMaterialConsumptionByPeriod(period: 'month' | 'quarter' | 'all'): Promise<any[]> {
//     const movements = await this.getInventoryMovements();
//     const materials = await this.getMaterials();
//     const now = new Date();
    
//     const filteredMovements = movements.filter(movement => {
//       const movementDate = new Date(movement.createdAt);
      
//       switch (period) {
//         case 'month':
//           return movementDate.getMonth() === now.getMonth() && 
//                  movementDate.getFullYear() === now.getFullYear();
//         case 'quarter':
//           const currentQuarter = Math.floor(now.getMonth() / 3);
//           const movementQuarter = Math.floor(movementDate.getMonth() / 3);
//           return movementQuarter === currentQuarter && 
//                  movementDate.getFullYear() === now.getFullYear();
//         case 'all':
//         default:
//           return true;
//       }
//     });

//     // Agrupar por material
//     const consumption: { [key: string]: any } = {};
    
//     filteredMovements.forEach(movement => {
//       const material = materials.find((m: Material) => m.id === movement.materialId);
//       if (material && movement.type === 'salida') {
//         if (!consumption[material.id]) {
//           consumption[material.id] = {
//             materialName: material.name,
//             category: material.category,
//             totalConsumed: 0,
//             unit: material.unit
//           };
//         }
//         consumption[material.id].totalConsumed += movement.quantity;
//       }
//     });

//     return Object.values(consumption);
//   }

//   async getProjectMaterialUsageByPeriod(period: 'month' | 'quarter' | 'all'): Promise<any[]> {
//     const works = await this.getWorksByPeriod(period);
//     const materials = await this.getMaterials();
//     const movements = await this.getInventoryMovements();
    
//     return works.map(work => {
//       const workMovements = movements.filter(m => m.workId === work.id);
//       const totalMaterials = workMovements.length;
//       const totalCost = workMovements.reduce((sum, movement) => {
//         const material = materials.find((m: Material) => m.id === movement.materialId);
//         return sum + (material && material.price ? material.price * movement.quantity : 0);
//       }, 0);

//       return {
//         workName: work.name,
//         status: work.status,
//         totalMaterials,
//         totalCost,
//         location: work.location
//       };
//     });
//   }

//   // MÉTODOS ESPECÍFICOS PARA AUTENTICACIÓN
//   async getUserByUsernameWithPassword(username: string): Promise<any | null> {
//     const users = this.getFromLocalStorage('users');
//     return users.find((u: any) => u.username === username) || null;
//   }

//   async validateUserCredentials(username: string, password: string): Promise<User | null> {
//     const user = await this.getUserByUsernameWithPassword(username);
//     if (user && user.password === password) {
//       // Retornar usuario sin la contraseña
//       const { password: _, ...userWithoutPassword } = user;
//       return userWithoutPassword as User;
//     }
//     return null;
//   }
// }
