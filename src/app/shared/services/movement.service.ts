import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MaterialMovement, MovementType } from '../models/material.model';
import { MaterialService } from './material.service';
import { AuthService } from './auth.service';
import { DatabaseService, InventoryMovement } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private movementsSubject = new BehaviorSubject<MaterialMovement[]>([]);
  public movements$ = this.movementsSubject.asObservable();

  // Datos de ejemplo para movimientos
  private mockMovements: MaterialMovement[] = [
    {
      id: '1',
      materialId: '1',
      type: MovementType.ENTRADA,
      quantity: 100,
      reason: 'Compra inicial',
      userId: '1',
      notes: 'Compra inicial de cables',
      remainingStock: 150,
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-15T10:00:00')
    },
    {
      id: '2',
      materialId: '1',
      type: MovementType.SALIDA_ENTREGA,
      quantity: 25,
      reason: 'Entrega a obra',
      userId: '2',
      workId: '1',
      technicianId: '3',
      notes: 'Entrega para instalación eléctrica',
      remainingStock: 125,
      createdAt: new Date('2024-01-20T14:30:00'),
      updatedAt: new Date('2024-01-20T14:30:00')
    },
    {
      id: '3',
      materialId: '2',
      type: MovementType.ENTRADA,
      quantity: 50,
      reason: 'Reposición',
      userId: '1',
      notes: 'Reposición de conectores',
      remainingStock: 80,
      createdAt: new Date('2024-01-18T09:15:00'),
      updatedAt: new Date('2024-01-18T09:15:00')
    }
  ];

  constructor(
    private materialService: MaterialService,
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {
    // Inicialización: cargar movimientos reales desde la base de datos al inicio
    this.reloadMovements();
  }

  // Obtener todos los movimientos
  getMovements(): Observable<MaterialMovement[]> {
    return this.movements$;
  }

  // Obtener movimientos por material
  getMovementsByMaterial(materialId: string): Observable<MaterialMovement[]> {
    return this.movements$.pipe(
      map(movements => movements.filter(m => m.materialId === materialId))
    );
  }

  // Obtener movimientos por trabajo
  getMovementsByWork(workId: string): Observable<MaterialMovement[]> {
    return this.movements$.pipe(
      map(movements => movements.filter(m => m.workId === workId))
    );
  }

  // Registrar entrada de material
  registerEntry(materialId: string, quantity: number, notes?: string): Observable<MaterialMovement> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }
    const movement: MaterialMovement = {
      id: this.generateId(),
      materialId: materialId,
      type: MovementType.ENTRADA,
      movementType: MovementType.ENTRADA,
      quantity: quantity,
      reason: 'Entrada de material',
      userId: currentUser.id,
      notes: notes,
      remainingStock: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return from(this.databaseService.createInventoryMovement({
      materialId: movement.materialId,
      type: MovementType.ENTRADA,
      movementType: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      userId: movement.userId,
      technicianId: movement.technicianId,
      notes: movement.notes,
      remainingStock: movement.remainingStock,
      updatedAt: movement.updatedAt
    })).pipe(
      map(() => movement),
      // Recargar movimientos después de registrar
      switchMap((result) => from(this.reloadMovements()).pipe(map(() => result)))
    );
  }

  // Registrar salida de material (entrega)
  registerDelivery(
    materialId: string, 
    quantity: number, 
    workId: string, 
    technicianId: string,
    notes?: string
  ): Observable<MaterialMovement> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }
    const movement: MaterialMovement = {
      id: this.generateId(),
      materialId: materialId,
      type: MovementType.SALIDA_ENTREGA,
      movementType: MovementType.SALIDA_ENTREGA,
      quantity: quantity,
      reason: 'Entrega a técnico',
      userId: currentUser.id,
      workId: workId,
      technicianId: technicianId,
      notes: notes,
      remainingStock: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return from(this.databaseService.createInventoryMovement({
      materialId: movement.materialId,
      workId: movement.workId,
      type: MovementType.SALIDA_ENTREGA,
      movementType: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      userId: movement.userId,
      technicianId: movement.technicianId,
      notes: movement.notes,
      remainingStock: movement.remainingStock,
      updatedAt: movement.updatedAt
    })).pipe(
      map(() => movement),
      switchMap((result) => from(this.reloadMovements()).pipe(map(() => result)))
    );
  }
  // Método para recargar movimientos desde la base de datos y actualizar el subject
  async reloadMovements() {
    console.log('[DEBUG] reloadMovements: INICIO');
    const inventoryMovements = await this.databaseService.getInventoryMovements();
    console.log('[DEBUG] reloadMovements: movimientos obtenidos', inventoryMovements.length, inventoryMovements);
    // Convertir InventoryMovement a MaterialMovement
    const convertedMovements: MaterialMovement[] = inventoryMovements.map(inv => {
      try {
        if (!inv.id || !inv.materialId) {
          console.error('[DEBUG] reloadMovements: movimiento inválido', inv);
        }
      } catch (e) {
        console.error('[DEBUG] reloadMovements: error al validar movimiento', e, inv);
      }
      // Normalizar movementType: si es string, convertir al enum
      let movementType: MovementType = MovementType.ENTRADA;
      if (typeof inv.movementType === 'string') {
        switch (inv.movementType) {
          case 'entrada': movementType = MovementType.ENTRADA; break;
          case 'salida': movementType = MovementType.SALIDA; break;
          case 'transferencia': movementType = MovementType.TRANSFERENCIA; break;
          case 'ajuste': movementType = MovementType.AJUSTE; break;
          case 'salida_entrega': movementType = MovementType.SALIDA_ENTREGA; break;
          default: movementType = MovementType.ENTRADA;
        }
      } else if (typeof inv.movementType === 'number') {
        movementType = inv.movementType;
      }
      // Manejo seguro de fechas
      let createdAt: Date;
      let updatedAt: Date;
      try {
        createdAt = inv.createdAt ? new Date(inv.createdAt) : new Date();
        updatedAt = inv.updatedAt ? new Date(inv.updatedAt) : createdAt;
        if (isNaN(createdAt.getTime())) createdAt = new Date();
        if (isNaN(updatedAt.getTime())) updatedAt = createdAt;
      } catch {
        createdAt = new Date();
        updatedAt = createdAt;
      }
      // Log de conversión
      console.log('[DEBUG] reloadMovements: movimiento convertido', inv.id, movementType, createdAt);
      return {
        id: inv.id,
        materialId: inv.materialId,
        workId: inv.workId,
        type: movementType,
        movementType,
        quantity: inv.quantity,
        reason: inv.reason,
        userId: inv.userId,
        technicianId: inv.technicianId,
        notes: inv.notes,
        remainingStock: inv.remainingStock || 0,
        createdAt,
        updatedAt
      };
    });
    console.log('[DEBUG] reloadMovements: movimientos convertidos', convertedMovements.length, convertedMovements);
    // Solo cargar movimientos reales desde la base de datos
    this.movementsSubject.next(convertedMovements);
    console.log('[DEBUG] reloadMovements: FIN');
  }

  // Obtener historial de movimientos con paginación
  getMovementHistory(page: number = 1, limit: number = 20): Observable<{
    movements: MaterialMovement[],
    total: number,
    page: number,
    totalPages: number
  }> {
    return this.movements$.pipe(
      map(movements => {
        const sortedMovements = movements.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMovements = sortedMovements.slice(startIndex, endIndex);
        
        return {
          movements: paginatedMovements,
          total: movements.length,
          page: page,
          totalPages: Math.ceil(movements.length / limit)
        };
      })
    );
  }

  // Obtener estadísticas de movimientos
  getMovementStats(): Observable<{
    totalEntries: number,
    totalDeliveries: number,
    todayMovements: number
  }> {
    return this.movements$.pipe(
      map(movements => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayMovements = movements.filter(m => {
          const movementDate = new Date(m.createdAt);
          movementDate.setHours(0, 0, 0, 0);
          return movementDate.getTime() === today.getTime();
        });

        return {
          totalEntries: movements.filter(m => m.movementType === MovementType.ENTRADA).length,
          totalDeliveries: movements.filter(m => m.movementType === MovementType.SALIDA_ENTREGA).length,
          todayMovements: todayMovements.length
        };
      })
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
