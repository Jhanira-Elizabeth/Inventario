import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cube, 
  construct, 
  people, 
  warning, 
  checkmark,
  refresh,
  home,
  barChart
} from 'ionicons/icons';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { AuthService, MaterialService, WorkService } from '../shared/services';
import { MovementService } from '../shared/services/movement.service';
import { User, Material, Work, WorkStatus } from '../shared/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonRefresher,
    IonRefresherContent
  ]
})
export class DashboardPage implements OnInit, OnDestroy {
  currentUser: User | null = null;
  totalMaterials = 0;
  lowStockMaterials: Material[] = [];
  activeWorks: Work[] = [];
  recentMovements: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private materialService: MaterialService,
    private workService: WorkService,
    private movementService: MovementService,
    private router: Router
  ) {
    addIcons({ cube, construct, people, warning, checkmark, refresh, home, barChart });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    // Cargar materiales y detectar bajo stock
    this.materialService.getMaterials()
      .pipe(takeUntil(this.destroy$))
      .subscribe(materials => {
        this.totalMaterials = materials.length;
      });

    this.materialService.getLowStockMaterials()
      .pipe(takeUntil(this.destroy$))
      .subscribe(materials => {
        this.lowStockMaterials = materials;
      });

    // Cargar obras activas
    this.workService.getActiveWorks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(works => {
        this.activeWorks = works;
      });

    // Cargar movimientos recientes
    this.movementService.getMovements()
      .pipe(takeUntil(this.destroy$))
      .subscribe(movements => {
        this.recentMovements = movements
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      });
  }

  onRefresh(event: any) {
    this.loadDashboardData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getRoleColor(): string {
    if (!this.currentUser) return 'medium';
    
    switch (this.currentUser.role) {
      case 'administrador': return 'danger';
      case 'tecnico': return 'success';
      default: return 'medium';
    }
  }

  getMovementTypeColor(type: string): string {
    switch (type) {
      case 'entrada': return 'success';
      case 'salida_entrega': return 'warning';
      case 'salida_uso': return 'primary';
      case 'ajuste': return 'secondary';
      default: return 'medium';
    }
  }

  getMovementTypeLabel(type: string): string {
    switch (type) {
      case 'entrada': return 'Entrada';
      case 'salida_entrega': return 'Entrega';
      case 'salida_uso': return 'Uso';
      case 'ajuste': return 'Ajuste';
      default: return type;
    }
  }

  onRefreshData() {
    this.loadDashboardData();
  }

  navigateToReports() {
    this.router.navigate(['/tabs/reports']);
  }
}
