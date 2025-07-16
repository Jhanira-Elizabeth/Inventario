import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) {}

  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  // Permisos generales por módulo
  canAccessMaterials(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden acceder
  }

  canAccessWorks(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden acceder
  }

  canAccessReports(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden acceder
  }

  canAccessMovements(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden acceder
  }

  canAccessSuppliers(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canAccessUsers(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  // Permisos específicos para materiales
  canCreateMaterial(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canEditMaterial(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canDeleteMaterial(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canViewMaterialDetails(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden ver detalles
  }

  // Permisos específicos para obras
  canCreateWork(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canEditWork(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canDeleteWork(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canEditWorkDeliveryDate(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden editar fecha de entrega real
  }

  canEditWorkStatus(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canEditWorkBasicInfo(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  // Permisos específicos para movimientos
  canCreateEntryMovement(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canCreateDeliveryMovement(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden hacer entregas/egresos
  }

  canViewMovementHistory(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden ver historial
  }

  // Permisos específicos para proveedores
  canCreateSupplier(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canEditSupplier(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canDeleteSupplier(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  // Permisos específicos para usuarios
  canCreateUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canEditUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  canDeleteUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  // Permisos específicos para reportes
  canViewAllReports(): boolean {
    const user = this.getCurrentUser();
    return user?.role !== undefined; // Todos pueden ver reportes
  }

  canExportReports(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMINISTRADOR;
  }

  // Método helper para obtener el rol actual
  getCurrentRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // Método helper para verificar si es técnico
  isTechnician(): boolean {
    return this.getCurrentRole() === UserRole.TECNICO;
  }

  // Método helper para verificar si es administrador
  isAdmin(): boolean {
    return this.getCurrentRole() === UserRole.ADMINISTRADOR;
  }
}
