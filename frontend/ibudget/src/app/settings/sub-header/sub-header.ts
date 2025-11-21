import { Component, inject, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sub-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sub-header.html',
  styleUrl: './sub-header.scss',
})
export class SubHeader {
  router = inject(Router);

  selectSettingPanel(panel: string) {
    this.router.navigate([panel]);
  }
}
