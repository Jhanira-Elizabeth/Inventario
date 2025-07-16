// ...existing code...


import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserRole, LoginCredentials, AuthResponse, UserPermissions } from '../models';
import { DatabaseService } from './database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'netstar_token';
  private userKey = 'netstar_user';

  constructor(private databaseService: DatabaseService) {
    this.loadUserFromStorage();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const user = await this.databaseService.validateUserCredentials(
      credentials.username, 
      credentials.password
    );
    
    if (user && user.isActive) {
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      const authResponse: AuthResponse = {
        user: user,
        token,
        refreshToken
      };

      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.currentUserSubject.next(user);

      return authResponse;
    } else {
      throw new Error('Credenciales inválidas o usuario inactivo');
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getUsers(): Observable<User[]> {
    const users = JSON.parse(localStorage.getItem('netstar_users') || '[]');
    return of(users);
  }

  /**
   * Borra y re-inicializa la base de datos local (para desarrollo/demo)
   */
  public async resetDatabase(): Promise<void> {
    this.logout();
    try {
      await this.databaseService.dropAllTables();
    } catch (e) {
      // Ignorar errores si las tablas no existen
    }
    await this.databaseService.initializeDatabase();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!localStorage.getItem(this.tokenKey);
  }

  getUserPermissions(user: User): UserPermissions {
    switch (user.role) {
      case UserRole.ADMINISTRADOR:
        return {
          canManageUsers: true,
          canManageMaterials: true,
          canManageWorks: true,
          canViewReports: true,
          canDeliverMaterials: true,
          canReportUsage: true,
          canViewInventory: true
        };
      case UserRole.TECNICO:
        return {
          canManageUsers: false,
          canManageMaterials: false,
          canManageWorks: false,
          canViewReports: false,
          canDeliverMaterials: false,
          canReportUsage: true,
          canViewInventory: true
        };
      default:
        return {
          canManageUsers: false,
          canManageMaterials: false,
          canManageWorks: false,
          canViewReports: false,
          canDeliverMaterials: false,
          canReportUsage: false,
          canViewInventory: false
        };
    }
  }

  hasPermission(permission: keyof UserPermissions): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const permissions = this.getUserPermissions(user);
    return permissions[permission];
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserSubject.next(user);
    }
  }

  private generateToken(user: any): string {
    // En producción, usar JWT real
    return btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
  }

  private generateRefreshToken(user: any): string {
    // En producción, usar JWT real para refresh token
    return btoa(JSON.stringify({ userId: user.id, type: 'refresh', exp: Date.now() + 604800000 }));
  }
}
