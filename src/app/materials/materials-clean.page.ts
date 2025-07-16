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
  IonSegment,
  IonSegmentButton,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, search, filter, eye, create, trash, cube, warning, checkmark, swapVertical, trendingUp, trendingDown, close, closeCircle, checkmarkCircle } from 'ionicons/icons';
import { Material } from '../shared/models';
import { MaterialService, MovementService } from '../shared/services';

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
  materials: Material[] = [];
  filteredMaterials: Material[] = [];
  searchTerm: string = '';
  selectedSegment: string = 'all';
  
  // Formulario para ajuste de stock
  stockAdjustmentForm: FormGroup;
  isStockModalOpen = false;
  selectedMaterial: Material | null = null;
  adjustmentType: 'ingreso' | 'salida' = 'ingreso';

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private movementService: MovementService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
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
    this.materialService.getMaterials().subscribe(materials => {
      this.materials = materials;
      this.filterMaterials();
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

  get activeMaterials(): number {
    return this.materials.filter(material => material.isActive).length;
  }

  get inactiveMaterials(): number {
    return this.materials.filter(material => !material.isActive).length;
  }

  // Métodos de CRUD con Alerts
  async addMaterial() {
    console.log('Abriendo alert para nuevo material...');
    
    const alert = await this.alertController.create({
      cssClass: 'custom-material-alert',
      header: '📦 Nuevo Material',
      message: `
        <div class="form-container">
          <div class="input-group">
            <label class="input-label">Código *</label>
            <input type="text" class="form-input" id="code" placeholder="Ej: CBL-001" maxlength="20">
          </div>
          <div class="input-group">
            <label class="input-label">Nombre *</label>
            <input type="text" class="form-input" id="name" placeholder="Ej: Cable UTP Cat 6" maxlength="100">
          </div>
          <div class="input-group">
            <label class="input-label">Descripción *</label>
            <textarea class="form-input" id="description" placeholder="Descripción del material" maxlength="200" rows="2"></textarea>
          </div>
          <div class="input-group">
            <label class="input-label">Categoría *</label>
            <select class="form-input" id="category">
              <option value="">Seleccionar categoría</option>
              <option value="Cableado">Cableado</option>
              <option value="Equipos">Equipos</option>
              <option value="Conectores">Conectores</option>
              <option value="Herramientas">Herramientas</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Consumibles">Consumibles</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div class="input-row">
            <div class="input-group">
              <label class="input-label">Stock Inicial *</label>
              <input type="number" class="form-input" id="currentStock" placeholder="0" min="0">
            </div>
            <div class="input-group">
              <label class="input-label">Stock Mínimo *</label>
              <input type="number" class="form-input" id="minimumStock" placeholder="0" min="0">
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Ubicación *</label>
            <input type="text" class="form-input" id="location" placeholder="Ej: Almacén A - Estante 1" maxlength="100">
          </div>
          <div class="input-row">
            <div class="input-group">
              <label class="input-label">Precio Unitario</label>
              <input type="number" class="form-input" id="price" placeholder="0.00" min="0" step="0.01">
            </div>
            <div class="input-group">
              <label class="input-label">Unidad</label>
              <select class="form-input" id="unit">
                <option value="unidades">Unidades</option>
                <option value="metros">Metros</option>
                <option value="paquetes">Paquetes</option>
                <option value="cajas">Cajas</option>
                <option value="rollos">Rollos</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Proveedor</label>
            <input type="text" class="form-input" id="supplier" placeholder="Nombre del proveedor" maxlength="100">
          </div>
        </div>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Crear Material',
          cssClass: 'alert-button-confirm',
          handler: (data) => {
            return this.handleCreateMaterial();
          }
        }
      ]
    });

    await alert.present();
  }

  async editMaterial(material: Material) {
    console.log('Editando material:', material.name);
    
    const alert = await this.alertController.create({
      cssClass: 'custom-material-alert',
      header: '✏️ Editar Material',
      message: `
        <div class="form-container">
          <div class="input-group">
            <label class="input-label">Código *</label>
            <input type="text" class="form-input" id="code" value="${material.code}" maxlength="20">
          </div>
          <div class="input-group">
            <label class="input-label">Nombre *</label>
            <input type="text" class="form-input" id="name" value="${material.name}" maxlength="100">
          </div>
          <div class="input-group">
            <label class="input-label">Descripción *</label>
            <textarea class="form-input" id="description" maxlength="200" rows="2">${material.description}</textarea>
          </div>
          <div class="input-group">
            <label class="input-label">Categoría *</label>
            <select class="form-input" id="category">
              <option value="Cableado" ${material.category === 'Cableado' ? 'selected' : ''}>Cableado</option>
              <option value="Equipos" ${material.category === 'Equipos' ? 'selected' : ''}>Equipos</option>
              <option value="Conectores" ${material.category === 'Conectores' ? 'selected' : ''}>Conectores</option>
              <option value="Herramientas" ${material.category === 'Herramientas' ? 'selected' : ''}>Herramientas</option>
              <option value="Accesorios" ${material.category === 'Accesorios' ? 'selected' : ''}>Accesorios</option>
              <option value="Consumibles" ${material.category === 'Consumibles' ? 'selected' : ''}>Consumibles</option>
              <option value="Otros" ${material.category === 'Otros' ? 'selected' : ''}>Otros</option>
            </select>
          </div>
          <div class="input-group">
            <label class="input-label">Ubicación *</label>
            <input type="text" class="form-input" id="location" value="${material.location}" maxlength="100">
          </div>
          <div class="input-row">
            <div class="input-group">
              <label class="input-label">Precio Unitario</label>
              <input type="number" class="form-input" id="price" value="${material.price || 0}" min="0" step="0.01">
            </div>
            <div class="input-group">
              <label class="input-label">Unidad</label>
              <select class="form-input" id="unit">
                <option value="unidades" ${material.unit === 'unidades' ? 'selected' : ''}>Unidades</option>
                <option value="metros" ${material.unit === 'metros' ? 'selected' : ''}>Metros</option>
                <option value="paquetes" ${material.unit === 'paquetes' ? 'selected' : ''}>Paquetes</option>
                <option value="cajas" ${material.unit === 'cajas' ? 'selected' : ''}>Cajas</option>
                <option value="rollos" ${material.unit === 'rollos' ? 'selected' : ''}>Rollos</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Proveedor</label>
            <input type="text" class="form-input" id="supplier" value="${material.supplier || ''}" maxlength="100">
          </div>
        </div>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Actualizar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            return this.handleUpdateMaterial(material.id);
          }
        }
      ]
    });

    await alert.present();
  }

  async viewMaterial(material: Material) {
    const alert = await this.alertController.create({
      cssClass: 'custom-material-alert',
      header: `📋 ${material.name}`,
      message: `
        <div class="material-details">
          <div class="detail-card">
            <div class="detail-row">
              <span class="detail-label">Código:</span>
              <span class="detail-value">${material.code}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Descripción:</span>
              <span class="detail-value">${material.description}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Categoría:</span>
              <span class="detail-value">${material.category}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stock Actual:</span>
              <span class="detail-value stock-${this.getStockStatus(material)}">${material.currentStock} ${material.unit}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stock Mínimo:</span>
              <span class="detail-value">${material.minimumStock} ${material.unit}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ubicación:</span>
              <span class="detail-value">${material.location}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Precio:</span>
              <span class="detail-value">$${(material.price || 0).toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <span class="detail-value status-${material.isActive ? 'active' : 'inactive'}">${material.isActive ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Editar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.editMaterial(material);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // Handlers para los alerts
  private async handleCreateMaterial(): Promise<boolean> {
    const code = (document.getElementById('code') as HTMLInputElement)?.value?.trim();
    const name = (document.getElementById('name') as HTMLInputElement)?.value?.trim();
    const description = (document.getElementById('description') as HTMLTextAreaElement)?.value?.trim();
    const category = (document.getElementById('category') as HTMLSelectElement)?.value;
    const currentStock = parseInt((document.getElementById('currentStock') as HTMLInputElement)?.value) || 0;
    const minimumStock = parseInt((document.getElementById('minimumStock') as HTMLInputElement)?.value) || 0;
    const location = (document.getElementById('location') as HTMLInputElement)?.value?.trim();
    const price = parseFloat((document.getElementById('price') as HTMLInputElement)?.value) || 0;
    const unit = (document.getElementById('unit') as HTMLSelectElement)?.value || 'unidades';
    const supplier = (document.getElementById('supplier') as HTMLInputElement)?.value?.trim() || '';

    if (!this.validateMaterialData({ code, name, description, category, location })) {
      return false;
    }

    const materialData = {
      code, name, description, category, unit, currentStock, minimumStock, location, price, supplier, isActive: true
    };

    await this.createMaterial(materialData);
    return true;
  }

  private async handleUpdateMaterial(materialId: string): Promise<boolean> {
    const code = (document.getElementById('code') as HTMLInputElement)?.value?.trim();
    const name = (document.getElementById('name') as HTMLInputElement)?.value?.trim();
    const description = (document.getElementById('description') as HTMLTextAreaElement)?.value?.trim();
    const category = (document.getElementById('category') as HTMLSelectElement)?.value;
    const location = (document.getElementById('location') as HTMLInputElement)?.value?.trim();
    const price = parseFloat((document.getElementById('price') as HTMLInputElement)?.value) || 0;
    const unit = (document.getElementById('unit') as HTMLSelectElement)?.value;
    const supplier = (document.getElementById('supplier') as HTMLInputElement)?.value?.trim() || '';

    if (!this.validateMaterialData({ code, name, description, category, location })) {
      return false;
    }

    const materialData = {
      code, name, description, category, unit, location, price, supplier
    };

    await this.updateMaterial(materialId, materialData);
    return true;
  }

  private validateMaterialData(data: any): boolean {
    if (!data.code || data.code.length < 3) {
      this.showToast('El código debe tener al menos 3 caracteres', 'warning');
      return false;
    }
    if (!data.name || data.name.length < 3) {
      this.showToast('El nombre debe tener al menos 3 caracteres', 'warning');
      return false;
    }
    if (!data.description) {
      this.showToast('La descripción es requerida', 'warning');
      return false;
    }
    if (!data.category) {
      this.showToast('La categoría es requerida', 'warning');
      return false;
    }
    if (!data.location) {
      this.showToast('La ubicación es requerida', 'warning');
      return false;
    }
    return true;
  }

  private async createMaterial(materialData: any) {
    const loading = await this.loadingController.create({
      message: 'Creando material...'
    });
    await loading.present();

    this.materialService.addMaterial(materialData).subscribe({
      next: (material) => {
        loading.dismiss();
        this.showToast('Material creado exitosamente', 'success');
        this.loadMaterials();
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Error al crear el material', 'danger');
      }
    });
  }

  private async updateMaterial(materialId: string, materialData: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando material...'
    });
    await loading.present();

    this.materialService.updateMaterial(materialId, materialData).subscribe({
      next: (material) => {
        loading.dismiss();
        this.showToast('Material actualizado exitosamente', 'success');
        this.loadMaterials();
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Error al actualizar el material', 'danger');
      }
    });
  }

  // Otros métodos
  async deleteMaterial(material: Material) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar "${material.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-danger',
          handler: async () => {
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
        }
      ]
    });

    await alert.present();
  }

  async toggleMaterialStatus(material: Material) {
    const action = material.isActive ? 'desactivar' : 'activar';
    const alert = await this.alertController.create({
      header: `Confirmar ${action}`,
      message: `¿Estás seguro de que quieres ${action} "${material.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: async () => {
            const loading = await this.loadingController.create({
              message: `${action.charAt(0).toUpperCase() + action.slice(1)}ando material...`
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
              }
            });
          }
        }
      ]
    });

    await alert.present();
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
    if (this.stockAdjustmentForm.valid && this.selectedMaterial) {
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
          await this.showToast('Ingreso registrado exitosamente', 'success');
        } else {
          if (this.selectedMaterial.currentStock < quantity) {
            await this.showToast(`Stock insuficiente. Stock actual: ${this.selectedMaterial.currentStock}`, 'danger');
            await loading.dismiss();
            return;
          }

          await this.materialService.updateMaterialStock(this.selectedMaterial.id, -quantity).toPromise();
          await this.showToast('Salida registrada exitosamente', 'success');
        }

        this.loadMaterials();
        this.closeStockAdjustment();
      } catch (error: any) {
        await this.showToast(error.message || 'Error al ajustar el stock', 'danger');
      } finally {
        await loading.dismiss();
      }
    } else {
      await this.showToast('Por favor, completa todos los campos requeridos', 'warning');
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
