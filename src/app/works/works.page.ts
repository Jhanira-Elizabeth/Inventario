import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonButtons, 
  IonIcon, 
  IonFab, 
  IonFabButton, 
  IonSearchbar,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  ToastController,
  ModalController,
  IonSegment,
  IonSegmentButton,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, search, filter, eye, create, trash, business, calendar, people, checkmark, pause, stop, play, location, sync } from 'ionicons/icons';
import { Work, WorkStatus } from '../shared/models';
import { WorkService, PermissionService } from '../shared/services';
import { ConfirmationModalComponent } from '../shared/components/confirmation-modal/confirmation-modal.component';
import { WorkFormModalComponent } from './work-form-modal/work-form-modal.component';
import { WorkStatusModalComponent } from './work-status-modal/work-status-modal.component';
import { WorkDeliveryDateModalComponent } from './work-delivery-date-modal/work-delivery-date-modal.component';

@Component({
  selector: 'app-works',
  templateUrl: './works.page.html',
  styleUrls: ['./works.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSearchbar,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonSegment,
    IonSegmentButton,
    IonChip
  ]
})
export class WorksPage implements OnInit, OnDestroy {
  works: Work[] = [];
  filteredWorks: Work[] = [];
  searchTerm: string = '';
  selectedSegment: string = 'all';
  private subscription: any;

  // Computed properties for template bindings
  get activeWorksCount(): number {
    return this.works.filter(w => w.status === 'activa').length;
  }

  get finishedWorksCount(): number {
    return this.works.filter(w => w.status === 'finalizada').length;
  }

  get suspendedWorksCount(): number {
    return this.works.filter(w => w.status === 'suspendida').length;
  }

  get cancelledWorksCount(): number {
    return this.works.filter(w => w.status === 'cancelada').length;
  }

  // Métodos de permisos
  canCreateWork(): boolean {
    return this.permissionService.canCreateWork();
  }

  canEditWork(): boolean {
    return this.permissionService.canEditWork();
  }

  canDeleteWork(): boolean {
    return this.permissionService.canDeleteWork();
  }

  canEditWorkBasicInfo(): boolean {
    return this.permissionService.canEditWorkBasicInfo();
  }

  canEditWorkStatus(): boolean {
    return this.permissionService.canEditWorkStatus();
  }

  canEditWorkDeliveryDate(): boolean {
    return this.permissionService.canEditWorkDeliveryDate();
  }

  constructor(
    private workService: WorkService,
    private permissionService: PermissionService,
    private router: Router,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    addIcons({ add, search, filter, eye, create, trash, business, calendar, people, checkmark, pause, stop, play, location, sync });
  }

  ngOnInit() {
    this.loadWorks();
  }

  loadWorks() {
    this.subscription = this.workService.works$.subscribe(works => {
      this.works = works;
      this.filterWorks();
    });
  }

  filterWorks() {
    let filtered = this.works;

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(work =>
        work.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        work.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        work.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (work.clientName && work.clientName.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Filtrar por segmento
    switch (this.selectedSegment) {
      case 'active':
        filtered = filtered.filter(work => work.status === WorkStatus.ACTIVA);
        break;
      case 'finished':
        filtered = filtered.filter(work => work.status === WorkStatus.FINALIZADA);
        break;
      case 'suspended':
        filtered = filtered.filter(work => work.status === WorkStatus.SUSPENDIDA);
        break;
      case 'cancelled':
        filtered = filtered.filter(work => work.status === WorkStatus.CANCELADA);
        break;
    }

    this.filteredWorks = filtered;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterWorks();
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterWorks();
  }

  onRefresh(event: any) {
    this.loadWorks();
    event.target.complete();
  }

  async addWork() {
    const modal = await this.modalController.create({
      component: WorkFormModalComponent,
      componentProps: {
        isEdit: false
      },
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadWorks();
      }
    });

    await modal.present();
  }

  viewWork(work: Work) {
    this.router.navigate(['/tabs/works/view', work.id]);
  }

  async editWork(work: Work) {
    const modal = await this.modalController.create({
      component: WorkFormModalComponent,
      componentProps: {
        work: work,
        isEdit: true
      },
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadWorks();
      }
    });

    await modal.present();
  }

  async deleteWork(work: Work) {
    const modal = await this.modalController.create({
      component: ConfirmationModalComponent,
      componentProps: {
        title: 'Eliminar Proyecto',
        message: `¿Está seguro de que desea eliminar el proyecto "${work.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        buttonColor: 'danger'
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data === true) {
        this.workService.deleteWork(work.id).subscribe({
          next: () => {
            this.showToast('Proyecto eliminado exitosamente', 'success');
            this.loadWorks();
          },
          error: (error) => {
            this.showToast('Error al eliminar el proyecto', 'danger');
          }
        });
      }
    });

    await modal.present();
  }

  async changeWorkStatus(work: Work) {
    const modal = await this.modalController.create({
      component: WorkStatusModalComponent,
      componentProps: {
        work: work
      },
      breakpoints: [0, 0.6, 0.8],
      initialBreakpoint: 0.6
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.workService.updateWork(work.id, result.data).subscribe({
          next: () => {
            this.showToast('Estado del proyecto actualizado', 'success');
            this.loadWorks();
          },
          error: (error) => {
            this.showToast('Error al actualizar el estado', 'danger');
          }
        });
      }
    });

    await modal.present();
  }

  async openDeliveryDateModal(work: Work) {
    const modal = await this.modalController.create({
      component: WorkDeliveryDateModalComponent,
      componentProps: { work },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8
    });

    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      this.loadWorks();
      await this.showSuccessToast('Fecha de entrega actualizada exitosamente');
    }
  }

  getStatusColor(status: WorkStatus): string {
    switch (status) {
      case WorkStatus.ACTIVA: return 'success';
      case WorkStatus.FINALIZADA: return 'primary';
      case WorkStatus.SUSPENDIDA: return 'warning';
      case WorkStatus.CANCELADA: return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: WorkStatus): string {
    switch (status) {
      case WorkStatus.ACTIVA: return 'Activa';
      case WorkStatus.FINALIZADA: return 'Finalizada';
      case WorkStatus.SUSPENDIDA: return 'Suspendida';
      case WorkStatus.CANCELADA: return 'Cancelada';
      default: return status;
    }
  }

  getStatusIcon(status: WorkStatus): string {
    switch (status) {
      case WorkStatus.ACTIVA: return 'play';
      case WorkStatus.FINALIZADA: return 'checkmark';
      case WorkStatus.SUSPENDIDA: return 'pause';
      case WorkStatus.CANCELADA: return 'stop';
      default: return 'help';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getDaysRemaining(work: Work): number {
    if (!work.estimatedEndDate || work.status !== WorkStatus.ACTIVA) return 0;
    const today = new Date();
    const endDate = new Date(work.estimatedEndDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isOverdue(work: Work): boolean {
    return this.getDaysRemaining(work) < 0 && work.status === WorkStatus.ACTIVA;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  private async showSuccessToast(message: string) {
    await this.showToast(message, 'success');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
