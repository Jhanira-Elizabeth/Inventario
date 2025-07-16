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
  IonInput,
  IonTextarea,
  IonToggle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  ModalController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, business, person, mail, call, location, card, text } from 'ionicons/icons';
import { Supplier } from '../../shared/models';
import { SupplierService } from '../../shared/services';

@Component({
  selector: 'app-supplier-form-modal',
  standalone: true,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="business" color="primary"></ion-icon>
              Información Básica
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12">
                  <ion-item fill="outline">
                    <ion-label position="floating">Nombre de la Empresa *</ion-label>
                    <ion-input 
                      formControlName="name" 
                      placeholder="Nombre del proveedor"
                      [class.ion-invalid]="supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched">
                      <ion-icon name="business" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched">
                    <small>El nombre del proveedor es requerido</small>
                  </div>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">RUC</ion-label>
                    <ion-input 
                      formControlName="ruc" 
                      placeholder="1234567890001"
                      maxlength="13">
                      <ion-icon name="card" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Ciudad</ion-label>
                    <ion-input 
                      formControlName="city" 
                      placeholder="Ciudad del proveedor">
                      <ion-icon name="location" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="12">
                  <ion-item fill="outline">
                    <ion-label position="floating">Dirección</ion-label>
                    <ion-input 
                      formControlName="address" 
                      placeholder="Dirección completa del proveedor">
                      <ion-icon name="location" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="person" color="primary"></ion-icon>
              Información de Contacto
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12">
                  <ion-item fill="outline">
                    <ion-label position="floating">Persona de Contacto</ion-label>
                    <ion-input 
                      formControlName="contactPerson" 
                      placeholder="Nombre del contacto principal">
                      <ion-icon name="person" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Email</ion-label>
                    <ion-input 
                      formControlName="email" 
                      type="email"
                      placeholder="email@empresa.com"
                      [class.ion-invalid]="supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched">
                      <ion-icon name="mail" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched">
                    <small>Ingrese un email válido</small>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Teléfono</ion-label>
                    <ion-input 
                      formControlName="phone" 
                      type="tel"
                      placeholder="03-1234567">
                      <ion-icon name="call" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="text" color="primary"></ion-icon>
              Información Adicional
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12">
                  <ion-item fill="outline">
                    <ion-label position="floating">Notas</ion-label>
                    <ion-textarea 
                      formControlName="notes" 
                      placeholder="Notas adicionales sobre el proveedor"
                      rows="3">
                    </ion-textarea>
                  </ion-item>
                </ion-col>
              </ion-row>

              <ion-row *ngIf="isEdit">
                <ion-col size="12">
                  <ion-item>
                    <ion-label>
                      <h3>Estado del Proveedor</h3>
                      <p>{{ supplierForm.get('isActive')?.value ? 'Activo' : 'Inactivo' }}</p>
                    </ion-label>
                    <ion-toggle 
                      formControlName="isActive" 
                      slot="end"
                      [color]="supplierForm.get('isActive')?.value ? 'success' : 'medium'">
                    </ion-toggle>
                  </ion-item>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

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
            [disabled]="!supplierForm.valid">
            <ion-icon name="save" slot="start"></ion-icon>
            {{ isEdit ? 'Actualizar' : 'Crear' }} Proveedor
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin-bottom: 20px;
    }

    ion-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
    }

    .error-message {
      color: var(--ion-color-danger);
      padding: 5px 16px 0;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
    }

    @media (min-width: 768px) {
      .button-group {
        flex-direction: row;
      }
    }

    ion-item {
      margin-bottom: 16px;
    }

    ion-toggle {
      transform: scale(1.2);
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
    IonInput,
    IonTextarea,
    IonToggle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class SupplierFormModalComponent implements OnInit {
  @Input() supplier?: Supplier;
  @Input() isEdit: boolean = false;

  supplierForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private supplierService: SupplierService,
    private fb: FormBuilder
  ) {
    addIcons({ close, save, business, person, mail, call, location, card, text });
    
    this.supplierForm = this.createForm();
  }

  ngOnInit() {
    if (this.isEdit && this.supplier) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      ruc: [''],
      city: [''],
      address: [''],
      contactPerson: [''],
      email: ['', [Validators.email]],
      phone: [''],
      notes: [''],
      isActive: [true]
    });
  }

  populateForm() {
    if (this.supplier) {
      this.supplierForm.patchValue({
        name: this.supplier.name,
        ruc: this.supplier.ruc || '',
        city: this.supplier.city || '',
        address: this.supplier.address || '',
        contactPerson: this.supplier.contactPerson || '',
        email: this.supplier.email || '',
        phone: this.supplier.phone || '',
        notes: this.supplier.notes || '',
        isActive: this.supplier.isActive
      });
    }
  }

  async onSubmit() {
    if (this.supplierForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEdit ? 'Actualizando proveedor...' : 'Creando proveedor...'
      });
      await loading.present();

      try {
        const formValue = this.supplierForm.value;
        
        if (this.isEdit && this.supplier) {
          const updates = {
            id: this.supplier.id,
            ...formValue,
            updatedAt: new Date()
          };
          
          const updatedSupplier = await this.supplierService.updateSupplier(updates).toPromise();
          await this.modalController.dismiss(updatedSupplier);
        } else {
          const newSupplier = {
            ...formValue
          };
          
          const createdSupplier = await this.supplierService.createSupplier(newSupplier).toPromise();
          await this.modalController.dismiss(createdSupplier);
        }
        
        await this.showToast(
          this.isEdit ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente',
          'success'
        );
      } catch (error) {
        console.error('Error al procesar proveedor:', error);
        await this.showToast('Error al procesar el proveedor', 'danger');
      } finally {
        await loading.dismiss();
      }
    }
  }

  async dismiss() {
    await this.modalController.dismiss(null);
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
