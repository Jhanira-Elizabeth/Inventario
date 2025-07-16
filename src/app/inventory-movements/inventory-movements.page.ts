import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, takeUntil, firstValueFrom } from 'rxjs';
import {
  AlertController,
  ToastController,
  ModalController,
  LoadingController,
  IonModal,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonIcon,
  IonTextarea,
  IonToolbar,
  IonTitle,
  IonFab,
  IonFabButton,
  IonFabList,
  IonContent,
  IonHeader,
  IonList,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonButtons,
  IonSearchbar,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  add, 
  remove, 
  search, 
  swapHorizontal, 
  trendingUp, 
  trendingDown, 
  cube, 
  checkmark,
  close,
  calendar,
  person,
  business, trash } from 'ionicons/icons';
import { MovementService } from '../shared/services/movement.service';
import { MaterialService } from '../shared/services/material.service';
import { WorkService } from '../shared/services/work.service';
import { AuthService } from '../shared/services/auth.service';
import { PermissionService } from '../shared/services/permission.service';
import { MaterialMovement, MovementType, Material } from '../shared/models/material.model';
import { Work, WorkStatus } from '../shared/models/work.model';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'app-inventory-movements',
  templateUrl: './inventory-movements.page.html',
  styleUrls: ['./inventory-movements.page.scss'],
  standalone: true,
  imports: [IonSearchbar, 
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonModal,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonIcon,
    IonTextarea,
    IonToolbar,
    IonTitle,
    IonContent,
    IonHeader,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons
  ]
})
export class InventoryMovementsPage implements OnInit, OnDestroy {
  // Elimina un material por ID y recarga la lista, con confirmación
  async deleteMaterial(materialId: string) {
    const material = this.materials.find(m => m.id === materialId);
    const nombre = material ? material.name : 'este material';
    const alert = await this.alertController.create({
      header: '¿Eliminar material?',
      message: `¿Estás seguro de que deseas eliminar <b>${nombre}</b>? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.materialService.deleteMaterial(materialId).toPromise();
              if (typeof this.materialService.loadMaterials === 'function') {
                await this.materialService.loadMaterials();
              }
              // Actualizar la lista local
              const materialesActualizados = await this.materialService.getMaterials().toPromise();
              this.materials = (materialesActualizados || []).filter(m => m.isActive);
              this.cdRef.detectChanges();
              await this.showSuccessToast('Material eliminado correctamente');
            } catch (error) {
              await this.showErrorToast('Error al eliminar el material');
            }
          }
        }
      ]
    });
    await alert.present();
  }
  private isLoadingData = false;
  public isRegisteringMovement = false;
  private isStockBeingUpdated = false;
  private loadedOnce = false;
  movements: MaterialMovement[] = [];
  filteredMovements: MaterialMovement[] = [];
  noMovementsError: boolean = false;
  materials: Material[] = [];
  works: Work[] = [];
  technicians: User[] = [];

  searchTerm = '';
  selectedSegment: string = 'all';

  movementForm: FormGroup;
  isModalOpen = false;
  movementType: 'entry' | 'delivery' = 'entry';

  stats = {
    totalEntries: 0,
    totalDeliveries: 0,
    todayMovements: 0
  };

  readonly MovementType = MovementType;
  private destroy$ = new Subject<void>();
  private dataReload$ = new Subject<void>();
  private dataSubscriptions: Subscription[] = [];

  // Métodos de permisos
  canCreateEntry(): boolean {
    return this.permissionService.canCreateEntryMovement();
  }

  canCreateDelivery(): boolean {
    return this.permissionService.canCreateDeliveryMovement();
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private movementService: MovementService,
    private materialService: MaterialService,
    private workService: WorkService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({close,trash,add,remove,search,swapHorizontal,trendingUp,trendingDown,cube,checkmark,calendar,person,business});
    
    this.movementForm = this.fb.group({
      materialId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      workId: [''],
      technicianId: [''],
      notes: ['']
    });
  }

  async ngOnInit() {
    if (!this.loadedOnce) {
      this.loadedOnce = true;
      // 1. Cargar datos iniciales (crear demo si es necesario) ANTES de suscribirse
      await this.initDemoDataIfNeeded();
      // 2. Forzar recarga de materiales después de crear demo
      if (typeof this.materialService.loadMaterials === 'function') {
        await this.materialService.loadMaterials();
      }
      // 3. Suscribirse a materiales y movimientos de forma reactiva SOLO para actualizar el estado visual
      this.dataSubscriptions.push(
        this.materialService.getMaterials().subscribe(materiales => {
          this.materials = materiales || [];
          this.cdRef.detectChanges();
        })
      );
      this.dataSubscriptions.push(
        this.movementService.getMovements().subscribe(movs => {
          this.movements = movs || [];
          this.applyFilters();
        })
      );
      // 4. Cargar obras, técnicos y stats
      this.loadData();
    }
  }

  // Inicializa datos de ejemplo SOLO si no existen (sin bucles)
  private async initDemoDataIfNeeded() {
    // 1. Forzar inicialización de la base de datos (si existe el método)
    if (typeof (this.materialService as any).databaseService?.initializeDatabase === 'function') {
      await (this.materialService as any).databaseService.initializeDatabase();
    }
    // 2. Esperar a que los materiales estén realmente cargados
    let materiales = await this.materialService.getMaterials().pipe().toPromise();
    if (!materiales || materiales.length === 0) {
      await this.materialService.createMaterial({
        id: 'material-demo',
        name: 'Material Demo',
        code: 'DEMO-001',
        description: 'Material de ejemplo para pruebas',
        category: 'General',
        unit: 'unidad',
        currentStock: 10,
        isActive: true,
        minimumStock: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }).toPromise();
      // Forzar recarga tras crear demo
      if (typeof this.materialService.loadMaterials === 'function') {
        await this.materialService.loadMaterials();
      }
      materiales = await this.materialService.getMaterials().pipe().toPromise();
    }
    let movimientos = await this.movementService.getMovements().pipe().toPromise();
    if (!movimientos || movimientos.length === 0) {
      // Buscar el id del material demo
      const mats = await this.materialService.getMaterials().pipe().toPromise();
      const matId = mats && mats.length > 0 ? mats[0].id : 'material-demo';
      await this.movementService.registerEntry(
        matId,
        1,
        'Movimiento de ejemplo automático'
      ).toPromise();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.dataReload$.next();
    this.dataReload$.complete();
    this.cancelDataSubscriptions();
  }

  private cancelDataSubscriptions() {
    this.dataSubscriptions.forEach(sub => sub.unsubscribe());
    this.dataSubscriptions = [];
  }

  async loadData() {
    if (this.isLoadingData) return;
    this.isLoadingData = true;
    const loading = await this.loadingController.create({
      message: 'Cargando movimientos...'
    });
    await loading.present();
    let loadingTimeout: any;
    this.noMovementsError = false;
    loadingTimeout = setTimeout(async () => {
      if (this.isLoadingData) {
        await loading.dismiss();
        this.isLoadingData = false;
        this.noMovementsError = true;
      }
    }, 8000);
    try {
      // Cargar obras y técnicos (los materiales y movimientos ya son reactivos)
      const obrasActualizadas = await this.workService.getWorks().toPromise();
      this.works = (obrasActualizadas || []).filter(w => w.status !== WorkStatus.FINALIZADA);
      const usuarios = await this.authService.getUsers().toPromise();
      this.technicians = (usuarios || []).filter(u => u.role === 'tecnico' && u.isActive);
      // Cargar estadísticas
      const stats = await this.movementService.getMovementStats().toPromise();
      this.stats = stats || { totalEntries: 0, totalDeliveries: 0, todayMovements: 0 };
      this.applyFilters();
    } catch (error) {
      await this.showErrorToast('Error al cargar los datos');
      this.noMovementsError = true;
    } finally {
      clearTimeout(loadingTimeout);
      await loading.dismiss();
      this.isLoadingData = false;
    }
  }

  onSearch(event?: any) {
    if (event && event.target) {
      this.searchTerm = event.target.value;
    }
    this.applyFilters();
  }

  onSegmentChange(event: any) {
    if (event && event.detail && event.detail.value) {
      this.selectedSegment = event.detail.value;
    }
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.movements];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(movement => {
        const material = this.getMaterialName(movement.materialId);
        return material.toLowerCase().includes(term) ||
               movement.notes?.toLowerCase().includes(term);
      });
    }

    // Filtrar por tipo de movimiento
    if (this.selectedSegment !== 'all') {
      const typeMap: { [key: string]: MovementType } = {
        'entries': MovementType.ENTRADA,
        'deliveries': MovementType.SALIDA_ENTREGA
      };
      filtered = filtered.filter(movement => movement.movementType === typeMap[this.selectedSegment]);
    }

    // Ordenar por fecha (más reciente primero)
    this.filteredMovements = filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async openMovementModal(type: 'entry' | 'delivery') {
    this.movementType = type;
    this.resetForm();
    // Recargar materiales
    if (typeof this.materialService.loadMaterials === 'function') {
      await this.materialService.loadMaterials();
    }
    // Si no hay materiales, crear uno demo y recargar
    if (!this.materials || this.materials.length === 0) {
      console.warn('[DEBUG] No hay materiales, creando demo...');
      await this.materialService.createMaterial({
        id: 'material-demo',
        name: 'Material Demo',
        code: 'DEMO-002',
        description: 'Material de ejemplo para pruebas',
        category: 'General',
        unit: 'unidad',
        currentStock: 10,
        isActive: true,
        minimumStock: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }).toPromise();
      if (typeof this.materialService.loadMaterials === 'function') {
        await this.materialService.loadMaterials();
      }
      // Esperar un ciclo para que la suscripción se actualice
      await new Promise(res => setTimeout(res, 300));
      console.warn('[DEBUG] Materiales tras crear demo:', this.materials);
      if (!this.materials || this.materials.length === 0) {
        await this.showErrorToast('ATENCIÓN: El servicio de materiales NO está guardando ni leyendo datos. Revisa MaterialService y DatabaseService.');
      }
    }
    this.isModalOpen = true;
    this.cdRef.detectChanges();
    setTimeout(() => this.cdRef.detectChanges(), 0);
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.movementForm.reset();
    
    // Configurar validadores según el tipo de movimiento
    this.updateFormValidators();
  }

  updateFormValidators() {
    const workControl = this.movementForm.get('workId');
    const technicianControl = this.movementForm.get('technicianId');

    if (this.movementType === 'entry') {
      // Para entradas, no son requeridos
      workControl?.clearValidators();
      technicianControl?.clearValidators();
    } else if (this.movementType === 'delivery') {
      // Para entregas, ambos son requeridos
      workControl?.setValidators([Validators.required]);
      technicianControl?.setValidators([Validators.required]);
    }

    workControl?.updateValueAndValidity();
    technicianControl?.updateValueAndValidity();
  }

  async submitMovement() {
    console.log('[DEBUG-TRACE] submitMovement INICIO', this.movementForm.value);
    if (this.isRegisteringMovement) {
      console.warn('[DEBUG-TRACE] submitMovement bloqueado por isRegisteringMovement');
      console.warn('submitMovement bloqueado por isRegisteringMovement');
      console.trace();
      return;
    }
    if (!this.movementForm.valid) {
      console.warn('[DEBUG-TRACE] submitMovement formulario inválido', this.movementForm.value);
      await this.showErrorToast('Por favor, completa todos los campos requeridos');
      this.markFormGroupTouched();
      return;
    }

    this.isRegisteringMovement = true;
    console.log('[DEBUG-TRACE] submitMovement bandera isRegisteringMovement activada');
    // BLOQUEO: Deshabilitar recarga durante el proceso (NO cancelar suscripciones reactivas)
    const prevDataReload$ = this.dataReload$;
    console.log('[DEBUG-TRACE] submitMovement prevDataReload$', prevDataReload$);
    this.dataReload$ = new Subject<void>();

    const loading = await this.loadingController.create({
      message: 'Registrando movimiento...'
    });
    await loading.present();
    console.log('[DEBUG-TRACE] submitMovement loading presentado');

    let finished = false;
    console.log('[DEBUG-TRACE] submitMovement bandera finished inicializada');
    let loadingTimeout: any;
    loadingTimeout = setTimeout(async () => {
      if (!finished && this.isRegisteringMovement) {
        console.error('[DEBUG-TRACE] submitMovement timeout loading cerrado por seguridad');
        console.error('Timeout: loading cerrado por seguridad');
        await loading.dismiss();
        this.isRegisteringMovement = false;
        await this.showErrorToast('Tiempo de espera excedido. Intenta de nuevo.');
      }
    }, 10000);

    const logStep = (msg: string, data?: any) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[INVENTORY-TRACE]', msg, data ?? '');
      } catch (e) { /* ignorar */ }
    };

    try {
      console.log('[DEBUG-TRACE] submitMovement try INICIO', this.movementForm.value, this.materials);
      const formValue = this.movementForm.value;
      let newMovement: MaterialMovement | undefined;

      if (this.movementType === 'entry') {
        console.log('[DEBUG-TRACE] submitMovement tipo entry', this.materials);
        logStep('INICIO REGISTRO ENTRADA', formValue);
        try {
          logStep('Antes de await registerEntry', formValue);
          newMovement = await this.movementService.registerEntry(
            formValue.materialId,
            formValue.quantity,
            formValue.notes
          ).toPromise();
          logStep('Después de await registerEntry', newMovement);

          // BLOQUEO DE REENTRADA DE STOCK
          if (this.isStockBeingUpdated) {
            logStep('updateMaterialStock bloqueado por isStockBeingUpdated (entry)');
            throw new Error('Actualización de stock ya en curso');
          }
          this.isStockBeingUpdated = true;
          let stockTimeout: any;
          try {
            const stockPromise = new Promise<void>(async (resolve, reject) => {
              stockTimeout = setTimeout(async () => {
                logStep('Timeout: updateMaterialStock no respondió en 5s');
                await this.showErrorToast('No se pudo actualizar el stock. Intenta de nuevo.');
                reject(new Error('Timeout updateMaterialStock'));
              }, 5000);
              try {
                logStep('Antes de await updateMaterialStock', formValue);
                await this.materialService.updateMaterialStock(
                  formValue.materialId,
                  Number(formValue.quantity)
                ).toPromise();
                clearTimeout(stockTimeout);
                logStep('Después de await updateMaterialStock', formValue);
                resolve();
              } catch (e) {
                clearTimeout(stockTimeout);
                logStep('ERROR en updateMaterialStock', e);
                reject(e);
              }
            });
            await stockPromise;
          } finally {
            this.isStockBeingUpdated = false;
          }

          logStep('Antes de showSuccessToast');
          await this.showSuccessToast('Entrada registrada exitosamente');
          logStep('Después de showSuccessToast');
          // Cerrar modal inmediatamente tras éxito
          this.closeModal();
        } catch (entryError) {
          logStep('ERROR en registro de entrada', entryError);
          let errorMsg = 'Error al registrar la entrada';
          if (typeof entryError === 'object' && entryError !== null && 'message' in entryError) {
            errorMsg = (entryError as any).message;
          } else if (typeof entryError === 'string') {
            errorMsg = entryError;
          } else if (entryError) {
            errorMsg = entryError.toString();
          }
          await this.showErrorToast(errorMsg);
          throw entryError;
        }
      } else if (this.movementType === 'delivery') {
        console.log('[DEBUG-TRACE] submitMovement tipo delivery', this.materials);
        logStep('INICIO REGISTRO ENTREGA', formValue);
        const material = this.materials.find(m => m.id === formValue.materialId);
        console.log('[DEBUG-TRACE] submitMovement material seleccionado:', material);
        const cantidad = Number(formValue.quantity);
        if (!material) {
          logStep('ERROR: Material no encontrado', formValue.materialId);
          await this.showErrorToast('Material no encontrado');
          await loading.dismiss();
          this.isRegisteringMovement = false;
          // Reactivar recarga
          this.dataReload$ = prevDataReload$;
          return;
        }
        if (material.currentStock < cantidad || material.currentStock <= 0) {
          logStep('ERROR: Stock insuficiente para la entrega', { stock: material.currentStock, cantidad });
          await this.showErrorToast('Stock insuficiente para la entrega');
          await loading.dismiss();
          this.isRegisteringMovement = false;
          // Reactivar recarga
          this.dataReload$ = prevDataReload$;
          return;
        }

        try {
          logStep('Antes de await registerDelivery', formValue);
          newMovement = await this.movementService.registerDelivery(
            formValue.materialId,
            formValue.quantity,
            formValue.workId,
            formValue.technicianId,
            formValue.notes
          ).toPromise();
          logStep('Después de await registerDelivery', newMovement);
        } catch (e) {
          logStep('ERROR en registerDelivery', e);
          await this.showErrorToast('Error al registrar el movimiento');
          await loading.dismiss();
          this.isRegisteringMovement = false;
          // Reactivar recarga
          this.dataReload$ = prevDataReload$;
          return;
        }

        // BLOQUEO DE REENTRADA DE STOCK
        if (this.isStockBeingUpdated) {
          logStep('updateMaterialStock bloqueado por isStockBeingUpdated (delivery)');
          throw new Error('Actualización de stock ya en curso');
        }
        this.isStockBeingUpdated = true;
        try {
          let stockTimeout: any;
          const stockPromise = new Promise<void>(async (resolve, reject) => {
            stockTimeout = setTimeout(async () => {
              logStep('Timeout: updateMaterialStock no respondió en 5s');
              await this.showErrorToast('No se pudo actualizar el stock. Intenta de nuevo.');
              reject(new Error('Timeout updateMaterialStock'));
            }, 5000);
            try {
              logStep('Antes de await updateMaterialStock', { id: formValue.materialId, cantidad: -cantidad });
              await this.materialService.updateMaterialStock(
                formValue.materialId,
                -cantidad
              ).toPromise();
              clearTimeout(stockTimeout);
              logStep('Después de await updateMaterialStock', { id: formValue.materialId, cantidad: -cantidad });
              resolve();
            } catch (e) {
              clearTimeout(stockTimeout);
              logStep('ERROR en updateMaterialStock (delivery)', e);
              reject(e);
            }
          });
          await stockPromise;
        } finally {
          this.isStockBeingUpdated = false;
        }

        logStep('Antes de showSuccessToast (delivery)');
        await this.showSuccessToast('Entrega registrada exitosamente');
        logStep('Después de showSuccessToast (delivery)');
        // Cerrar modal inmediatamente tras éxito
        this.closeModal();
      }

      finished = true;
      logStep('FIN REGISTRO MOVIMIENTO');
      console.log('[DEBUG-TRACE] submitMovement try FIN');
    } catch (error: any) {
      logStep('ERROR GENERAL EN submitMovement', error);
      console.error('[DEBUG-TRACE] submitMovement catch error', error);
      if (error && (error.message === 'Stock insuficiente' || error === 'Stock insuficiente')) {
        // Ya se mostró el mensaje antes, solo cerrar loading y liberar flag
      } else {
        await this.showErrorToast(error?.message || 'Error al registrar el movimiento');
      }
    } finally {
      console.log('[DEBUG-TRACE] submitMovement finally INICIO');
      clearTimeout(loadingTimeout);
      await loading.dismiss();
      console.log('[DEBUG-TRACE] submitMovement loading dismiss');
      this.isRegisteringMovement = false;
      console.log('[DEBUG-TRACE] submitMovement bandera isRegisteringMovement desactivada');
      // Reactivar recarga y suscripciones SOLO si es necesario
      this.dataReload$ = prevDataReload$;
      console.log('[DEBUG-TRACE] submitMovement dataReload restaurado');
      // Actualizar solo la lista local de movimientos y materiales
      // Recargar movimientos
      try {
        console.log('[DEBUG-TRACE] submitMovement recargando movimientos y materiales');
        const movimientosActualizados = await this.movementService.getMovements().toPromise();
        console.log('[DEBUG-TRACE] submitMovement movimientos recargados:', movimientosActualizados);
        this.movements = movimientosActualizados || [];
        // Recargar materiales
        const materialesActualizados = await this.materialService.getMaterials().toPromise();
        console.log('[DEBUG-TRACE] submitMovement materiales recargados:', materialesActualizados);
        this.materials = (materialesActualizados || []).filter(m => m.isActive);
        console.log('[DEBUG-TRACE] submitMovement materiales activos tras filtro:', this.materials);
        this.applyFilters();
        console.log('[DEBUG-TRACE] submitMovement movimientos filtrados:', this.filteredMovements);
      } catch (e) {
        console.error('[DEBUG-TRACE] submitMovement error recargando movimientos/materiales', e);
        // Si falla, no hacer nada
      }
      console.log('[DEBUG-TRACE] submitMovement finally FIN');
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.movementForm.controls).forEach(key => {
      const control = this.movementForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods
  getMaterialName(materialId: string): string {
    const material = this.materials.find(m => m.id === materialId);
    return material ? material.name : 'Material no encontrado';
  }

  getWorkName(workId?: string): string {
    if (!workId) return '';
    const work = this.works.find(w => w.id === workId);
    return work ? work.name : 'Obra no encontrada';
  }

  getTechnicianName(technicianId?: string): string {
    if (!technicianId) return '';
    const technician = this.technicians.find(t => t.id === technicianId);
    return technician ? `${technician.firstName} ${technician.lastName}` : 'Técnico no encontrado';
  }

  getMovementTypeText(type: MovementType): string {
    const types: { [key in MovementType]: string } = {
      [MovementType.ENTRADA]: 'Entrada',
      [MovementType.SALIDA]: 'Salida',
      [MovementType.TRANSFERENCIA]: 'Transferencia',
      [MovementType.AJUSTE]: 'Ajuste',
      [MovementType.SALIDA_ENTREGA]: 'Entrega'
    };
    return types[type];
  }

  getMovementTypeColor(type: MovementType): string {
    const colors: { [key in MovementType]: string } = {
      [MovementType.ENTRADA]: 'success',
      [MovementType.SALIDA]: 'danger',
      [MovementType.TRANSFERENCIA]: 'primary',
      [MovementType.AJUSTE]: 'medium',
      [MovementType.SALIDA_ENTREGA]: 'warning'
    };
    return colors[type];
  }

  getMovementTypeIcon(type: MovementType): string {
    const icons: { [key in MovementType]: string } = {
      [MovementType.ENTRADA]: 'trending-up',
      [MovementType.SALIDA]: 'trending-down',
      [MovementType.TRANSFERENCIA]: 'swap-horizontal',
      [MovementType.AJUSTE]: 'cube',
      [MovementType.SALIDA_ENTREGA]: 'cube' // Cambiado de 'hand-left' a 'cube'
    };
    return icons[type];
  }

  // Métodos seguros que manejan undefined
  getMovementTypeTextSafe(type: MovementType | undefined): string {
    if (!type) return 'Sin tipo';
    return this.getMovementTypeText(type);
  }

  getMovementTypeColorSafe(type: MovementType | undefined): string {
    if (!type) return 'medium';
    return this.getMovementTypeColor(type);
  }

  getMovementTypeIconSafe(type: MovementType | undefined): string {
    if (!type) return 'help-circle';
    return this.getMovementTypeIcon(type);
  }

  get modalTitle(): string {
    const titles = {
      'entry': 'Registrar Entrada',
      'delivery': 'Registrar Entrega'
    };
    return titles[this.movementType];
  }

  get submitButtonText(): string {
    const texts = {
      'entry': 'Registrar Entrada',
      'delivery': 'Registrar Entrega'
    };
    return texts[this.movementType];
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.movementForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.movementForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
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

  // ...existing code...

  // Método público para exponer materiales activos (útil para debug en el template)
  public getActiveMaterials(): Material[] {
    return (this.materials || []).filter(m => m.isActive);
  }

  // Métodos para debug visual en el template (evitan expresiones complejas en HTML)
  public getMaterialsIds(): string {
    return this.materials.map(m => m.id).join(', ');
  }

  public getMaterialsNames(): string {
    return this.materials.map(m => m.name).join(', ');
  }

  public getMaterialsIsActive(): string {
    return this.materials.map(m => String(m.isActive)).join(', ');
  }
}
