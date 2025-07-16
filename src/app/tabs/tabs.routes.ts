import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { reportsGuard, suppliersGuard } from '../shared/guards';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../tab1/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('../materials/materials.page').then((m) => m.MaterialsPage),
      },
      {
        path: 'works',
        loadComponent: () =>
          import('../works/works.page').then((m) => m.WorksPage),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('../suppliers/suppliers.page').then((m) => m.SuppliersPage),
        canActivate: [suppliersGuard]
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../reports/reports.page').then((m) => m.ReportsPage),
        canActivate: [reportsGuard]
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  // Rutas para materiales
  {
    path: 'materials',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../materials/materials.page').then((m) => m.MaterialsPage),
      },
      {
        path: 'add',
        loadComponent: () =>
          import('../materials/material-form/material-form.page').then((m) => m.MaterialFormPage),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('../materials/material-form/material-form.page').then((m) => m.MaterialFormPage),
      },
      {
        path: 'view/:id',
        loadComponent: () =>
          import('../materials/material-detail/material-detail.page').then((m) => m.MaterialDetailPage),
      }
    ]
  },
  // Rutas para obras
  {
    path: 'works',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../works/works.page').then((m) => m.WorksPage),
      },
      {
        path: 'add',
        loadComponent: () =>
          import('../works/work-form/work-form.page').then((m) => m.WorkFormPage),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('../works/work-form/work-form.page').then((m) => m.WorkFormPage),
      },
      {
        path: 'view/:id',
        loadComponent: () =>
          import('../works/work-detail/work-detail.page').then((m) => m.WorkDetailPage),
      }
    ]
  },
  // Rutas para proveedores
  {
    path: 'suppliers',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../suppliers/suppliers.page').then((m) => m.SuppliersPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../suppliers/supplier-form/supplier-form.page').then((m) => m.SupplierFormPage),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('../suppliers/supplier-form/supplier-form.page').then((m) => m.SupplierFormPage),
      }
    ]
  }
];
