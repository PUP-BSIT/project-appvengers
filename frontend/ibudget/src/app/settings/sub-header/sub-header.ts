import { Component, output } from '@angular/core';

@Component({
  selector: 'app-sub-header',
  imports: [],
  templateUrl: './sub-header.html',
  styleUrl: './sub-header.scss',
})
export class SubHeader {
  panelSelected =  output<string>();

  selectPanel(panelId: string) {
    this.panelSelected.emit(panelId);
  }
}
