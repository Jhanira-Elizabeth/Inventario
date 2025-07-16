import { User } from './user.model';

export interface Material {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price?: number;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  location?: string;
  supplierId?: string;
  supplier?: string;
  isActive: boolean;
  qrCode?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialMovement {
  id: string;
  materialId: string;
  workId?: string;
  type: MovementType;
  movementType?: MovementType; // Propiedad adicional para compatibilidad
  quantity: number;
  reason: string;
  userId: string;
  technicianId?: string; // Agregar para entregas a técnicos
  notes?: string; // Agregar para notas adicionales
  remainingStock?: number; // Agregar para mostrar stock restante
  createdAt: Date;
  updatedAt: Date;
}

export enum MovementType {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  TRANSFERENCIA = 'transferencia',
  AJUSTE = 'ajuste',
  SALIDA_ENTREGA = 'salida_entrega' // Agregar tipo faltante
}

export interface MaterialDelivery {
  id: string;
  materialId: string;
  material?: Material;
  quantity: number;
  technicianId: string;
  technician?: User;
  deliveredBy: string;
  deliveredUser?: User;
  notes?: string;
  createdAt: Date;
}