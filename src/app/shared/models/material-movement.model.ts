export interface MaterialMovement {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  type: 'ingreso' | 'egreso';
  quantity: number;
  unit: string;
  reason: string;
  workId?: string; // Opcional, solo para egresos por obra
  workName?: string;
  userId: string;
  userName: string;
  userRole: string;
  date: Date;
  notes?: string;
  previousStock: number;
  newStock: number;
  cost?: number; // Costo unitario para ingresos
  totalCost?: number; // Costo total del movimiento
  supplier?: string; // Proveedor para ingresos
  documentNumber?: string; // Número de factura/orden/etc.
  location?: string; // Ubicación del material
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialMovementCreate {
  materialId: string;
  type: 'ingreso' | 'egreso';
  quantity: number;
  reason: string;
  workId?: string;
  notes?: string;
  cost?: number;
  supplier?: string;
  documentNumber?: string;
}

export interface MaterialMovementFilter {
  materialId?: string;
  type?: 'ingreso' | 'egreso';
  workId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  reason?: string;
}

export const MOVEMENT_REASONS = {
  ingreso: [
    'Compra',
    'Devolución de obra',
    'Transferencia de bodega',
    'Ajuste de inventario',
    'Donación',
    'Otro'
  ],
  egreso: [
    'Uso en obra',
    'Venta',
    'Transferencia a bodega',
    'Material dañado',
    'Material perdido',
    'Ajuste de inventario',
    'Otro'
  ]
} as const;
