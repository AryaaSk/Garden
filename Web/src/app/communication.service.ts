import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  deleteCategoryEvent = new EventEmitter<string>();

  completedHabitEvent = new EventEmitter<{ categoryID: string, description: string }>();

  constructor() {}
}
