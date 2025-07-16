import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonButtons,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  statsChart, 
  download, 
  calendar, 
  business, 
  cube, 
  trendingUp, 
  analytics, 
  pieChart, 
  refresh, 
  barChart,
  chevronDownCircleOutline
} from 'ionicons/icons';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { DatabaseService } from '../shared/services/database.service';
import { Work, Material, MaterialMovement } from '../shared/models';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonButtons,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonBadge,
    IonChip,
    IonRefresher,
    IonRefresherContent
  ]
})
export class ReportsPage implements OnInit, AfterViewInit, ViewWillEnter {
  @ViewChild('projectStatusChart', { static: false }) projectStatusChart!: ElementRef;
  @ViewChild('materialConsumptionChart', { static: false }) materialConsumptionChart!: ElementRef;
  @ViewChild('projectMaterialChart', { static: false }) projectMaterialChart!: ElementRef;

  // Charts
  private statusChart: Chart | null = null;
  private consumptionChart: Chart | null = null;
  private projectChart: Chart | null = null;

  // Data
  works: any[] = [];
  materials: any[] = [];
  movements: any[] = [];
  materialConsumption: any[] = [];
  projectMaterialUsage: any[] = [];
  
  // Statistics
  projectStats = {
    total: 0,
    active: 0,
    finished: 0,
    suspended: 0,
    cancelled: 0
  };

  materialStats = {
    totalMaterials: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  };

  selectedPeriod: 'all' | 'month' | 'quarter' = 'all';

  constructor(
    private databaseService: DatabaseService,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      statsChart, 
      download, 
      calendar, 
      business, 
      cube, 
      trendingUp, 
      analytics, 
      pieChart, 
      refresh,
      barChart,
      chevronDownCircleOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // Los gráficos se inicializarán después de cargar los datos
  }

  ionViewWillEnter() {
    // Este método se ejecuta cada vez que se entra a la pestaña
    console.log('Entrando a la pestaña de reportes - actualizando datos...');
    this.refreshReports();
  }

  public async refreshReports() {
    const loading = await this.loadingController.create({
      message: 'Actualizando reportes...',
      duration: 10000 // máximo 10 segundos
    });
    
    await loading.present();
    
    try {
      console.log('Actualizando reportes...');
      
      // Destruir gráficos existentes antes de recargar
      this.destroyCharts();
      
      // Cargar datos actualizados
      await this.loadData();
      
      console.log('Reportes actualizados exitosamente');
    } catch (error) {
      console.error('Error al actualizar reportes:', error);
    } finally {
      await loading.dismiss();
    }
  }

  async onRefresh(event: any) {
    await this.refreshReports();
    event.target.complete();
  }

  private destroyCharts() {
    if (this.statusChart) {
      this.statusChart.destroy();
      this.statusChart = null;
    }
    if (this.consumptionChart) {
      this.consumptionChart.destroy();
      this.consumptionChart = null;
    }
    if (this.projectChart) {
      this.projectChart.destroy();
      this.projectChart = null;
    }
  }

  async loadData() {
    try {
      // Cargar datos según el período seleccionado
      await Promise.all([
        this.loadWorks(),
        this.loadMaterials(),
        this.loadMovements(),
        this.loadMaterialConsumption(),
        this.loadProjectMaterialUsage()
      ]);
      
      this.calculateStatistics();
      
      // Inicializar gráficos después de cargar datos
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async loadWorks(): Promise<void> {
    try {
      this.works = await this.databaseService.getWorksByPeriod(this.selectedPeriod);
    } catch (error) {
      console.error('Error loading works:', error);
      this.works = [];
    }
  }

  private async loadMaterials(): Promise<void> {
    try {
      this.materials = await this.databaseService.getMaterials();
    } catch (error) {
      console.error('Error loading materials:', error);
      this.materials = [];
    }
  }

  private async loadMovements(): Promise<void> {
    try {
      this.movements = await this.databaseService.getInventoryMovementsByPeriod(this.selectedPeriod);
    } catch (error) {
      console.error('Error loading movements:', error);
      this.movements = [];
    }
  }

  private async loadMaterialConsumption(): Promise<void> {
    try {
      this.materialConsumption = await this.databaseService.getMaterialConsumptionByPeriod(this.selectedPeriod);
    } catch (error) {
      console.error('Error loading material consumption:', error);
      this.materialConsumption = [];
    }
  }

  private async loadProjectMaterialUsage(): Promise<void> {
    try {
      this.projectMaterialUsage = await this.databaseService.getProjectMaterialUsageByPeriod(this.selectedPeriod);
    } catch (error) {
      console.error('Error loading project material usage:', error);
      this.projectMaterialUsage = [];
    }
  }

  private calculateStatistics() {
    // Estadísticas de proyectos
    this.projectStats = {
      total: this.works.length,
      active: this.works.filter(w => w.status === 'activa').length,
      finished: this.works.filter(w => w.status === 'finalizada').length,
      suspended: this.works.filter(w => w.status === 'suspendida').length,
      cancelled: this.works.filter(w => w.status === 'cancelada').length
    };

    // Estadísticas de materiales
    this.materialStats = {
      totalMaterials: this.materials.length,
      totalValue: this.materials.reduce((sum, m) => sum + (m.currentStock * (m.price || 0)), 0),
      lowStock: this.materials.filter(m => m.currentStock <= m.minimumStock).length,
      outOfStock: this.materials.filter(m => m.currentStock === 0).length
    };
  }

  private initializeCharts() {
    this.createProjectStatusChart();
    this.createMaterialConsumptionChart();
    this.createProjectMaterialChart();
  }

  private createProjectStatusChart() {
    if (this.projectStatusChart?.nativeElement) {
      const ctx = this.projectStatusChart.nativeElement.getContext('2d');
      
      if (this.statusChart) {
        this.statusChart.destroy();
      }

      this.statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Activos', 'Terminados', 'Suspendidos', 'Cancelados'],
          datasets: [{
            data: [
              this.projectStats.active,
              this.projectStats.finished,
              this.projectStats.suspended,
              this.projectStats.cancelled
            ],
            backgroundColor: [
              '#28a745', // Verde para activos
              '#007bff', // Azul para terminados
              '#ffc107', // Amarillo para suspendidos
              '#dc3545'  // Rojo para cancelados
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = this.projectStats.total;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  private createMaterialConsumptionChart() {
    if (this.materialConsumptionChart?.nativeElement) {
      const ctx = this.materialConsumptionChart.nativeElement.getContext('2d');
      
      if (this.consumptionChart) {
        this.consumptionChart.destroy();
      }

      // Usar datos reales de consumo de material por período
      const topMaterials = this.materialConsumption
        .sort((a, b) => b.totalConsumed - a.totalConsumed)
        .slice(0, 5); // Top 5 materiales más consumidos

      this.consumptionChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: topMaterials.map(item => item.materialName),
          datasets: [{
            data: topMaterials.map(item => item.totalConsumed),
            backgroundColor: [
              '#ff6384',
              '#36a2eb',
              '#ffcd56',
              '#4bc0c0',
              '#9966ff'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = topMaterials[context.dataIndex];
                  return `${item.materialName}: ${item.totalConsumed} ${item.unit}`;
                }
              }
            }
          }
        }
      });
    }
  }

  private createProjectMaterialChart() {
    if (this.projectMaterialChart?.nativeElement) {
      const ctx = this.projectMaterialChart.nativeElement.getContext('2d');
      
      if (this.projectChart) {
        this.projectChart.destroy();
      }

      // Calcular consumo por proyecto
      // Agrupar por proyecto y sumar cantidades
      const projectTotals = this.projectMaterialUsage.reduce((acc: any, item: any) => {
        if (!acc[item.workName]) {
          acc[item.workName] = 0;
        }
        acc[item.workName] += item.totalUsed;
        return acc;
      }, {});

      const topProjects = Object.entries(projectTotals)
        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
        .slice(0, 5); // Top 5 proyectos que más consumen

      this.projectChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: topProjects.map(([name]) => name),
          datasets: [{
            data: topProjects.map(([, quantity]) => Number(quantity)),
            backgroundColor: [
              '#8e5ea2',
              '#3cba9f',
              '#e8c3b9',
              '#c45850',
              '#f7464a'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  return `${label}: ${value} materiales`;
                }
              }
            }
          }
        }
      });
    }
  }

  async onPeriodChange(event: any) {
    this.selectedPeriod = event.detail.value;
    
    const loading = await this.loadingController.create({
      message: 'Actualizando reportes...',
      duration: 5000
    });
    
    await loading.present();
    
    try {
      // Destruir gráficos existentes
      this.destroyCharts();
      
      // Recargar todos los datos con el nuevo período
      await this.loadData();
      
      console.log(`Reportes actualizados para período: ${this.selectedPeriod}`);
    } catch (error) {
      console.error('Error al cambiar período:', error);
    } finally {
      await loading.dismiss();
    }
  }

  generateReport() {
    // Implementar generación de reporte PDF
    console.log('Generando reporte...');
  }

  ngOnDestroy() {
    // Limpiar gráficos al destruir el componente
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.consumptionChart) {
      this.consumptionChart.destroy();
    }
    if (this.projectChart) {
      this.projectChart.destroy();
    }
  }
}
