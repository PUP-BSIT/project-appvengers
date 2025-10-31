import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-settings',
  imports: [Sidebar, Header],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

}
