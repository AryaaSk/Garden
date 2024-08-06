import { Injectable } from '@angular/core';




export interface Category { //contains data about category's habits, tree status
  id: string;
  tree: Tree;

  habits: Habit[];
  currentHabitIndex: number; //stores which habit is currently next to complete
}
export interface Tree {
  type: "oak"
  hydration: number; //0 to 100 inclusive, when at 0 tree dies, and when at 100 the tree moves onto the next growth level
  growthLevel: number; //natural numbers (1, 2, 3, etc...)

  //for oak, there will be 8 growth levels

  //the ground plane is 20x20m, therefore we will allocate 16 square blocks each of size 5x5m
  //this gives possible positions starting from bottom-left (-7.5, -7.5) to top-right (7.5, 7.5)
  position: { x: number, z: number }

  //there are two ways to implement dehydration: either the tree dehydrates at a set time everyday or the tree dehydrates a set time after being watered everyday
  //it would be more realistic to dehydrate at a set time everyday (e.g. 00:00 and 12:00)
  nextDehydration: number; //epoch time in ms of next dehydration
}
export interface Habit {
  id: string;
  hydrationReward: number; //for MVP, all habits provide same hydration reward
}



export interface Log {
  epochTime: number; //epoch time in ms when log occurs
  categoryID: string;
  habitID: string;
  description: string;
}



export interface UserData {
  categories: Category[];
  history: Log[]; //logs will be added in chronological order
}



@Injectable({
  providedIn: 'root'
})
export class DataServiceService {

  userDataKey = "userData";
  userData: UserData = this.GenerateDefaultData();

  constructor() { }

  //Persistance

  SaveData() {
    const json = JSON.stringify(this.userData);
    console.log(json)
    localStorage.setItem(this.userDataKey, json);
  }

  GenerateDefaultData(): UserData {
    return { categories: [], history: [] };
  }
  RetrieveData() {
    //check local storage for user data; if not present then generate some fresh user data
    const json = localStorage.getItem(this.userDataKey)!;
    if (json == undefined || json == null) {
      this.userData = this.GenerateDefaultData();
      this.SaveData();
      return;
    };

    this.userData = JSON.parse(json);
    this.DehydrateTrees();
    console.log(this.userData);
  }

  DehydrateTrees() {
    //go through each category's tree, and check how many dehydrations are due and apply that
    const dehyrationCost = 14; //default hydration is 30, so 14 will provide 3 days of leeway

    const epochTime = Date.now();
    const dehydrationInterval = 86400000; //ms in 1 day: dehydrate once per day

    const categoryIDsToDelete: string[] = [];

    for (const category of this.userData.categories) {
      const tree = category.tree;
      while (tree.nextDehydration <= epochTime) {
        tree.hydration -= dehyrationCost;
        tree.nextDehydration += dehydrationInterval
      }

      //check whether tree's hydration is <= 0
      if (tree.hydration <= 0) {
        console.log(`Tree of category with ID ${category.id} died`);
        categoryIDsToDelete.push(category.id);
      }
    }

    for (const id of categoryIDsToDelete) {
      this.DeleteCategory(id);
    }
  }


  //CRUD
  //ChatGPT: 'Javascript function to round up to the next nearest multiple of n'
  RoundUpToNearestMultiple(value: number, n: number) {
    if (n === 0) return value; // Avoid division by zero
    return Math.ceil(value / n) * n;
  }
  RoundToNearestMultiple(value: number, n: number) {
    if (n === 0) return value;
    return Math.round(value / n) * n;
  }
  AddCategory(id: string, treePosition: { x: number, z: number }) {
    //go through all categories and check each tree's position
    //throw error if there is tree with same position
    for (const category of this.userData.categories) {
      const tree = category.tree;
      const position = tree.position;
      if (position.x == treePosition.x && position.z == treePosition.z) {
        throw new Error("There is already a tree in that position!");
      }
    }

    //dehydration occurs at every midnight
    //Midnight epoch time in seconds: 86400n, where n is a natural number
    const epochTimeSeconds = Date.now() / 1000;
    const nextMidnightMS = this.RoundUpToNearestMultiple(epochTimeSeconds, 86400) * 1000;

    const newTree: Tree = {
      type: "oak",
      hydration: 30,
      growthLevel: 1,
      position: treePosition,
      nextDehydration: nextMidnightMS
    }

    this.userData.categories.push({
      id: id,
      tree: newTree,
      habits: [],
      currentHabitIndex: 0 //no habits yet, so this out of range exception needs to be handled
    })
    this.SaveData();
  }

  GetCategoryIndex(categoryID: string) {
    //we can just use a linear search to retrieve the category with ID, since there won't be a very large number of categories
    let categoryIndex = 0;
    while (categoryIndex < this.userData.categories.length && this.userData.categories[categoryIndex].id != categoryID) {
      categoryIndex += 1;
    }

    if (categoryIndex == this.userData.categories.length) { //category with given ID doesn't exist
      throw new Error(`Category with ID ${categoryID} does not exist`);
    }
    else {
      return categoryIndex;
    }
  }

  AddHabit(categoryID: string, habitID: string) {
    try {
      const category = this.userData.categories[this.GetCategoryIndex(categoryID)];
      category.habits.push({
        id: habitID,
        hydrationReward: 20
      });
      this.SaveData();
    }
    catch (error) {
      console.error(error);
    }
  }

  DeleteCategory(categoryID: string) {
    try {
      const categoryIndex = this.GetCategoryIndex(categoryID);
      this.userData.categories.splice(categoryIndex, 1);
      this.SaveData();
    }
    catch (error) {
      console.log(error);
    }
  }

  DeleteHabit(categoryID: string, habitID: string) {
    try {
      const category = this.userData.categories[this.GetCategoryIndex(categoryID)];
      
      //find habit within category
      let habitIndex = 0;
      while (habitIndex < category.habits.length && category.habits[habitIndex].id != habitID) {
        habitIndex += 1;
      }

      if (habitIndex == category.habits.length) {
        console.log(`Habit with ID ${habitID} does not exist`);
      }
      else {
        category.habits.splice(habitIndex, 1);
        if (category.currentHabitIndex >= habitIndex) { //offset current index back if a previous habit is removed
          category.currentHabitIndex = Math.max(0, category.currentHabitIndex - 1);
        }
        this.SaveData();
      }
    }
    catch (categoryError) {
      console.log(categoryError);
    }
  }

  CompleteHabit(categoryID: string, description: string) {
    try {
      const category = this.userData.categories[this.GetCategoryIndex(categoryID)];
      const habitID = category.habits[category.currentHabitIndex].id;
      
      const hydrationReward = category.habits[category.currentHabitIndex].hydrationReward;

      //add hydration reward to category's tree and increment current habit index
      category.tree.hydration += hydrationReward;
      category.currentHabitIndex = (category.currentHabitIndex + 1) % category.habits.length;

      //check if hydration exceeds 100, if so then add 1 to growth level and reset to 30
      if (category.tree.hydration >= 100) {
        category.tree.growthLevel += 1;
        category.tree.hydration = 30;
      }

      //create a log
      const epochTime = Date.now();
      const log: Log = { epochTime: epochTime, categoryID: category.id, habitID: habitID, description: description };
      this.userData.history.push(log);
      this.SaveData();
    }
    catch (categoryError) {
      console.log(categoryError);
    }
  }
}
