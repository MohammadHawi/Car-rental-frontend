import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../services/task.service';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  standalone: false,
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isLoading = false;
  filterOptions = {
    showImportantOnly: false,
    showOverdueOnly: false,
    searchText: ''
  };

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getActiveTasks().subscribe(
      (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading tasks', error);
        this.snackBar.open('Error loading tasks', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    );
  }

  openTaskForm(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  deleteAll(): void {
    if (!this.tasks.length || this.isLoading) {
      return;
    }
    if (!confirm('Delete ALL active tasks? This cannot be undone.')) {
      return;
    }
    this.isLoading = true;
    this.taskService.deleteAllActiveTasks().subscribe(
      () => {
        this.snackBar.open('All active tasks deleted', 'Close', { duration: 3000 });
        this.loadTasks();
      },
      (error) => {
        console.error('Error deleting all tasks', error);
        this.snackBar.open('Error deleting tasks', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    );
  }

  completeTask(task: Task, event: Event): void {
    event.stopPropagation();
    this.isLoading = true;
    
    this.taskService.completeTask(task.id).subscribe(
      () => {
        this.snackBar.open('Task completed successfully', 'Close', { duration: 3000 });
        this.loadTasks();
      },
      (error) => {
        console.error('Error completing task', error);
        this.snackBar.open('Error completing task', 'Close', { duration: 3000 });
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
          this.loadTasks();
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
    this.filteredTasks = this.tasks.filter(task => {
      // Filter by importance
      if (this.filterOptions.showImportantOnly && !task.isImportant) {
        return false;
      }
      
      // Filter by overdue status
      if (this.filterOptions.showOverdueOnly && task.status !== TaskStatus.Overdue) {
        return false;
      }
      
      // Filter by search text
      if (this.filterOptions.searchText && !task.description.toLowerCase().includes(this.filterOptions.searchText.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }

  toggleImportantFilter(): void {
    this.filterOptions.showImportantOnly = !this.filterOptions.showImportantOnly;
    this.applyFilters();
  }

  toggleOverdueFilter(): void {
    this.filterOptions.showOverdueOnly = !this.filterOptions.showOverdueOnly;
    this.applyFilters();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterOptions.searchText = input.value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterOptions = {
      showImportantOnly: false,
      showOverdueOnly: false,
      searchText: ''
    };
    this.applyFilters();
  }

  getTaskStatusClass(task: Task): string {
    return task.status.toLowerCase();
  }

  getDaysRemaining(dueDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDueDateLabel(task: Task): string {
    const daysRemaining = this.getDaysRemaining(task.dueDate);
    
    if (task.status === TaskStatus.Overdue) {
      return `Overdue by ${Math.abs(daysRemaining)} day(s)`;
    }
    
    if (daysRemaining === 0) {
      return 'Due today';
    } else if (daysRemaining === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysRemaining} days`;
    }
  }

  getOverdueCount(): number {
    return this.tasks.filter(task => task.status === TaskStatus.Overdue).length;
  }

  getImportantCount(): number {
    return this.tasks.filter(task => task.isImportant).length;
  }
}