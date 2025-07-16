export interface InventoryReport {
  totalMaterials: number;
  totalValue: number;
  lowStockMaterials: number;
  totalMovements: number;
  materialsWithStock: MaterialStockInfo[];
  lowStockAlerts: MaterialStockInfo[];
}

export interface MaterialStockInfo {
  materialId: string;
  materialName: string;
  materialCode: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  location: string;
  isLowStock: boolean;
  value?: number;
}

export interface MovementReport {
  dateFrom: Date;
  dateTo: Date;
  totalMovements: number;
  movements: MovementReportItem[];
  materialsSummary: MaterialMovementSummary[];
}

export interface MovementReportItem {
  id: string;
  date: Date;
  materialName: string;
  materialCode: string;
  movementType: string;
  quantity: number;
  unit: string;
  userName: string;
  workName?: string;
  technicianName?: string;
  notes?: string;
}

export interface MaterialMovementSummary {
  materialId: string;
  materialName: string;
  materialCode: string;
  totalEntries: number;
  totalExits: number;
  netMovement: number;
  unit: string;
}

export interface TechnicianReport {
  technicianId: string;
  technicianName: string;
  dateFrom: Date;
  dateTo: Date;
  totalMaterialsUsed: number;
  totalWorksAssigned: number;
  materialsDelivered: TechnicianMaterialDelivery[];
  worksAssigned: string[];
}

export interface TechnicianMaterialDelivery {
  materialId: string;
  materialName: string;
  materialCode: string;
  totalQuantityDelivered: number;
  unit: string;
  numberOfUses: number;
}
