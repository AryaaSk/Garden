import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {

  @Output() ClosePopup = new EventEmitter<void>();

  constructor() { }

  Hide() {
    this.ClosePopup.emit();
  }
  MainBodyClicked($e: MouseEvent) {
    $e.stopPropagation();
  }

}
