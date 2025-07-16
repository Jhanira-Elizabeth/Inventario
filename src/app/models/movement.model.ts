export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  AJUSTE = 'AJUSTE'
}

export interface Movement {
  id: string;
  materialId: string;
  workId?: string;
  userId: string;
  type: MovementType;
  quantity: number;
  notes?: string;
  createdAt: string;
}
