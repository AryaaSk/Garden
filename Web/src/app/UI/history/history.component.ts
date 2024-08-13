import { Component, OnInit } from '@angular/core';
import { DataServiceService, Goal } from 'src/app/data-service.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  constructor(private data: DataServiceService) { }

  dayOffset = 0;
  dayLog: { [dayIndex: number]: { [categoryID: string]: { habitID: string, description: string }[] } } = {};
  categoryIDs: string[] = [];

  goals: Goal[] = [];

  ngOnInit(): void {
    //process logs into table format
    //date, category1, category2, category3 ...
    //within each category, habit1: description, habit2: description, habit3: description ...

    //group logs by the date on which they were recorded and their category
    this.dayLog = {};

    for (const log of this.data.userData.history) {
      //determine the number of days since Jan. 1 1970 by integer dividing log.epochTime by 86400000
      const daysSinceJan11970 = Math.floor(log.epochTime / 86400000);
      if (this.dayLog[daysSinceJan11970] == undefined) {
        this.dayLog[daysSinceJan11970] = {};
      }

      if (this.dayLog[daysSinceJan11970][log.categoryID] == undefined) {
        this.dayLog[daysSinceJan11970][log.categoryID] = [{ habitID: log.habitID, description: log.description }];
      }
      else {
        this.dayLog[daysSinceJan11970][log.categoryID].push({ habitID: log.habitID, description: log.description })
      }
    }

    //retrieve a list of all categories
    for (const category of this.data.userData.categories) {
      this.categoryIDs.push(category.id);
    }

    if (this.data.userData.history.length > 0) {
      //set offset to first day's key - 1 (so that logs start at day 1)
      const firstDayIndex = Number(Object.keys(this.dayLog)[0]);
      this.dayOffset = firstDayIndex - 1;
    }

    //link this.goals to data.userData.goals by reference
    this.goals = this.data.userData.goals;
  }

  Number(data: string) {
    return Number(data);
  }

  AddGoal() {
    const deliverable = prompt("What is your goal");
    if (deliverable == undefined || deliverable.replace(" ", "") == "") {
      return;
    }
    this.data.AddGoal(deliverable);
  }
  FlipGoal(goalIndex: number) {
    this.data.FlipGoal(goalIndex);
  }
  DeleteGoal(goalIndex: number) {
    this.data.DeleteGoal(goalIndex);
  }
}
