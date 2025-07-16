export interface Material {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  location: string;
  supplierId?: string;
  isActive: number;
  qrCode?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}
