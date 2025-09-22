import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';

interface TaskFormData {
  task?: Task;
}

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  standalone: false,
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormData,
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.task;
    
    this.taskForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(500)]],
      dueDate: [new Date(), Validators.required],
      isImportant: [false]
    });
    
    if (this.isEditMode && data.task) {
      this.taskForm.patchValue({
        description: data.task.description,
        dueDate: new Date(data.task.dueDate),
        isImportant: data.task.isImportant
      });
    }
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    const formValue = this.taskForm.value;
    
    if (this.isEditMode && this.data.task) {
      const updateRequest = {
        description: formValue.description,
        dueDate: formValue.dueDate.toISOString(),
        isImportant: formValue.isImportant
      };
      
      this.taskService.updateTask(this.data.task.id, updateRequest).subscribe(
        () => {
          this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
          this.isLoading = false;
        },
        (error) => {
          console.error('Error updating task', error);
          this.snackBar.open('Error updating task', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      );
    } else {
      const createRequest = {
        description: formValue.description,
        dueDate: formValue.dueDate.toISOString(),
        isImportant: formValue.isImportant
      };
      
      this.taskService.createTask(createRequest).subscribe(
        (task) => {
          this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
          this.isLoading = false;
        },
        (error) => {
          console.error('Error creating task', error);
          this.snackBar.open('Error creating task', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}