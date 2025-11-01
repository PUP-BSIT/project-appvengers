import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { SubHeader } from "../header/sub-header/sub-header";

@Component({
  selector: 'app-settings',
  imports: [Sidebar, Header, SubHeader],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

}
