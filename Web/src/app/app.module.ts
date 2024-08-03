import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoryViewerComponent } from './UI/category-viewer/category-viewer.component';
import { PopupComponent } from './UI/popup/popup.component';
import { HistoryComponent } from './UI/history/history.component';

@NgModule({
  declarations: [
    AppComponent,
    CategoryViewerComponent,
    PopupComponent,
    HistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
