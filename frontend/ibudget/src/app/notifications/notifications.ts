import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-notifications',
  imports: [Sidebar, Header],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {

}
