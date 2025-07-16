import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonButtons, 
  IonIcon,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonList,
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, checkmark, play, pause, stop } from 'ionicons/icons';
import { Work, WorkStatus } from '../../shared/models';

@Component({
  selector: 'app-work-status-modal',
  standalone: true,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Cambiar Estado del Proyecto</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="status-content">
        <div class="current-status">
          <h3>Estado Actual</h3>
          <div class="status-badge">
            <ion-icon [name]="getStatusIcon(work.status)" [color]="getStatusColor(work.status)"></ion-icon>
            <span>{{ getStatusText(work.status) }}</span>
          </div>
        </div>

        <form [formGroup]="statusForm" (ngSubmit)="confirm()">
          <ion-list>
            <ion-radio-group formControlName="status">
              <ion-item>
                <ion-radio slot="start" value="activa"></ion-radio>
                <ion-label>
                  <div class="status-option">
                    <ion-icon name="play" color="success"></ion-icon>
                    <span>Activa</span>
                  </div>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-radio slot="start" value="finalizada"></ion-radio>
                <ion-label>
                  <div class="status-option">
                    <ion-icon name="checkmark" color="primary"></ion-icon>
                    <span>Finalizada</span>
                  </div>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-radio slot="start" value="suspendida"></ion-radio>
                <ion-label>
                  <div class="status-option">
                    <ion-icon name="pause" color="warning"></ion-icon>
                    <span>Suspendida</span>
                  </div>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-radio slot="start" value="cancelada"></ion-radio>
                <ion-label>
                  <div class="status-option">
                    <ion-icon name="stop" color="danger"></ion-icon>
                    <span>Cancelada</span>
                  </div>
                </ion-label>
              </ion-item>
            </ion-radio-group>
          </ion-list>

          <div class="button-group">
            <ion-button 
              expand="block" 
              fill="outline" 
              type="button"
              (click)="dismiss()">
              Cancelar
            </ion-button>
            
            <ion-button 
              expand="block" 
              color="primary"
              type="submit"
              [disabled]="!canSave()">
              <ion-icon name="checkmark" slot="start"></ion-icon>
              Cambiar Estado
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .status-content {
      padding: 20px 0;
    }

    .current-status {
      text-align: center;
      margin-bottom: 30px;
    }

    .current-status h3 {
      color: var(--ion-color-dark);
      margin-bottom: 15px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      background: var(--ion-color-light);
      border-radius: 20px;
      font-weight: 500;
    }

    .status-option {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 30px;
      padding: 0 20px;
    }

    @media (min-width: 768px) {
      .button-group {
        flex-direction: row;
      }
    }

    ion-radio {
      margin-right: 16px;
    }

    ion-item {
      --padding-start: 16px;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    IonList
  ]
})
export class WorkStatusModalComponent implements OnInit {
  @Input() work!: Work;
  statusForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder
  ) {
    addIcons({ close, checkmark, play, pause, stop });
    
    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.statusForm.patchValue({
      status: this.work.status
    });
  }

  async dismiss() {
    await this.modalController.dismiss(null);
  }

  async confirm() {
    if (this.canSave()) {
      const newStatus = this.statusForm.get('status')?.value;
      const updates: Partial<Work> = {
        status: newStatus
      };

      // Si se marca como finalizada y no tiene fecha de fin, agregarla
      if (newStatus === WorkStatus.FINALIZADA && !this.work.endDate) {
        updates.endDate = new Date();
      }

      await this.modalController.dismiss(updates);
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

  hasStatusChanged(): boolean {
    const selectedStatus = this.statusForm.get('status')?.value;
    return selectedStatus && selectedStatus !== this.work.status;
  }

  canSave(): boolean {
    const selectedStatus = this.statusForm.get('status')?.value;
    return !!(selectedStatus && this.statusForm.valid && selectedStatus !== this.work.status);
  }
}
