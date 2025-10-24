import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5008/api/tasks';

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getActiveTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/active`);
  }

  getCompletedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/completed`);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: UpdateTaskRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task);
  }

  completeTask(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/complete`, {});
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Attempts bulk delete via API; if unsupported, falls back to deleting each active task
  deleteAllActiveTasks(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}?status=active`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 || error.status === 405) {
          // Fallback: fetch active tasks then delete individually
          return this.getActiveTasks().pipe(
            switchMap((tasks) => {
              if (!tasks || tasks.length === 0) {
                return of(void 0);
              }
              const deletions = tasks.map(t => this.deleteTask(t.id));
              return forkJoin(deletions).pipe(switchMap(() => of(void 0)));
            })
          );
        }
        throw error;
      })
    );
  }
}