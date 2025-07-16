import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Material } from '../models/material.model';
import { DatabaseService, InventoryMovement } from './database.service';
import { MaterialMovement, MovementType } from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  /**
   * Crea un material y lo agrega a la base de datos y al BehaviorSubject
   */
  createMaterial(material: Material): Observable<Material> {
    return from(this.databaseService.createMaterial(material)).pipe(
      map((created: any) => {
        this.loadMaterials();
        return created ?? material;
      })
    );
  }
  private materialsSubject = new BehaviorSubject<Material[]>([]);
  private movementsSubject = new BehaviorSubject<InventoryMovement[]>([]);

  constructor(private databaseService: DatabaseService) {
    this.loadMaterials();
    this.loadMovements();
  }

  getMaterials(): Observable<Material[]> {
    return this.materialsSubject.asObservable();
  }

  getMovements(): Observable<InventoryMovement[]> {
    return this.movementsSubject.asObservable();
  }

  getMaterialById(id: string): Observable<Material | undefined> {
    console.log('getMaterialById - Buscando material con ID:', id);
    return this.getMaterials().pipe(
      map(materials => {
        const material = materials.find(m => m.id === id);
        if (material) {
          console.log('getMaterialById - Material encontrado:', material.name, 'estado:', material.isActive);
        }
        return material;
      })
    );
  }

  addMaterial(materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Observable<Material> {
    const now = new Date();
    const material: Material = {
      ...materialData,
      id: '',
      createdAt: now,
      updatedAt: now
    };
    return from(this.databaseService.createMaterial(material)).pipe(
      map((created: any) => {
        this.loadMaterials();
        return created ?? material;
      })
    );
  }

  getMaterialMovements(materialId: string): Observable<InventoryMovement[]> {
    return this.getMovements().pipe(
      map(movements => movements.filter(m => m.materialId === materialId))
    );
  }

  adjustStock(materialId: string, quantity: number, reason: string = 'Ajuste de inventario'): Observable<void> {
    return new Observable(observer => {
      this.getMaterialById(materialId).subscribe(material => {
        if (material) {
          const newStock = material.currentStock + quantity;
          if (newStock < 0) {
            observer.error(new Error('Stock insuficiente'));
            return;
          }
          
          this.updateMaterial(materialId, { currentStock: newStock }).subscribe({
            next: () => {
              // Crear movimiento de inventario
              const movement: Omit<InventoryMovement, 'id' | 'createdAt'> = {
                materialId,
                type: quantity > 0 ? MovementType.ENTRADA : MovementType.SALIDA,
                quantity: Math.abs(quantity),
                reason,
                userId: '1', // TODO: Obtener del servicio de auth
                updatedAt: new Date().toISOString()
              };
              // Conversión a MaterialMovement para la base si es necesario
              this.addMovement(movement as any);
              observer.next();
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        } else {
          observer.error(new Error('Material no encontrado'));
        }
      });
    });
  }

  addMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): void {
    // Convertir updatedAt a Date si es string
    const mov: any = { ...movement };
    if (typeof mov.updatedAt === 'string') {
      mov.updatedAt = new Date(mov.updatedAt);
    }
    this.databaseService.createInventoryMovement(mov);
    // No llamar a this.loadMovements() aquí para evitar bucles infinitos
  }

  updateMaterial(id: string, updates: Partial<Material>): Observable<void> {
    console.log('MaterialService.updateMaterial - ID:', id, 'Updates:', updates);
    
    return new Observable(observer => {
      this.updateMaterialInDB(id, updates).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  private async updateMaterialInDB(id: string, updates: Partial<Material>): Promise<void> {
    console.log('MaterialService.updateMaterialInDB - ID:', id, 'Updates:', updates);
    
    try {
      // Obtener material actual
      const materials = await this.databaseService.getMaterials();
      const material = materials.find(m => m.id === id);
      
      if (!material) {
        throw new Error('Material no encontrado');
      }
      
      console.log('Material original encontrado:', material);
      
      // Aplicar actualizaciones
      const updatedMaterial = { ...material, ...updates };
      console.log('Material después de aplicar updates:', updatedMaterial);
      
      // Guardar en base de datos
      await this.databaseService.updateMaterial(id, updatedMaterial);
      console.log('Material actualizado en DB exitosamente, recargando materiales...');
      
      // Recargar materiales
      await this.loadMaterials();
      console.log('Materiales recargados desde DB');
      
    } catch (error) {
      console.error('Error actualizando material:', error);
      throw error;
    }
  }

  deleteMaterial(id: string): Observable<void> {
    return from(this.databaseService.deleteMaterial(id)).pipe(
      map(() => {
        this.loadMaterials(); // Recargar lista
      })
    );
  }

  // Removed old updateMaterialStock(id: string, ...) implementation
  /**
   * Update material stock directly, avoiding observable-based loops.
   */
  updateMaterialStock(material: Material, quantityChange: number): Observable<void> {
    console.log('[DEBUG] updateMaterialStock called', { id: material.id, quantityChange });
    const newStock = material.currentStock + quantityChange;
    console.log('[DEBUG] updateMaterialStock - newStock', newStock);
    if (newStock < 0) {
      console.error('[DEBUG] updateMaterialStock - intento de guardar stock negativo, operación cancelada');
      throw new Error('Stock insuficiente');
    }
    return this.updateMaterial(material.id, { currentStock: newStock }).pipe(
      map(() => {
        console.log('[DEBUG] updateMaterialStock - stock updated');
        return;
      })
    );
  }

  async loadMaterials() {
    console.log('MaterialService.loadMaterials - Cargando materiales desde DB...');
    try {
      const materials = await this.databaseService.getMaterials();
      console.log('MaterialService.loadMaterials - Materiales obtenidos de DB:', materials.length);
      
      const mappedMaterials = materials.map(m => {
        const mapped = {
          ...m,
          supplierId: m.supplierId,
          isActive: Boolean(m.isActive),
          qrCode: m.qrCode,
          barcode: m.barcode,
          createdAt: typeof m.createdAt === 'string' ? new Date(m.createdAt) : m.createdAt,
          updatedAt: typeof m.updatedAt === 'string' ? new Date(m.updatedAt) : m.updatedAt
        };
        if (m.name.includes('Cable UTP Cat 6')) {
          console.log(`MaterialService.loadMaterials - ${m.name} datos completos de DB:`, m);
          console.log(`MaterialService.loadMaterials - ${m.name} evaluación isActive:`, {
            original: m.isActive,
            originalType: typeof m.isActive,
            result: mapped.isActive,
            booleanConversion: Boolean(m.isActive)
          });
        }
        return mapped;
      });
      
      this.materialsSubject.next(mappedMaterials);
      console.log('MaterialService.loadMaterials - Materiales actualizados en subject');
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      this.materialsSubject.next([]);
    }
  }

  async loadMovements() {
    try {
      const movements = await this.databaseService.getInventoryMovements();
      // Convertir fechas a string para InventoryMovement
      const invMovements = movements.map((m: any) => ({
        ...m,
        createdAt: typeof m.createdAt === 'string' ? m.createdAt : m.createdAt?.toISOString?.() ?? '',
        updatedAt: m.updatedAt ? (typeof m.updatedAt === 'string' ? m.updatedAt : m.updatedAt?.toISOString?.()) : undefined
      }));
      this.movementsSubject.next(invMovements);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      this.movementsSubject.next([]);
    }
  }

  getMaterialsByCriteria(criteria: {
    active?: boolean;
    lowStock?: boolean;
    category?: string;
  }): Observable<Material[]> {
    return this.getMaterials().pipe(
      map(materials => materials.filter(material => {
        if (criteria.active !== undefined && material.isActive !== criteria.active) {
          return false;
        }
        if (criteria.lowStock && material.currentStock > material.minimumStock) {
          return false;
        }
        if (criteria.category && material.category !== criteria.category) {
          return false;
        }
        return true;
      }))
    );
  }

  searchMaterials(searchTerm: string): Observable<Material[]> {
    return this.getMaterials().pipe(
      map(materials => materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  getLowStockMaterials(): Observable<Material[]> {
    return this.getMaterials().pipe(
      map(materials => materials.filter(material => 
        material.currentStock <= material.minimumStock && material.isActive
      ))
    );
  }

  getTotalValue(): Observable<number> {
    return this.getMaterials().pipe(
      map(materials => materials.reduce((total, material) => 
        total + (material.currentStock * (material.price || 0)), 0
      ))
    );
  }
}