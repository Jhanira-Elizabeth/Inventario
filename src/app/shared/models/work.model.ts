export interface Work {
  id: string;
  name: string;
  description: string;
  location: string;
  clientName?: string;
  status: WorkStatus;
  startDate: Date;
  endDate?: Date;
  estimatedEndDate?: Date;
  actualDeliveryDate?: Date;
  totalMaterialsCost?: number;
  assignedTechnicians: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkStatus {
  ACTIVA = 'activa',
  FINALIZADA = 'finalizada',
  SUSPENDIDA = 'suspendida',
  CANCELADA = 'cancelada'
}

export interface WorkSummary {
  workId: string;
  work: Work;
  totalMaterials: number;
  totalCost: number;
  materialsUsed: WorkMaterialSummary[];
}

export interface WorkMaterialSummary {
  materialId: string;
  materialName: string;
  materialCode: string;
  totalQuantityUsed: number;
  unit: string;
  totalCost: number;
}
