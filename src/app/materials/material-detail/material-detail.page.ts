import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonButtons, 
  IonIcon, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonList,
  IonSpinner,
  LoadingController,
  ToastController,
  AlertController,
  IonBackButton,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { create, trash, cube, calendar, location, pricetag, business, checkmark, close } from 'ionicons/icons';
import { Material, MaterialMovement, MovementType } from '../../shared/models';
import { MaterialService } from '../../shared/services';
import { InventoryMovement } from '../../shared/services/database.service';

@Component({
  selector: 'app-material-detail',
  templateUrl: './material-detail.page.html',
  styleUrls: ['./material-detail.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonList,
    IonSpinner,
    IonBackButton,
    IonFab,
    IonFabButton
  ]
})
export class MaterialDetailPage implements OnInit {
  material: Material | null = null;
  movements: MaterialMovement[] = [];
  materialId: string | null = null;

  constructor(
    private materialService: MaterialService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ create, trash, cube, calendar, location, pricetag, business, checkmark, close });
  }

  ngOnInit() {
    this.materialId = this.route.snapshot.paramMap.get('id');
    if (this.materialId) {
      this.loadMaterial(this.materialId);
      this.loadMovements(this.materialId);
    }
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
          this.material = material;
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

  loadMovements(materialId: string) {
    this.materialService.getMaterialMovements(materialId).subscribe({
      next: (inventoryMovements) => {
        // Convertir InventoryMovement[] a MaterialMovement[]
        const materialMovements: MaterialMovement[] = inventoryMovements.map(inv => ({
          id: inv.id,
          materialId: inv.materialId,
          workId: inv.workId,
          type: inv.movementType || MovementType.ENTRADA,
          movementType: inv.movementType,
          quantity: inv.quantity,
          reason: inv.reason,
          userId: inv.userId,
          technicianId: inv.technicianId,
          notes: inv.notes,
          remainingStock: inv.remainingStock || 0,
          createdAt: new Date(inv.createdAt),
          updatedAt: new Date(inv.updatedAt || inv.createdAt)
        }));
        this.movements = materialMovements.slice(0, 10); // Últimos 10 movimientos
      },
      error: (error) => {
        console.error('Error loading movements:', error);
      }
    });
  }

  editMaterial() {
    if (this.materialId) {
      this.router.navigate(['/tabs/materials/edit', this.materialId]);
    }
  }

  async deleteMaterial() {
    if (!this.material) return;

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar el material "${this.material.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (this.materialId) {
              this.materialService.deleteMaterial(this.materialId).subscribe({
                next: () => {
                  this.showToast('Material eliminado exitosamente', 'success');
                  this.router.navigate(['/tabs/materials']);
                },
                error: (error) => {
                  this.showToast('Error al eliminar el material', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async adjustStock() {
    if (!this.material) return;

    const alert = await this.alertController.create({
      header: 'Ajustar Stock',
      message: `Stock actual: ${this.material.currentStock} ${this.material.unit}`,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'Cantidad (+ para aumentar, - para disminuir)',
          value: 0
        },
        {
          name: 'notes',
          type: 'text',
          placeholder: 'Notas del ajuste (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ajustar',
          handler: (data) => {
            const quantity = parseInt(data.quantity);
            if (isNaN(quantity) || quantity === 0) {
              this.showToast('Por favor ingrese una cantidad válida', 'warning');
              return false;
            }

            if (this.materialId) {
              this.materialService.adjustStock(this.materialId, quantity, data.notes).subscribe({
                next: () => {
                  this.showToast('Stock ajustado exitosamente', 'success');
                  this.loadMaterial(this.materialId!);
                  this.loadMovements(this.materialId!);
                },
                error: (error) => {
                  this.showToast('Error al ajustar el stock', 'danger');
                }
              });
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  getStockStatus(): 'good' | 'warning' | 'danger' {
    if (!this.material) return 'good';
    if (this.material.currentStock <= 0) return 'danger';
    if (this.material.currentStock <= this.material.minimumStock) return 'warning';
    return 'good';
  }

  getStockBadgeColor(): string {
    const status = this.getStockStatus();
    switch (status) {
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'good': return 'success';
      default: return 'medium';
    }
  }

  getStockStatusText(): string {
    const status = this.getStockStatus();
    switch (status) {
      case 'danger': return 'Sin stock';
      case 'warning': return 'Stock bajo';
      case 'good': return 'Stock normal';
      default: return 'Stock normal';
    }
  }

  getMovementTypeColor(type: string | MovementType | undefined): string {
    if (!type) return 'medium';
    
    // Convertir a string para comparación
    const typeStr = String(type);
    
    switch (typeStr) {
      case 'entrada':
      case MovementType.ENTRADA: return 'success';
      case 'salida_entrega':
      case MovementType.SALIDA_ENTREGA: return 'warning';
      case 'salida':
      case MovementType.SALIDA: return 'danger';
      case 'transferencia':
      case MovementType.TRANSFERENCIA: return 'primary';
      case 'ajuste':
      case MovementType.AJUSTE: return 'medium';
      default: return 'medium';
    }
  }

  getMovementTypeText(type: string | MovementType | undefined): string {
    if (!type) return 'Sin tipo';
    
    // Convertir a string para comparación
    const typeStr = String(type);
    
    switch (typeStr) {
      case 'entrada':
      case MovementType.ENTRADA: return 'Entrada';
      case 'salida_entrega':
      case MovementType.SALIDA_ENTREGA: return 'Entrega';
      case 'salida':
      case MovementType.SALIDA: return 'Salida';
      case 'transferencia':
      case MovementType.TRANSFERENCIA: return 'Transferencia';
      case 'ajuste':
      case MovementType.AJUSTE: return 'Ajuste';
      default: return typeStr;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
