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
  ModalController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, business, location, calendar, people } from 'ionicons/icons';
import { Work, WorkStatus } from '../../shared/models';
import { WorkService } from '../../shared/services';

@Component({
  selector: 'app-work-form-modal',
  standalone: true,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="workForm" (ngSubmit)="onSubmit()">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="business" color="primary"></ion-icon>
              Información del Proyecto
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12">
                  <ion-item fill="outline">
                    <ion-label position="floating">Nombre del Proyecto *</ion-label>
                    <ion-input 
                      formControlName="name" 
                      placeholder="Ingrese el nombre del proyecto"
                      [class.ion-invalid]="workForm.get('name')?.invalid && workForm.get('name')?.touched">
                    </ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="workForm.get('name')?.invalid && workForm.get('name')?.touched">
                    <small>El nombre del proyecto es requerido</small>
                  </div>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="12">
                  <ion-item fill="outline">
                    <ion-label position="floating">Descripción *</ion-label>
                    <ion-textarea 
                      formControlName="description" 
                      placeholder="Descripción detallada del proyecto"
                      rows="3"
                      [class.ion-invalid]="workForm.get('description')?.invalid && workForm.get('description')?.touched">
                    </ion-textarea>
                  </ion-item>
                  <div class="error-message" *ngIf="workForm.get('description')?.invalid && workForm.get('description')?.touched">
                    <small>La descripción es requerida</small>
                  </div>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Ubicación *</ion-label>
                    <ion-input 
                      formControlName="location" 
                      placeholder="Ubicación del proyecto"
                      [class.ion-invalid]="workForm.get('location')?.invalid && workForm.get('location')?.touched">
                      <ion-icon name="location" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="workForm.get('location')?.invalid && workForm.get('location')?.touched">
                    <small>La ubicación es requerida</small>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Cliente</ion-label>
                    <ion-input 
                      formControlName="clientName" 
                      placeholder="Nombre del cliente">
                      <ion-icon name="people" slot="start" color="medium"></ion-icon>
                    </ion-input>
                  </ion-item>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Estado</ion-label>
                    <ion-select formControlName="status" placeholder="Seleccione el estado">
                      <ion-select-option value="activa">Activa</ion-select-option>
                      <ion-select-option value="finalizada">Finalizada</ion-select-option>
                      <ion-select-option value="suspendida">Suspendida</ion-select-option>
                      <ion-select-option value="cancelada">Cancelada</ion-select-option>
                    </ion-select>
                  </ion-item>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Fecha de Inicio *</ion-label>
                    <ion-datetime 
                      formControlName="startDate" 
                      presentation="date"
                      [max]="today"
                      [class.ion-invalid]="workForm.get('startDate')?.invalid && workForm.get('startDate')?.touched">
                      <ion-icon name="calendar" slot="start" color="medium"></ion-icon>
                    </ion-datetime>
                  </ion-item>
                  <div class="error-message" *ngIf="workForm.get('startDate')?.invalid && workForm.get('startDate')?.touched">
                    <small>La fecha de inicio es requerida</small>
                  </div>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-col size="12" size-md="6">
                  <ion-item fill="outline">
                    <ion-label position="floating">Fecha Estimada de Finalización</ion-label>
                    <ion-datetime 
                      formControlName="estimatedEndDate" 
                      presentation="date"
                      [min]="workForm.get('startDate')?.value">
                      <ion-icon name="calendar" slot="start" color="medium"></ion-icon>
                    </ion-datetime>
                  </ion-item>
                </ion-col>

                <ion-col size="12" size-md="6" *ngIf="workForm.get('status')?.value === 'finalizada'">
                  <ion-item fill="outline">
                    <ion-label position="floating">Fecha de Finalización</ion-label>
                    <ion-datetime 
                      formControlName="endDate" 
                      presentation="date"
                      [min]="workForm.get('startDate')?.value"
                      [max]="today">
                      <ion-icon name="calendar" slot="start" color="medium"></ion-icon>
                    </ion-datetime>
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
            [disabled]="!workForm.valid">
            <ion-icon name="save" slot="start"></ion-icon>
            {{ isEdit ? 'Actualizar' : 'Crear' }} Proyecto
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

    ion-datetime {
      padding: 8px 0;
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
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class WorkFormModalComponent implements OnInit {
  @Input() work?: Work;
  @Input() isEdit: boolean = false;

  workForm: FormGroup;
  today = new Date().toISOString();

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private workService: WorkService,
    private fb: FormBuilder
  ) {
    addIcons({ close, save, business, location, calendar, people });
    
    this.workForm = this.createForm();
  }

  ngOnInit() {
    if (this.isEdit && this.work) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', [Validators.required]],
      clientName: [''],
      status: [WorkStatus.ACTIVA, Validators.required],
      startDate: [new Date().toISOString(), Validators.required],
      estimatedEndDate: [''],
      endDate: ['']
    });
  }

  populateForm() {
    if (this.work) {
      this.workForm.patchValue({
        name: this.work.name,
        description: this.work.description,
        location: this.work.location,
        clientName: this.work.clientName || '',
        status: this.work.status,
        startDate: this.work.startDate,
        estimatedEndDate: this.work.estimatedEndDate || '',
        endDate: this.work.endDate || ''
      });
    }
  }

  async onSubmit() {
    if (this.workForm.valid) {
      const loading = await this.loadingController.create({
        message: this.isEdit ? 'Actualizando proyecto...' : 'Creando proyecto...'
      });
      await loading.present();

      try {
        const formValue = this.workForm.value;
        
        if (this.isEdit && this.work) {
          const updates: Partial<Work> = {
            ...formValue,
            updatedAt: new Date()
          };
          
          const updatedWork = await this.workService.updateWork(this.work.id, updates).toPromise();
          await this.modalController.dismiss(updatedWork);
        } else {
          const newWork: Omit<Work, 'id' | 'createdAt' | 'updatedAt'> = {
            ...formValue,
            assignedTechnicians: []
          };
          
          const createdWork = await this.workService.addWork(newWork).toPromise();
          await this.modalController.dismiss(createdWork);
        }
        
        await this.showToast(
          this.isEdit ? 'Proyecto actualizado exitosamente' : 'Proyecto creado exitosamente',
          'success'
        );
      } catch (error) {
        console.error('Error al procesar proyecto:', error);
        await this.showToast('Error al procesar el proyecto', 'danger');
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
