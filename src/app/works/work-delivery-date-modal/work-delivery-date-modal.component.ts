import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonButtons, 
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, checkmark, calendar } from 'ionicons/icons';
import { Work } from '../../shared/models/work.model';
import { WorkService } from '../../shared/services/work.service';

@Component({
  selector: 'app-work-delivery-date-modal',
  templateUrl: './work-delivery-date-modal.component.html',
  styleUrls: ['./work-delivery-date-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonNote
  ]
})
export class WorkDeliveryDateModalComponent implements OnInit {
  @Input() work!: Work;
  
  deliveryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private workService: WorkService,
    private toastController: ToastController
  ) {
    addIcons({ close, checkmark, calendar });
    
    this.deliveryForm = this.fb.group({
      actualDeliveryDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.work) {
      this.deliveryForm.patchValue({
        actualDeliveryDate: this.work.actualDeliveryDate ? 
          new Date(this.work.actualDeliveryDate).toISOString().split('T')[0] : ''
      });
    }
  }

  async updateDeliveryDate() {
    if (this.deliveryForm.valid) {
      try {
        const formValue = this.deliveryForm.value;
        const actualDeliveryDate = new Date(formValue.actualDeliveryDate);

        await this.workService.updateWork(this.work.id, {
          actualDeliveryDate: actualDeliveryDate
        }).toPromise();

        await this.showSuccessToast('Fecha de entrega actualizada exitosamente');
        this.modalController.dismiss({ updated: true });
      } catch (error) {
        console.error('Error updating delivery date:', error);
        await this.showErrorToast('Error al actualizar la fecha de entrega');
      }
    } else {
      await this.showErrorToast('Por favor, selecciona una fecha válida');
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.deliveryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.deliveryForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
    }
    return '';
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: 'close'
    });
    await toast.present();
  }
}
