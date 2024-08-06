import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category, DataServiceService } from 'src/app/data-service.service';
import { CommunicationService } from 'src/app/communication.service';

@Component({
  selector: 'app-category-viewer',
  templateUrl: './category-viewer.component.html',
  styleUrls: ['./category-viewer.component.css']
})
export class CategoryViewerComponent implements OnInit {

  constructor(private data: DataServiceService, private communication: CommunicationService, private route: ActivatedRoute) { }

  category!: Category;
  editingHabits = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const categoryID = params["categoryID"];

      //extract data with this given category ID
      for (const category of this.data.userData.categories) {
        if (category.id == categoryID) {
          this.category = category;
        }
      }
    });
  }

  DeleteCategory() {
    //handle category deletion from main app component (to show tree deletion animation)
    this.communication.deleteCategoryEvent.emit(this.category.id);
  }

  AddHabit() {
    const name = prompt("Habit name");
    if (name == undefined || name.replace(" ", "") == "") {
      return;
    }

    this.data.AddHabit(this.category.id, name);
  }
  DeleteHabit(habitID: string) {
    this.data.DeleteHabit(this.category.id, habitID);
  }

  CompleteHabit() {
    const description = prompt("What did you do?");
    if (description == undefined || description.replace(" ", "") == "") {
      return;
    }

    //execute complete habit flow from main app component
    this.communication.completedHabitEvent.emit({ categoryID: this.category.id, description: description });
  }
}
