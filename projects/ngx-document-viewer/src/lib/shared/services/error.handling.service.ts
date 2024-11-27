import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService implements ErrorHandler {
  //private messageService:MessageService = inject(MessageService)
  constructor(private messageService: MessageService) {}
  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      this.throwError(error.message);
    } else {
      this.throwError(error?.message);
    }
    console.error(error)
  }

  throwError(error?: string) {
    const errorMessage = error || 'Something went wrong';
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
    });
  }
}
