import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Work, WorkStatus, WorkSummary } from '../models';
import { DatabaseService } from './database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class WorkService {
  private worksSubject = new BehaviorSubject<Work[]>([]);
  public works$ = this.worksSubject.asObservable();

  constructor(private databaseService: DatabaseService) {
    this.loadWorks();
  }

  private initializeDefaultWorks(): void {
    const works = this.worksSubject.value;
    if (works.length === 0) {
      const defaultWorks: Work[] = [
        {
          id: uuidv4(),
          name: 'Instalación Red Empresa ABC',
          description: 'Instalación de red completa para oficinas de Empresa ABC',
          location: 'Av. Cevallos 123, Ambato',
          clientName: 'Empresa ABC S.A.',
          status: WorkStatus.ACTIVA,
          startDate: new Date('2025-01-15'),
          estimatedEndDate: new Date('2025-02-15'),
          assignedTechnicians: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          name: 'Mantenimiento Red Hospital XYZ',
          description: 'Mantenimiento preventivo de infraestructura de red',
          location: 'Calle Bolívar 456, Ambato',
          clientName: 'Hospital XYZ',
          status: WorkStatus.ACTIVA,
          startDate: new Date('2025-01-20'),
          estimatedEndDate: new Date('2025-01-25'),
          assignedTechnicians: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      this.worksSubject.next(defaultWorks);
      this.saveWorks();
    }
  }

  getWorks(): Observable<Work[]> {
    return this.works$;
  }

  getActiveWorks(): Observable<Work[]> {
    return new Observable(observer => {
      const works = this.worksSubject.value;
      const activeWorks = works.filter(w => w.status === WorkStatus.ACTIVA);
      observer.next(activeWorks);
      observer.complete();
    });
  }

  getWorkById(id: string): Observable<Work | undefined> {
    return new Observable(observer => {
      const works = this.worksSubject.value;
      const work = works.find(w => w.id === id);
      observer.next(work);
      observer.complete();
    });
  }

  addWork(work: Omit<Work, 'id' | 'createdAt' | 'updatedAt'>): Observable<Work> {
    return new Observable(observer => {
      const newWork: Work = {
        ...work,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const works = this.worksSubject.value;
      works.push(newWork);
      this.worksSubject.next([...works]);
      this.saveWorks();

      observer.next(newWork);
      observer.complete();
    });
  }

  updateWork(id: string, updates: Partial<Work>): Observable<Work> {
    return new Observable(observer => {
      const works = this.worksSubject.value;
      const index = works.findIndex(w => w.id === id);
      
      if (index !== -1) {
        works[index] = {
          ...works[index],
          ...updates,
          updatedAt: new Date()
        };
        this.worksSubject.next([...works]);
        this.saveWorks();
        observer.next(works[index]);
      } else {
        observer.error(new Error('Obra no encontrada'));
      }
      observer.complete();
    });
  }

  finishWork(id: string): Observable<Work> {
    return this.updateWork(id, { 
      status: WorkStatus.FINALIZADA, 
      endDate: new Date() 
    });
  }

  assignTechnician(workId: string, technicianId: string): Observable<Work> {
    return new Observable(observer => {
      const works = this.worksSubject.value;
      const work = works.find(w => w.id === workId);
      
      if (!work) {
        observer.error(new Error('Obra no encontrada'));
        return;
      }

      if (!work.assignedTechnicians.includes(technicianId)) {
        work.assignedTechnicians.push(technicianId);
        work.updatedAt = new Date();
        this.worksSubject.next([...works]);
        this.saveWorks();
      }

      observer.next(work);
      observer.complete();
    });
  }

  removeTechnician(workId: string, technicianId: string): Observable<Work> {
    return new Observable(observer => {
      const works = this.worksSubject.value;
      const work = works.find(w => w.id === workId);
      
      if (!work) {
        observer.error(new Error('Obra no encontrada'));
        return;
      }

      const index = work.assignedTechnicians.indexOf(technicianId);
      if (index > -1) {
        work.assignedTechnicians.splice(index, 1);
        work.updatedAt = new Date();
        this.worksSubject.next([...works]);
        this.saveWorks();
      }

      observer.next(work);
      observer.complete();
    });
  }

  deleteWork(id: string): Observable<boolean> {
    return new Observable(observer => {
      const works = this.worksSubject.value;
      const index = works.findIndex(w => w.id === id);
      
      if (index !== -1) {
        works.splice(index, 1);
        this.worksSubject.next([...works]);
        this.saveWorks();
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  async loadWorks(): Promise<void> {
    try {
      const works = await this.databaseService.getWorks();
      const mappedWorks = works.map((w: any) => ({
        ...w,
        isActive: w.isActive === 1,
        startDate: new Date(w.startDate),
        estimatedEndDate: w.estimatedEndDate ? new Date(w.estimatedEndDate) : undefined,
        actualEndDate: w.actualEndDate ? new Date(w.actualEndDate) : undefined,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt)
      }));
      this.worksSubject.next(mappedWorks);
    } catch (error) {
      console.error('Error al cargar obras:', error);
    }
  }

  private saveWorks(): void {
    // Ya no necesario, se guarda directamente en la base de datos
  }
}
