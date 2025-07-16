import { Component, EnvironmentInjector, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButton,
  IonPopover,
  IonContent,
  IonList,
  IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  home, 
  cube, 
  construct, 
  business, 
  statsChart, 
  person, 
  logOut,
  settings,
  swapVertical
} from 'ionicons/icons';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { User, UserRole } from '../shared/models/user.model';

interface TabItem {
  tab: string;
  href: string;
  icon: string;
  label: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    CommonModule,
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonPopover,
    IonContent,
    IonList,
    IonItem
  ],
})
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);
  
  currentUser: User | null = null;
  availableTabs: TabItem[] = [];
  isProfilePopoverOpen = false;
  
  private destroy$ = new Subject<void>();

  private allTabs: TabItem[] = [
    {
      tab: 'dashboard',
      href: '/tabs/dashboard',
      icon: 'home',
      label: 'Inicio',
      roles: [UserRole.ADMINISTRADOR, UserRole.TECNICO]
    },
    {
      tab: 'inventory',
      href: '/tabs/inventory',
      icon: 'cube',
      label: 'Inventario',
      roles: [UserRole.ADMINISTRADOR, UserRole.TECNICO]
    },
    {
      tab: 'works',
      href: '/tabs/works',
      icon: 'construct',
      label: 'Obras',
      roles: [UserRole.ADMINISTRADOR, UserRole.TECNICO]
    },
    {
      tab: 'suppliers',
      href: '/tabs/suppliers',
      icon: 'business',
      label: 'Proveedores',
      roles: [UserRole.ADMINISTRADOR]
    },
    {
      tab: 'reports',
      href: '/tabs/reports',
      icon: 'stats-chart',
      label: 'Reportes',
      roles: [UserRole.ADMINISTRADOR, UserRole.TECNICO]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ 
      home, 
      cube, 
      construct, 
      business, 
      statsChart, 
      person, 
      logOut,
      settings,
      swapVertical
    });
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateAvailableTabs();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateAvailableTabs() {
    if (!this.currentUser) {
      this.availableTabs = [];
      return;
    }

    this.availableTabs = this.allTabs
      .filter(tab => tab.tab !== 'movements')
      .filter(tab => tab.roles.includes(this.currentUser!.role));
  }

  onProfileClick() {
    this.isProfilePopoverOpen = true;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
    this.isProfilePopoverOpen = false;
  }

  closeProfilePopover() {
    this.isProfilePopoverOpen = false;
  }
}
