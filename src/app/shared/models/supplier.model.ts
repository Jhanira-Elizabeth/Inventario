export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  ruc?: string; // RUC para Ecuador
  city?: string;
  isActive: boolean;
  notes?: string;
  materialsSupplied?: string[]; // IDs de materiales que suministra
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierCreate {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  ruc?: string;
  city?: string;
  notes?: string;
}

export interface SupplierUpdate {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  ruc?: string;
  city?: string;
  isActive?: boolean;
  notes?: string;
}

export interface SupplierFilter {
  searchTerm?: string;
  isActive?: boolean;
  city?: string;
}
