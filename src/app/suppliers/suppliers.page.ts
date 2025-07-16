import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonFab,
  IonFabButton,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, search, create, trash, business, call, mail, location, person, closeCircle, checkmarkCircle, sync, ban } from 'ionicons/icons';
import { SupplierService } from '../shared/services/supplier.service';
import { Supplier } from '../shared/models/supplier.model';
import { ConfirmationModalComponent } from '../shared/components/confirmation-modal/confirmation-modal.component';
import { SupplierFormModalComponent } from './supplier-form-modal/supplier-form-modal.component';
import { SupplierStatusModalComponent } from './supplier-status-modal/supplier-status-modal.component';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.page.html',
  styleUrls: ['./suppliers.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonFab,
    IonFabButton,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton
  ]
})
export class SuppliersPage implements OnInit, OnDestroy {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  searchTerm: string = '';
  selectedSegment: string = 'all';
  private subscription: any;

  // Computed properties for template bindings
  get totalSuppliers(): number {
    return this.suppliers.length;
  }

  get activeSuppliers(): number {
    return this.suppliers.filter(s => s.isActive).length;
  }

  get inactiveSuppliers(): number {
    return this.suppliers.filter(s => !s.isActive).length;
  }

  get activePercentage(): number {
    if (this.totalSuppliers === 0) return 0;
    return Math.round((this.activeSuppliers / this.totalSuppliers) * 100);
  }

  get inactivePercentage(): number {
    if (this.totalSuppliers === 0) return 0;
    return Math.round((this.inactiveSuppliers / this.totalSuppliers) * 100);
  }

  constructor(
    private supplierService: SupplierService,
    private router: Router,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    addIcons({ add, search, create, trash, business, call, mail, location, person, closeCircle, checkmarkCircle, sync, ban, 'checkmark-circle': checkmarkCircle });
  }

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.subscription = this.supplierService.suppliers$.subscribe(suppliers => {
      this.suppliers = suppliers;
      this.filterSuppliers();
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterSuppliers();
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterSuppliers();
  }

  filterSuppliers() {
    let filtered = this.suppliers;

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower) ||
        supplier.contactPerson?.toLowerCase().includes(searchLower) ||
        supplier.ruc?.includes(this.searchTerm)
      );
    }

    // Filter by segment
    switch (this.selectedSegment) {
      case 'active':
        filtered = filtered.filter(s => s.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(s => !s.isActive);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    this.filteredSuppliers = filtered;
  }

  async addSupplier() {
    const modal = await this.modalController.create({
      component: SupplierFormModalComponent,
      componentProps: {
        isEdit: false
      },
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadSuppliers();
      }
    });

    await modal.present();
  }

  async editSupplier(supplier: Supplier) {
    const modal = await this.modalController.create({
      component: SupplierFormModalComponent,
      componentProps: {
        supplier: supplier,
        isEdit: true
      },
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadSuppliers();
      }
    });

    await modal.present();
  }

  async deleteSupplier(supplier: Supplier) {
    const modal = await this.modalController.create({
      component: ConfirmationModalComponent,
      componentProps: {
        title: 'Eliminar Proveedor',
        message: `¿Está seguro de que desea eliminar el proveedor "${supplier.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        buttonColor: 'danger'
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data === true) {
        this.confirmDelete(supplier);
      }
    });

    await modal.present();
  }

  async confirmDelete(supplier: Supplier) {
    try {
      await this.supplierService.deleteSupplier(supplier.id).toPromise();
      this.showToast('Proveedor eliminado exitosamente', 'success');
      this.loadSuppliers();
    } catch (error) {
      this.showToast('Error al eliminar el proveedor', 'danger');
    }
  }

  async toggleSupplierStatus(supplier: Supplier) {
    const modal = await this.modalController.create({
      component: SupplierStatusModalComponent,
      componentProps: {
        supplier: supplier
      },
      breakpoints: [0, 0.6, 0.8],
      initialBreakpoint: 0.6
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.shouldToggle) {
        this.confirmToggleStatus(supplier);
      }
    });

    await modal.present();
  }

  async confirmToggleStatus(supplier: Supplier) {
    try {
      await this.supplierService.toggleSupplierStatus(supplier.id).toPromise();
      const status = supplier.isActive ? 'desactivado' : 'activado';
      this.showToast(`Proveedor ${status} exitosamente`, 'success');
      this.loadSuppliers();
    } catch (error) {
      this.showToast('Error al cambiar el estado del proveedor', 'danger');
    }
  }

  async onRefresh(event: any) {
    this.loadSuppliers();
    event.target.complete();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  // Helper methods for template
  getStatusBadgeColor(supplier: Supplier): string {
    return supplier.isActive ? 'success' : 'medium';
  }

  getStatusText(supplier: Supplier): string {
    return supplier.isActive ? 'Activo' : 'Inactivo';
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
