import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonButtons, 
  IonIcon, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonList,
  LoadingController,
  ToastController,
  AlertController,
  IonBackButton,
  IonFab,
  IonFabButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { create, trash, play, pause, checkmark, stop, calendar, location, business, people, pricetag } from 'ionicons/icons';
import { Work, WorkStatus } from '../../shared/models';
import { WorkService } from '../../shared/services';

@Component({
  selector: 'app-work-detail',
  templateUrl: './work-detail.page.html',
  styleUrls: ['./work-detail.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonBackButton,
    IonFab,
    IonFabButton,
    IonSpinner
  ]
})
export class WorkDetailPage implements OnInit {
  work: Work | null = null;
  workId: string | null = null;

  constructor(
    private workService: WorkService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ create, trash, play, pause, checkmark, stop, calendar, location, business, people, pricetag });
  }

  ngOnInit() {
    this.workId = this.route.snapshot.paramMap.get('id');
    if (this.workId) {
      this.loadWork(this.workId);
    }
  }

  async loadWork(id: string) {
    const loading = await this.loadingController.create({
      message: 'Cargando proyecto...'
    });
    await loading.present();

    this.workService.getWorkById(id).subscribe({
      next: (work) => {
        loading.dismiss();
        if (work) {
          this.work = work;
        } else {
          this.showToast('Proyecto no encontrado', 'danger');
          this.router.navigate(['/works']);
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Error al cargar el proyecto', 'danger');
        this.router.navigate(['/works']);
      }
    });
  }

  async deleteWork() {
    if (!this.work) return;

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar el proyecto "${this.work.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (this.workId) {
              this.workService.deleteWork(this.workId).subscribe({
                next: () => {
                  this.showToast('Proyecto eliminado exitosamente', 'success');
                  this.router.navigate(['/works']);
                },
                error: (error) => {
                  this.showToast('Error al eliminar el proyecto', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async changeWorkStatus() {
    if (!this.work) return;

    const alert = await this.alertController.create({
      header: 'Cambiar estado del proyecto',
      message: `Estado actual: ${this.getStatusText(this.work.status)}`,
      inputs: [
        {
          name: 'status',
          type: 'radio',
          label: 'Activa',
          value: WorkStatus.ACTIVA,
          checked: this.work.status === WorkStatus.ACTIVA
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Finalizada',
          value: WorkStatus.FINALIZADA,
          checked: this.work.status === WorkStatus.FINALIZADA
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Suspendida',
          value: WorkStatus.SUSPENDIDA,
          checked: this.work.status === WorkStatus.SUSPENDIDA
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Cancelada',
          value: WorkStatus.CANCELADA,
          checked: this.work.status === WorkStatus.CANCELADA
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cambiar',
          handler: (data) => {
            if (data && data !== this.work?.status && this.workId) {
              const updates: Partial<Work> = {
                status: data
              };

              if (data === WorkStatus.FINALIZADA && !this.work?.endDate) {
                updates.endDate = new Date();
              }

              this.workService.updateWork(this.workId, updates).subscribe({
                next: () => {
                  this.showToast('Estado del proyecto actualizado', 'success');
                  this.loadWork(this.workId!);
                },
                error: (error) => {
                  this.showToast('Error al actualizar el estado', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getDaysRemaining(): number {
    if (!this.work?.estimatedEndDate || this.work?.status !== WorkStatus.ACTIVA) return 0;
    const today = new Date();
    const endDate = new Date(this.work.estimatedEndDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isOverdue(): boolean {
    return this.getDaysRemaining() < 0 && this.work?.status === WorkStatus.ACTIVA;
  }

  getDurationInDays(): number {
    if (!this.work) return 0;
    const startDate = new Date(this.work.startDate);
    const endDate = this.work.endDate ? new Date(this.work.endDate) : new Date();
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
}
