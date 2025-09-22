import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-completed-tasks',
  templateUrl: './completed-tasks.component.html',
  standalone: false,
  styleUrls: ['./completed-tasks.component.scss']
})
export class CompletedTasksComponent implements OnInit {
  completedTasks: Task[] = [];
  filteredTasks: Task[] = [];
  isLoading = false;
  searchText = '';

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCompletedTasks();
  }

  loadCompletedTasks(): void {
    this.isLoading = true;
    this.taskService.getCompletedTasks().subscribe(
      (tasks) => {
        this.completedTasks = tasks;
        this.applyFilters();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading completed tasks', error);
        this.snackBar.open('Error loading completed tasks', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    );
  }

  deleteTask(task: Task, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading = true;
      
      this.taskService.deleteTask(task.id).subscribe(
        () => {
          this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
          this.loadCompletedTasks();
        },
        (error) => {
          console.error('Error deleting task', error);
          this.snackBar.open('Error deleting task', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      );
    }
  }

  applyFilters(): void {
    if (!this.searchText) {
      this.filteredTasks = [...this.completedTasks];
      return;
    }
    
    this.filteredTasks = this.completedTasks.filter(task => 
      task.description.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }

  formatCompletionDate(date: string): string {
    const completedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (completedDate.toDateString() === today.toDateString()) {
      return 'Today at ' + completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (completedDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday at ' + completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return completedDate.toLocaleDateString() + ' at ' + completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
}