export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMINISTRADOR = 'administrador',
  ENCARGADO = 'encargado',
  TECNICO = 'tecnico'
}
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}



export interface UserPermissions {
  canManageUsers: boolean;
  canManageMaterials: boolean;
  canManageWorks: boolean;
  canViewReports: boolean;
  canDeliverMaterials: boolean;
  canReportUsage: boolean;
  canViewInventory: boolean;
}
