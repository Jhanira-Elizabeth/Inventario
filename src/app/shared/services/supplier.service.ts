import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Supplier, SupplierCreate, SupplierUpdate, SupplierFilter } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private suppliersSubject = new BehaviorSubject<Supplier[]>([]);
  public suppliers$ = this.suppliersSubject.asObservable();

  // Datos de ejemplo
  private mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'Ferretería El Constructor',
      email: 'ventas@elconstructor.com',
      phone: '03-2741562',
      address: 'Av. Cevallos 12-34 y Montalvo',
      contactPerson: 'Carlos Pérez',
      ruc: '1891234567001',
      city: 'Ambato',
      isActive: true,
      notes: 'Proveedor principal de herramientas y materiales básicos',
      materialsSupplied: ['1', '2', '3'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Distribuidora Eléctrica Tungurahua',
      email: 'info@electrica-tungurahua.com',
      phone: '03-2845123',
      address: 'Sector La Península, Calle Los Andes',
      contactPerson: 'María González',
      ruc: '1801234567001',
      city: 'Ambato',
      isActive: true,
      notes: 'Especialista en materiales eléctricos y cables',
      materialsSupplied: ['4', '5'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '3',
      name: 'Materiales de Construcción Andrade',
      email: 'ventas@andrade.ec',
      phone: '03-2567890',
      address: 'Panamericana Norte Km 12',
      contactPerson: 'Luis Andrade',
      ruc: '1891234568001',
      city: 'Ambato',
      isActive: true,
      notes: 'Cemento, hierro, bloques y materiales pesados',
      materialsSupplied: ['6', '7'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '4',
      name: 'Importadora San Miguel',
      email: 'contacto@sanmiguel.com',
      phone: '03-2334455',
      address: 'Sector Huachi Loreto',
      contactPerson: 'Ana Herrera',
      ruc: '1801234568001',
      city: 'Ambato',
      isActive: false,
      notes: 'Proveedor descontinuado - problemas de calidad',
      materialsSupplied: [],
      createdAt: new Date('2023-12-10'),
      updatedAt: new Date('2024-03-15')
    }
  ];

  constructor() {
    this.suppliersSubject.next(this.mockSuppliers);
  }

  // Obtener todos los proveedores
  getSuppliers(): Observable<Supplier[]> {
    return this.suppliers$;
  }

  // Obtener proveedor por ID
  getSupplierById(id: string): Observable<Supplier | null> {
    const supplier = this.suppliersSubject.value.find(s => s.id === id);
    return of(supplier || null);
  }

  // Obtener proveedores activos
  getActiveSuppliers(): Observable<Supplier[]> {
    const activeSuppliers = this.suppliersSubject.value.filter(s => s.isActive);
    return of(activeSuppliers);
  }

  // Crear proveedor
  createSupplier(supplierData: SupplierCreate): Observable<Supplier> {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      ...supplierData,
      isActive: true,
      materialsSupplied: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentSuppliers = this.suppliersSubject.value;
    this.suppliersSubject.next([...currentSuppliers, newSupplier]);
    
    return of(newSupplier);
  }

  // Actualizar proveedor
  updateSupplier(supplierData: SupplierUpdate): Observable<Supplier> {
    const currentSuppliers = this.suppliersSubject.value;
    const index = currentSuppliers.findIndex(s => s.id === supplierData.id);
    
    if (index === -1) {
      throw new Error('Proveedor no encontrado');
    }

    const updatedSupplier: Supplier = {
      ...currentSuppliers[index],
      ...supplierData,
      updatedAt: new Date()
    };

    currentSuppliers[index] = updatedSupplier;
    this.suppliersSubject.next([...currentSuppliers]);
    
    return of(updatedSupplier);
  }

  // Eliminar proveedor
  deleteSupplier(id: string): Observable<boolean> {
    const currentSuppliers = this.suppliersSubject.value;
    const filteredSuppliers = currentSuppliers.filter(s => s.id !== id);
    
    if (filteredSuppliers.length === currentSuppliers.length) {
      return of(false); // No se encontró el proveedor
    }
    
    this.suppliersSubject.next(filteredSuppliers);
    return of(true);
  }

  // Activar/desactivar proveedor
  toggleSupplierStatus(id: string): Observable<Supplier> {
    const currentSuppliers = this.suppliersSubject.value;
    const index = currentSuppliers.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Proveedor no encontrado');
    }

    currentSuppliers[index] = {
      ...currentSuppliers[index],
      isActive: !currentSuppliers[index].isActive,
      updatedAt: new Date()
    };

    this.suppliersSubject.next([...currentSuppliers]);
    return of(currentSuppliers[index]);
  }

  // Filtrar proveedores
  filterSuppliers(filter: SupplierFilter): Observable<Supplier[]> {
    let filteredSuppliers = this.suppliersSubject.value;

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower) ||
        supplier.contactPerson?.toLowerCase().includes(searchLower) ||
        supplier.ruc?.includes(filter.searchTerm!)
      );
    }

    if (filter.isActive !== undefined) {
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.isActive === filter.isActive
      );
    }

    if (filter.city) {
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.city?.toLowerCase().includes(filter.city!.toLowerCase())
      );
    }

    return of(filteredSuppliers);
  }

  // Obtener estadísticas de proveedores
  getSupplierStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    totalMaterialsSupplied: number;
  }> {
    const suppliers = this.suppliersSubject.value;
    const stats = {
      total: suppliers.length,
      active: suppliers.filter(s => s.isActive).length,
      inactive: suppliers.filter(s => !s.isActive).length,
      totalMaterialsSupplied: suppliers.reduce((sum, s) => sum + (s.materialsSupplied?.length || 0), 0)
    };
    
    return of(stats);
  }
}
