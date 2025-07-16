import { Component, OnInit } from '@angular/core';
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
  IonDatetime,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
  LoadingController,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, close, arrowBack, calendar } from 'ionicons/icons';
import { Work, WorkStatus } from '../../shared/models';
import { WorkService } from '../../shared/services';

@Component({
  selector: 'app-work-form',
  templateUrl: './work-form.page.html',
  styleUrls: ['./work-form.page.scss'],
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
    IonDatetime,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonBackButton
  ]
})
export class WorkFormPage implements OnInit {
  workForm: FormGroup;
  isEditMode = false;
  workId: string | null = null;
  pageTitle = 'Nuevo Proyecto';

  statusOptions = [
    { value: WorkStatus.ACTIVA, label: 'Activa' },
    { value: WorkStatus.FINALIZADA, label: 'Finalizada' },
    { value: WorkStatus.SUSPENDIDA, label: 'Suspendida' },
    { value: WorkStatus.CANCELADA, label: 'Cancelada' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private workService: WorkService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ save, close, arrowBack, calendar });
    
    this.workForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      clientName: [''],
      status: [WorkStatus.ACTIVA, [Validators.required]],
      startDate: [new Date().toISOString(), [Validators.required]],
      estimatedEndDate: [''],
      totalMaterialsCost: [0, [Validators.min(0)]],
      assignedTechnicians: [[]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.workId = id;
      this.pageTitle = 'Editar Proyecto';
      this.loadWork(id);
    }
  }

  async loadWork(id: string) {
    const loading = await this.loadingController.create({
      message: 'Cargando proyecto...'
    });
    await loading.present();

    this.workService.getWorkById(id).subscribe({
      next: (work) => {
        loading.dismiss();
        if (work) {
          this.workForm.patchValue({
            name: work.name,
            description: work.description,
            location: work.location,
            clientName: work.clientName || '',
            status: work.status,
            startDate: new Date(work.startDate).toISOString(),
            estimatedEndDate: work.estimatedEndDate ? new Date(work.estimatedEndDate).toISOString() : '',
            totalMaterialsCost: work.totalMaterialsCost || 0,
            assignedTechnicians: work.assignedTechnicians || []
          });
        } else {
          this.showToast('Proyecto no encontrado', 'danger');
          this.router.navigate(['/tabs/works']);
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Error al cargar el proyecto', 'danger');
        this.router.navigate(['/tabs/works']);
      }
    });
  }

  async onSubmit() {
    if (this.workForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEditMode ? 'Actualizando proyecto...' : 'Creando proyecto...'
      });
      await loading.present();

      const formValue = this.workForm.value;
      
      // Convertir fechas
      const workData = {
        ...formValue,
        startDate: new Date(formValue.startDate),
        estimatedEndDate: formValue.estimatedEndDate ? new Date(formValue.estimatedEndDate) : undefined
      };

      // Si el estado se cambia a finalizada, agregar fecha de fin
      if (workData.status === WorkStatus.FINALIZADA && this.isEditMode) {
        workData.endDate = new Date();
      }
      
      if (this.isEditMode && this.workId) {
        this.workService.updateWork(this.workId, workData).subscribe({
          next: (work) => {
            loading.dismiss();
            this.showToast('Proyecto actualizado exitosamente', 'success');
            this.router.navigate(['/tabs/works']);
          },
          error: (error) => {
            loading.dismiss();
            this.showToast('Error al actualizar el proyecto', 'danger');
          }
        });
      } else {
        this.workService.addWork(workData).subscribe({
          next: (work) => {
            loading.dismiss();
            this.showToast('Proyecto creado exitosamente', 'success');
            this.router.navigate(['/tabs/works']);
          },
          error: (error) => {
            loading.dismiss();
            this.showToast('Error al crear el proyecto', 'danger');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.showToast('Por favor complete todos los campos requeridos', 'warning');
    }
  }

  markFormGroupTouched() {
    Object.keys(this.workForm.controls).forEach(key => {
      const control = this.workForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.workForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.workForm.get(fieldName);
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

  cancel() {
    this.router.navigate(['/tabs/works']);
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
