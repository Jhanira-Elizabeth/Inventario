import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonList,
  IonToggle,
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, checkmark, checkmarkCircle, closeCircle, business } from 'ionicons/icons';
import { Supplier } from '../../shared/models';

@Component({
  selector: 'app-supplier-status-modal',
  standalone: true,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Cambiar Estado del Proveedor</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="status-content">
        <div class="supplier-info">
          <div class="supplier-header">
            <ion-icon name="business" color="primary" size="large"></ion-icon>
            <div class="supplier-details">
              <h2>{{ supplier.name }}</h2>
              <p *ngIf="supplier.contactPerson">{{ supplier.contactPerson }}</p>
              <p *ngIf="supplier.city">{{ supplier.city }}</p>
            </div>
          </div>

          <div class="current-status">
            <h3>Estado Actual</h3>
            <div class="status-badge" [class.active]="supplier.isActive" [class.inactive]="!supplier.isActive">
              <ion-icon 
                [name]="supplier.isActive ? 'checkmarkCircle' : 'closeCircle'" 
                [color]="supplier.isActive ? 'success' : 'medium'">
              </ion-icon>
              <span>{{ supplier.isActive ? 'Activo' : 'Inactivo' }}</span>
            </div>
          </div>
        </div>

        <div class="status-toggle-section">
          <ion-list>
            <ion-item>
              <ion-label>
                <h3>{{ supplier.isActive ? 'Desactivar Proveedor' : 'Activar Proveedor' }}</h3>
                <p>
                  {{ supplier.isActive 
                     ? 'El proveedor no aparecerá en las listas activas y no se podrá asignar a nuevos materiales.' 
                     : 'El proveedor estará disponible para asignar a materiales y aparecerá en las listas activas.' 
                  }}
                </p>
              </ion-label>
              <ion-toggle 
                [checked]="!supplier.isActive"
                (ionChange)="onToggleChange($event)"
                [color]="!supplier.isActive ? 'success' : 'medium'"
                slot="end">
              </ion-toggle>
            </ion-item>
          </ion-list>
        </div>

        <div class="button-group">
          <ion-button 
            expand="block" 
            fill="outline" 
            (click)="dismiss()">
            Cancelar
          </ion-button>
          
          <ion-button 
            expand="block" 
            [color]="newStatus ? 'success' : 'medium'"
            [disabled]="newStatus === supplier.isActive"
            (click)="confirm()">
            <ion-icon [name]="newStatus ? 'checkmarkCircle' : 'closeCircle'" slot="start"></ion-icon>
            {{ newStatus ? 'Activar' : 'Desactivar' }} Proveedor
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .status-content {
      padding: 20px 0;
    }

    .supplier-info {
      margin-bottom: 30px;
    }

    .supplier-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: var(--ion-color-light);
      border-radius: 12px;
    }

    .supplier-details h2 {
      margin: 0 0 4px 0;
      color: var(--ion-color-dark);
      font-size: 1.2rem;
    }

    .supplier-details p {
      margin: 2px 0;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    .current-status {
      text-align: center;
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
      border-radius: 20px;
      font-weight: 500;
      margin: 0 auto;
      max-width: fit-content;
    }

    .status-badge.active {
      background: var(--ion-color-success-tint);
      color: var(--ion-color-success-contrast);
    }

    .status-badge.inactive {
      background: var(--ion-color-light);
      color: var(--ion-color-medium);
    }

    .status-toggle-section {
      margin: 30px 0;
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

    ion-toggle {
      transform: scale(1.2);
    }

    ion-item {
      --padding-start: 16px;
      --inner-padding-end: 16px;
    }
  `],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonToggle
  ]
})
export class SupplierStatusModalComponent implements OnInit {
  @Input() supplier!: Supplier;
  newStatus: boolean;

  constructor(private modalController: ModalController) {
    addIcons({ close, checkmark, checkmarkCircle, closeCircle, business });
    this.newStatus = false;
  }

  ngOnInit() {
    this.newStatus = this.supplier.isActive;
  }

  onToggleChange(event: any) {
    this.newStatus = !event.detail.checked;
  }

  async dismiss() {
    await this.modalController.dismiss(null);
  }

  async confirm() {
    if (this.newStatus !== this.supplier.isActive) {
      await this.modalController.dismiss({ shouldToggle: true });
    }
  }
}
