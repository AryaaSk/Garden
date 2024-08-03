import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryViewerComponent } from './UI/category-viewer/category-viewer.component';
import { HistoryComponent } from './UI/history/history.component';

const routes: Routes = [
  { path: 'category', component: CategoryViewerComponent },
  { path: 'history', component: HistoryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
