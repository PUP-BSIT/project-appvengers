import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-reports',
  imports: [Sidebar, Header],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {

}
