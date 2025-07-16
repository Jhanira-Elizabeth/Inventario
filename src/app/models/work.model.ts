export enum WorkStatus {
  ACTIVA = 'ACTIVA',
  FINALIZADA = 'FINALIZADA',
  SUSPENDIDA = 'SUSPENDIDA',
  CANCELADA = 'CANCELADA'
}

export interface Work {
  id: string;
  code: string;
  name: string;
  description: string;
  client: string;
  location: string;
  status: WorkStatus;
  budget: number;
  startDate: string;
  estimatedEndDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
