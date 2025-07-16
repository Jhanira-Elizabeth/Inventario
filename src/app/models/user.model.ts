export interface User {
  id: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}
