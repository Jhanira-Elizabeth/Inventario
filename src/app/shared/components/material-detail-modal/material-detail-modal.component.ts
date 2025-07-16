import { Component, Input } from '@angular/core';
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
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, create, cube } from 'ionicons/icons';
import { Material } from '../../models';

@Component({
  selector: 'app-material-detail-modal',
  standalone: true,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>📋 Detalle del Material</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ material.name }}</ion-card-title>
        </ion-card-header>
        
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-md="6">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Código</h3>
                    <p>{{ material.code }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
              
              <ion-col size="12" size-md="6">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Categoría</h3>
                    <p>{{ material.category }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
            
            <ion-row>
              <ion-col size="12">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Descripción</h3>
                    <p>{{ material.description }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
            
            <ion-row>
              <ion-col size="12" size-md="6">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Ubicación</h3>
                    <p>{{ material.location }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
              
              <ion-col size="12" size-md="6">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Unidad</h3>
                    <p>{{ material.unit }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
            
            <ion-row>
              <ion-col size="12" size-md="6">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Precio</h3>
                    <p>\${{ (material.price || 0).toFixed(2) }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
              
              <ion-col size="12" size-md="6">
                <ion-item lines="none">
                  <ion-label>
                    <h3>Estado</h3>
                    <ion-badge [color]="material.isActive ? 'success' : 'medium'">
                      {{ material.isActive ? 'Activo' : 'Inactivo' }}
                    </ion-badge>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
          
          <!-- Stock Info -->
          <ion-card style="margin: 16px 0;">
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="cube" style="margin-right: 8px;"></ion-icon>
                Información de Stock
              </ion-card-title>
            </ion-card-header>
            
            <ion-card-content>
              <ion-grid>
                <ion-row>
                  <ion-col size="6">
                    <ion-item lines="none">
                      <ion-label>
                        <h3>Stock Actual</h3>
                        <ion-badge [color]="getStockBadgeColor()">
                          {{ material.currentStock }} {{ material.unit }}
                        </ion-badge>
                      </ion-label>
                    </ion-item>
                  </ion-col>
                  
                  <ion-col size="6">
                    <ion-item lines="none">
                      <ion-label>
                        <h3>Stock Mínimo</h3>
                        <p>{{ material.minimumStock }} {{ material.unit }}</p>
                      </ion-label>
                    </ion-item>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>
          
          <div style="margin-top: 20px;">
            <ion-button 
              expand="block" 
              (click)="editMaterial()"
              color="primary">
              <ion-icon name="create" slot="start"></ion-icon>
              Editar Material
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
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
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class MaterialDetailModalComponent {
  @Input() material!: Material;

  constructor(private modalController: ModalController) {
    addIcons({ close, create, cube });
  }

  async dismiss() {
    await this.modalController.dismiss();
  }

  async editMaterial() {
    await this.modalController.dismiss({ action: 'edit' });
  }

  getStockBadgeColor(): string {
    if (this.material.currentStock === 0) return 'danger';
    if (this.material.currentStock <= this.material.minimumStock) return 'warning';
    return 'success';
  }
}