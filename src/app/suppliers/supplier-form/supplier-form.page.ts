import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToggle,
  IonIcon,
  IonNote,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, person, mail, call, location, business, document, checkmark, close } from 'ionicons/icons';
import { SupplierService } from '../../shared/services/supplier.service';
import { Supplier, SupplierCreate, SupplierUpdate } from '../../shared/models/supplier.model';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.page.html',
  styleUrls: ['./supplier-form.page.scss'],
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
    IonBackButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonToggle,
    IonIcon,
    IonNote
  ]
})
export class SupplierFormPage implements OnInit {
  supplierForm: FormGroup;
  isEditMode = false;
  supplierId: string | null = null;
  currentSupplier: Supplier | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private supplierService: SupplierService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, person, mail, call, location, business, document, checkmark, close });
    
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      contactPerson: [''],
      ruc: [''],
      city: [''],
      notes: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.supplierId;
    
    if (this.isEditMode && this.supplierId) {
      this.loadSupplier();
    }
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear';
  }

  async loadSupplier() {
    if (!this.supplierId) return;

    this.isLoading = true;
    try {
      this.supplierService.getSupplierById(this.supplierId).subscribe({
        next: (supplier) => {
          this.currentSupplier = supplier;
          if (this.currentSupplier) {
            this.supplierForm.patchValue({
              name: this.currentSupplier.name,
              email: this.currentSupplier.email || '',
              phone: this.currentSupplier.phone || '',
              address: this.currentSupplier.address || '',
              contactPerson: this.currentSupplier.contactPerson || '',
              ruc: this.currentSupplier.ruc || '',
              city: this.currentSupplier.city || '',
              notes: this.currentSupplier.notes || '',
              isActive: this.currentSupplier.isActive
            });
          }
          this.isLoading = false;
        },
        error: async (error) => {
          console.error('Error loading supplier:', error);
          await this.showErrorAlert('Error al cargar el proveedor');
          this.router.navigate(['/tabs/suppliers']);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error loading supplier:', error);
      await this.showErrorAlert('Error al cargar el proveedor');
      this.router.navigate(['/tabs/suppliers']);
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.supplierForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Actualizando proveedor...' : 'Creando proveedor...'
      });
      await loading.present();

      try {
        const formValue = this.supplierForm.value;
        
        if (this.isEditMode && this.supplierId) {
          const updateData: SupplierUpdate = {
            id: this.supplierId,
            ...formValue
          };
          
          this.supplierService.updateSupplier(updateData).subscribe({
            next: async (updatedSupplier) => {
              await this.showSuccessToast('Proveedor actualizado exitosamente');
              await loading.dismiss();
              this.router.navigate(['/tabs/suppliers']);
            },
            error: async (error) => {
              console.error('Error updating supplier:', error);
              await loading.dismiss();
              await this.showErrorAlert('Error al actualizar el proveedor');
            }
          });
        } else {
          const createData: SupplierCreate = {
            name: formValue.name,
            email: formValue.email || undefined,
            phone: formValue.phone || undefined,
            address: formValue.address || undefined,
            contactPerson: formValue.contactPerson || undefined,
            ruc: formValue.ruc || undefined,
            city: formValue.city || undefined,
            notes: formValue.notes || undefined
          };
          
          this.supplierService.createSupplier(createData).subscribe({
            next: async (createdSupplier) => {
              await this.showSuccessToast('Proveedor creado exitosamente');
              await loading.dismiss();
              this.router.navigate(['/tabs/suppliers']);
            },
            error: async (error) => {
              console.error('Error creating supplier:', error);
              await loading.dismiss();
              await this.showErrorAlert('Error al crear el proveedor');
            }
          });
        }
      } catch (error) {
        console.error('Error saving supplier:', error);
        await loading.dismiss();
        await this.showErrorAlert('Error al guardar el proveedor');
      }
    } else {
      await this.showErrorAlert('Por favor, completa todos los campos requeridos');
      this.markFormGroupTouched();
    }
  }

  async onCancel() {
    if (this.supplierForm.dirty) {
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Salir',
            handler: () => {
              this.router.navigate(['/tabs/suppliers']);
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.router.navigate(['/tabs/suppliers']);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.supplierForm.controls).forEach(key => {
      const control = this.supplierForm.get(key);
      control?.markAsTouched();
    });
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

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.supplierForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.supplierForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
    }
    return '';
  }
}
