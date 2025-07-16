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
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, checkmark, warning, trash } from 'ionicons/icons';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="confirmation-content">
        <div class="icon-container">
          <ion-icon 
            [name]="getIconName()" 
            [color]="iconColor"
            size="large">
          </ion-icon>
        </div>
        
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        
        <div class="button-group">
          <ion-button 
            expand="block" 
            fill="outline" 
            (click)="dismiss()">
            Cancelar
          </ion-button>
          
          <ion-button 
            expand="block" 
            [color]="buttonColor"
            (click)="confirm()">
            <ion-icon [name]="getActionIcon()" slot="start"></ion-icon>
            {{ confirmText }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .confirmation-content {
      text-align: center;
      padding: 20px;
    }

    .icon-container {
      margin-bottom: 20px;
    }

    h2 {
      color: var(--ion-color-dark);
      margin-bottom: 10px;
    }

    p {
      color: var(--ion-color-medium);
      margin-bottom: 30px;
      line-height: 1.5;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    @media (min-width: 768px) {
      .button-group {
        flex-direction: row;
      }
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
    IonIcon
  ]
})
export class ConfirmationModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = 'Confirmar';
  @Input() buttonColor: string = 'primary';
  @Input() iconColor: string = 'warning';

  constructor(private modalController: ModalController) {
    addIcons({ close, checkmark, warning, trash });
  }

  async dismiss() {
    await this.modalController.dismiss(false);
  }

  async confirm() {
    await this.modalController.dismiss(true);
  }

  getIconName(): string {
    if (this.buttonColor === 'danger') return 'trash';
    return 'warning';
  }

  getActionIcon(): string {
    if (this.buttonColor === 'danger') return 'trash';
    return 'checkmark';
  }
}