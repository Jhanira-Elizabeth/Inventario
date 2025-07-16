import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  IonTextarea, 
  IonSelect, 
  IonSelectOption, 
  IonCheckbox,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
  LoadingController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, close, arrowBack } from 'ionicons/icons';
import { Material } from '../../shared/models';
import { MaterialService } from '../../shared/services';

@Component({
  selector: 'app-material-form',
  templateUrl: './material-form.page.html',
  styleUrls: ['./material-form.page.scss'],
  imports: [
    CommonModule,
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
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class MaterialFormPage implements OnInit {
  @Input() isEditMode = false;
  @Input() material: Material | null = null;
  
  materialForm: FormGroup;
  materialId: string | null = null;
  pageTitle = 'Nuevo Material';

  categories = [
    'Cableado',
    'Equipos',
    'Conectores',
    'Herramientas',
    'Accesorios',
    'Consumibles',
    'Otros'
  ];

  units = [
    'unidades',
    'metros',
    'paquetes',
    'cajas',
    'rollos',
    'kilogramos',
    'litros'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private materialService: MaterialService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    addIcons({ save, close, arrowBack });
    
    this.materialForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      unit: ['unidades', [Validators.required]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minimumStock: [0, [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required]],
      category: ['', [Validators.required]],
      price: [0, [Validators.min(0)]],
      supplier: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    // Si se pasa material como input (modal), configurar el formulario
    if (this.material) {
      this.isEditMode = true;
      this.materialId = this.material.id;
      this.pageTitle = 'Editar Material';
      this.loadMaterialData(this.material);
    } else {
      // Comportamiento original para navegación de rutas
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode = true;
        this.materialId = id;
        this.pageTitle = 'Editar Material';
        this.loadMaterial(id);
      }
    }
  }

  private loadMaterialData(material: Material) {
    this.materialForm.patchValue({
      code: material.code,
      name: material.name,
      description: material.description,
      unit: material.unit,
      category: material.category,
      currentStock: material.currentStock,
      minimumStock: material.minimumStock,
      location: material.location,
      price: material.price || 0,
      supplier: material.supplier || '',
      isActive: material.isActive
    });
  }

  async loadMaterial(id: string) {
    const loading = await this.loadingController.create({
      message: 'Cargando material...'
    });
    await loading.present();

    this.materialService.getMaterialById(id).subscribe({
      next: (material) => {
        loading.dismiss();
        if (material) {
          this.materialForm.patchValue({
            code: material.code,
            name: material.name,
            description: material.description,
            unit: material.unit,
            currentStock: material.currentStock,
            minimumStock: material.minimumStock,
            location: material.location,
            category: material.category,
            price: material.price || 0,
            supplier: material.supplier || '',
            isActive: material.isActive
          });
        } else {
          this.showToast('Material no encontrado', 'danger');
          this.router.navigate(['/tabs/materials']);
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Error al cargar el material', 'danger');
        this.router.navigate(['/tabs/materials']);
      }
    });
  }

  async onSubmit() {
    if (this.materialForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Actualizando material...' : 'Creando material...'
      });
      await loading.present();

      const formValue = this.materialForm.value;
      
      if (this.isEditMode && this.materialId) {
        console.log('Actualizando material ID:', this.materialId, 'con datos:', formValue);
        this.materialService.updateMaterial(this.materialId, formValue).subscribe({
          next: (material) => {
            loading.dismiss();
            console.log('Material actualizado exitosamente:', material);
            this.showToast('Material actualizado exitosamente', 'success');
            this.handleSuccess(material);
          },
          error: (error) => {
            loading.dismiss();
            this.showToast('Error al actualizar el material', 'danger');
            console.error('Error actualizando material:', error);
          }
        });
      } else {
        this.materialService.addMaterial(formValue).subscribe({
          next: (material) => {
            loading.dismiss();
            this.showToast('Material creado exitosamente', 'success');
            this.handleSuccess(material);
          },
          error: (error) => {
            loading.dismiss();
            this.showToast('Error al crear el material', 'danger');
            console.error('Error creando material:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.showToast('Por favor complete todos los campos requeridos', 'warning');
    }
  }

  private async handleSuccess(material: any) {
    try {
      console.log('Iniciando handleSuccess con material:', material);
      console.log('Cerrando modal después de éxito...');
      
      // Obtener el modal más reciente
      const modal = await this.modalController.getTop();
      if (modal) {
        console.log('Modal encontrado, cerrando con datos de refresh...');
        await modal.dismiss({
          material: material,
          refresh: true
        });
        console.log('Modal cerrado exitosamente');
      } else {
        console.log('No se encontró modal, usando navegación fallback...');
        // Fallback: usar navegación
        this.router.navigate(['/tabs/materials']);
      }
      
    } catch (error) {
      console.error('Error al cerrar modal:', error);
      // Fallback: usar navegación
      this.router.navigate(['/tabs/materials']);
    }
  }

  async dismissModal(material?: any) {
    try {
      // Obtener el modal más reciente
      const modal = await this.modalController.getTop();
      if (modal) {
        await modal.dismiss({
          material: material
        });
      } else {
        // Fallback: usar navegación
        this.router.navigate(['/tabs/materials']);
      }
    } catch (error) {
      console.error('Error al cerrar modal:', error);
      // Fallback: usar navegación normal
      this.router.navigate(['/tabs/materials']);
    }
  }

  markFormGroupTouched() {
    Object.keys(this.materialForm.controls).forEach(key => {
      const control = this.materialForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.materialForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.materialForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  async cancel() {
    try {
      console.log('Cancelando modal...');
      
      // Obtener el modal más reciente
      const modal = await this.modalController.getTop();
      if (modal) {
        await modal.dismiss();
      } else {
        // Fallback: usar navegación
        this.router.navigate(['/tabs/materials']);
      }
      
    } catch (error) {
      console.error('Error al cancelar:', error);
      // Fallback: usar navegación
      this.router.navigate(['/tabs/materials']);
    }
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
