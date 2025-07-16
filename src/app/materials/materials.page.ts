import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  IonModal,
  IonInput,
  IonTextarea,
  IonNote,
  AlertController,
  ToastController,
  LoadingController,
  ModalController,
  IonSegment,
  IonSegmentButton,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, search, filter, eye, create, trash, cube, warning, checkmark, swapVertical, trendingUp, trendingDown, close, closeCircle, checkmarkCircle } from 'ionicons/icons';
import { Material } from '../shared/models';
import { MaterialService, MovementService, PermissionService } from '../shared/services';
import { MaterialFormPage } from './material-form/material-form.page'; 
import { MaterialDetailModalComponent } from '../shared/components/material-detail-modal/material-detail-modal.component';
import { ConfirmationModalComponent } from '../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.page.html',
  styleUrls: ['./materials.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    IonModal,
    IonInput,
    IonTextarea,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonChip
  ]
})
export class MaterialsPage implements OnInit {
  isSubmittingStockAdjustment = false;
  materials: Material[] = [];
  filteredMaterials: Material[] = [];
  searchTerm: string = '';
  selectedSegment: string = 'all';
  
  // Formulario para ajuste de stock
  stockAdjustmentForm: FormGroup;
  isStockModalOpen = false;
  selectedMaterial: Material | null = null;
  adjustmentType: 'ingreso' | 'salida' = 'ingreso';

  // Métodos de permisos
  canCreateMaterial(): boolean {
    return this.permissionService.canCreateMaterial();
  }

  canEditMaterial(): boolean {
    return this.permissionService.canEditMaterial();
  }

  canDeleteMaterial(): boolean {
    return this.permissionService.canDeleteMaterial();
  }

  canViewMaterialDetails(): boolean {
    return this.permissionService.canViewMaterialDetails();
  }

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private movementService: MovementService,
    private permissionService: PermissionService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    addIcons({ add, search, filter, eye, create, trash, cube, warning, checkmark, swapVertical, trendingUp, trendingDown, close, closeCircle, checkmarkCircle });
    
    this.stockAdjustmentForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadMaterials();
  }

  loadMaterials() {
    console.log('Cargando lista de materiales...');
    this.materialService.getMaterials().subscribe(materials => {
      console.log('Materiales cargados:', materials.length);
      this.materials = materials;
      this.filterMaterials();
      console.log('Materiales filtrados aplicados');
    });
  }

  filterMaterials() {
    let filtered = this.materials;

    if (this.searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        material.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    switch (this.selectedSegment) {
      case 'low-stock':
        filtered = filtered.filter(material => material.currentStock <= material.minimumStock);
        break;
      case 'active':
        filtered = filtered.filter(material => material.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(material => !material.isActive);
        break;
    }

    this.filteredMaterials = filtered;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterMaterials();
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterMaterials();
  }

  onRefresh(event: any) {
    this.loadMaterials();
    event.target.complete();
  }

  // Getters para estadísticas
  get totalMaterials(): number {
    return this.materials.length;
  }

  get lowStockMaterials(): number {
    return this.materials.filter(material => material.currentStock <= material.minimumStock).length;
  }

  get lowStockCount(): number {
    return this.lowStockMaterials;
  }

  get activeMaterials(): number {
    return this.materials.filter(material => material.isActive).length;
  }

  get activeMaterialsCount(): number {
    return this.activeMaterials;
  }

  get inactiveMaterials(): number {
    return this.materials.filter(material => !material.isActive).length;
  }

  get inactiveMaterialsCount(): number {
    return this.inactiveMaterials;
  }

  // Getters para el modal de ajuste de stock
  get modalTitle(): string {
    return this.adjustmentType === 'ingreso' ? 'Ingreso de Stock' : 'Salida de Stock';
  }

  get submitButtonText(): string {
    return this.adjustmentType === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Salida';
  }

  get adjustmentIcon(): string {
    return this.adjustmentType === 'ingreso' ? 'trending-up' : 'trending-down';
  }

  get adjustmentColor(): string {
    return this.adjustmentType === 'ingreso' ? 'success' : 'warning';
  }

  // Métodos de CRUD con Alerts
 async addMaterial() {
    console.log('Abriendo modal para nuevo material...');
    
    const modal = await this.modalController.create({
      component: MaterialFormPage,
      componentProps: {
        material: null,
        isEditMode: false
      },
      backdropDismiss: false,
      cssClass: 'material-form-modal'
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data?.refresh) {
      this.loadMaterials();
    }
  }

  // Reemplazar todo el método editMaterial() actual con este:
  async editMaterial(material: Material) {
    console.log('Editando material:', material.name, 'con estado actual:', material.isActive);
    
    // Obtener la versión más actualizada del material desde el servicio
    this.materialService.getMaterialById(material.id).subscribe(async (updatedMaterial) => {
      if (!updatedMaterial) {
        console.error('Material no encontrado para edición');
        return;
      }
      
      console.log('Material actualizado obtenido para edición:', updatedMaterial.name, 'estado:', updatedMaterial.isActive);
      
      const modal = await this.modalController.create({
        component: MaterialFormPage,
        componentProps: {
          material: updatedMaterial, // Usar la versión actualizada
          isEditMode: true
        },
        backdropDismiss: false,
        cssClass: 'material-form-modal'
      });

      await modal.present();
      
      const { data } = await modal.onDidDismiss();
      console.log('Modal cerrado con datos:', data);
      if (data?.refresh) {
        console.log('Refrescando lista de materiales...');
        await this.loadMaterials();
        console.log('Lista de materiales refrescada');
      }
    });
  }

  async viewMaterial(material: Material) {
  const modal = await this.modalController.create({
    component: MaterialDetailModalComponent,
    componentProps: {
      material: material
    },
    cssClass: 'material-detail-modal',
    backdropDismiss: true
  });

  await modal.present();
  
  const { data } = await modal.onDidDismiss();
  if (data?.action === 'edit') {
    this.editMaterial(material);
  }
}

  // Otros métodos
  async deleteMaterial(material: Material) {
  const modal = await this.modalController.create({
    component: ConfirmationModalComponent,
    componentProps: {
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar "${material.name}"?`,
      confirmText: 'Eliminar',
      buttonColor: 'danger',
      iconColor: 'danger'
    },
    cssClass: 'confirmation-modal',
    backdropDismiss: false
  });

  await modal.present();
  
  const { data } = await modal.onDidDismiss();
  if (data === true) {
    await this.performDelete(material);
  }
}

private async performDelete(material: Material) {
  const loading = await this.loadingController.create({
    message: 'Eliminando material...'
  });
  await loading.present();

  this.materialService.deleteMaterial(material.id).subscribe({
    next: () => {
      loading.dismiss();
      this.showToast('Material eliminado exitosamente', 'success');
      this.loadMaterials();
    },
    error: (error) => {
      loading.dismiss();
      this.showToast('Error al eliminar el material', 'danger');
    }
  });
}

  async toggleMaterialStatus(material: Material) {
  const action = material.isActive ? 'desactivar' : 'activar';
  const actionTitle = action.charAt(0).toUpperCase() + action.slice(1);
  
  const alert = await this.alertController.create({
    header: `${actionTitle} Material`,
    message: `¿Estás seguro de que quieres ${action} "${material.name}"?`,
    cssClass: 'confirmation-alert',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'alert-button-cancel'
      },
      {
        text: actionTitle,
        cssClass: material.isActive ? 'alert-button-danger' : 'alert-button-success',
        handler: async () => {
          await this.performStatusToggle(material, action);
        }
      }
    ]
  });

  await alert.present();
}

private async performStatusToggle(material: Material, action: string) {
  const loading = await this.loadingController.create({
    message: `${action.charAt(0).toUpperCase() + action.slice(1)}ando material...`,
    spinner: 'circular'
  });
  await loading.present();

  this.materialService.updateMaterial(material.id, { isActive: !material.isActive }).subscribe({
    next: () => {
      loading.dismiss();
      this.showToast(`Material ${action}do exitosamente`, 'success');
      this.loadMaterials();
    },
    error: (error) => {
      loading.dismiss();
      this.showToast(`Error al ${action} el material`, 'danger');
      console.error('Error actualizando estado:', error);
    }
  });
}

  // Métodos de utilidad
  getStockStatus(material: Material): string {
    if (material.currentStock === 0) return 'danger';
    if (material.currentStock <= material.minimumStock) return 'warning';
    return 'good';
  }

  getStockBadgeColor(material: Material): string {
    switch (this.getStockStatus(material)) {
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'good': return 'success';
      default: return 'medium';
    }
  }

  getStatusBadgeColor(material: Material): string {
    return material.isActive ? 'success' : 'medium';
  }

  getStatusText(material: Material): string {
    return material.isActive ? 'Activo' : 'Inactivo';
  }

  // Métodos para ajuste de stock
  adjustStock(material: Material) {
    this.openStockAdjustmentModal(material);
  }

  openStockAdjustmentModal(material: Material) {
    this.selectedMaterial = material;
    this.adjustmentType = 'ingreso';
    this.stockAdjustmentForm.reset();
    this.isStockModalOpen = true;
  }

  closeStockModal() {
    this.isStockModalOpen = false;
    this.selectedMaterial = null;
    this.stockAdjustmentForm.reset();
  }

  setAdjustmentType(type: 'ingreso' | 'salida') {
    this.adjustmentType = type;
  }

  openStockAdjustment(material: Material, type: 'ingreso' | 'salida') {
    this.selectedMaterial = material;
    this.adjustmentType = type;
    this.stockAdjustmentForm.reset();
    this.isStockModalOpen = true;
  }

  closeStockAdjustment() {
    this.isStockModalOpen = false;
    this.selectedMaterial = null;
    this.stockAdjustmentForm.reset();
  }

  async submitStockAdjustment() {
    if (this.stockAdjustmentForm.valid && this.selectedMaterial && !this.isSubmittingStockAdjustment) {
      this.isSubmittingStockAdjustment = true;
      const formValue = this.stockAdjustmentForm.value;
      const quantity = parseInt(formValue.quantity);
      const notes = formValue.notes || '';

      const loading = await this.loadingController.create({
        message: 'Procesando ajuste de stock...'
      });
      await loading.present();

      try {
        if (this.adjustmentType === 'ingreso') {
          await this.movementService.registerEntry(this.selectedMaterial.id, quantity, notes).toPromise();
          await this.materialService.updateMaterialStock(this.selectedMaterial, quantity).toPromise();
          await this.showToast('Ingreso registrado exitosamente', 'success');
        } else {
          if (this.selectedMaterial.currentStock < quantity) {
            await this.showToast(`Stock insuficiente. Stock actual: ${this.selectedMaterial.currentStock}`, 'danger');
            await loading.dismiss();
            return;
          }
          await this.movementService.registerEntry(this.selectedMaterial.id, -quantity, notes).toPromise();
          await this.materialService.updateMaterialStock(this.selectedMaterial, -quantity).toPromise();
          await this.showToast('Salida registrada exitosamente', 'success');
        }
        this.loadMaterials();
        this.closeStockAdjustment();
      } catch (error: any) {
        await this.showToast(error.message || 'Error al ajustar el stock', 'danger');
      } finally {
        await loading.dismiss();
        this.isSubmittingStockAdjustment = false;
      }
    } else {
      await this.showToast('Por favor, completa todos los campos requeridos', 'warning');
    }
  }

  // Validation methods for forms
  isFieldInvalid(fieldName: string): boolean {
    const field = this.stockAdjustmentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.stockAdjustmentForm.get(fieldName);
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
