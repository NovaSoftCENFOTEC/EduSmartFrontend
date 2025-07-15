import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, ISearch, IGroup } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class GroupsService extends BaseService<IGroup> {
  protected override source: string = 'groups';
  private groupListSignal = signal<IGroup[]>([]);

  get groups$() {
    return this.groupListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  }

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: IResponse<IGroup[]>) => {

    
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
      
        this.groupListSignal.set(response.data);
        
      },
      error: (err: any) => {
        console.error('Error al obtener los grupos', err);
      }
    });

  }

  save(item: IGroup) {

    
    
    const courseId = item.course?.id;
    const teacherId = item.teacher?.id;
    
    if (!courseId) {
      this.alertService.displayAlert('error', 'Debe seleccionar un curso.', 'center', 'top', ['error-snackbar']);
      return;
    }
    
    if (!teacherId) {
      this.alertService.displayAlert('error', 'Debe seleccionar un profesor.', 'center', 'top', ['error-snackbar']);
      return;
    }

    const payload = {
      name: item.name
    };
    

    this.addCustomSource(`course/${courseId}/teacher/${teacherId}`, payload).subscribe({
      next: (response: IResponse<IGroup>) => {
        this.alertService.displayAlert(
          'success', 
          response.message || 'Grupo agregado correctamente.', 
          'center', 'top', 
          ['success-snackbar']
        );
        this.getAll();
      },
      error: (err) => {
        this.alertService.displayAlert(
          'error', 
          'Ocurrió un error al agregar el grupo.', 
          'center', 'top', 
          ['error-snackbar']
        );
        console.error('Error al guardar grupo:', err);
      }
    });
  }

  update(item: IGroup) {
 
  
  if (!item.id) {
    this.alertService.displayAlert('error', 'No se puede actualizar un grupo sin ID.', 'center', 'top', ['error-snackbar']);
    return;
  }
  

  const groupId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
  
  const payload = {
    name: item.name,
    course: {
      id: item.course?.id
    },
    teacher: {
      id: item.teacher?.id
    },
    students: item.students || [] 
  };
  
  
  
  this.edit(item.id, payload).subscribe({
    next: (response: IResponse<IGroup>) => {
     
      this.alertService.displayAlert('success', 'Grupo actualizado correctamente.', 'center', 'top', ['success-snackbar']);
      this.getAll(); 
    },
    error: (err: any) => {
      console.error('❌ Error del servidor:', err);
      
     
      if (err.status === 500 && err.error?.detail?.includes('Could not write JSON')) {
     
        this.alertService.displayAlert('success', 'Grupo actualizado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll(); 
      } else {
        
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar el grupo.', 'center', 'top', ['error-snackbar']);
      }
    }
  });
}

  delete(item: IGroup) {
    this.del(item.id!).subscribe({
      next: (response: IResponse<IGroup>) => {
        this.alertService.displayAlert('success', response.message || 'Grupo eliminado correctamente.', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al eliminar el grupo.', 'center', 'top', ['error-snackbar']);
        console.error('Error al eliminar el grupo', err);
      }
    });
  }




deleteStudentFromGroup(groupId: number, studentId: number) {
      this.delCustomSource(`${groupId}/students/${studentId}`).subscribe({
        next: (response: IResponse<any>) => {
            this.alertService.displayAlert(
                'success', 
                response.message || 'Estudiante eliminado del grupo correctamente.', 
                'center', 'top', 
                ['success-snackbar']
            );
            this.getAll(); 
        },
        error: (err: any) => {
            this.alertService.displayAlert(
                'error', 
                'Ocurrió un error al eliminar el estudiante del grupo.', 
                'center', 'top', 
                ['error-snackbar']
            );
            console.error('Error al eliminar estudiante del grupo', err);
        }
    });
    }

}
