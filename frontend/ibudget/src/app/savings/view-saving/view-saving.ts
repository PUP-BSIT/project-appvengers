import { Component } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";

@Component({
  selector: 'app-view-saving',
  imports: [Sidebar, Header],
  templateUrl: './view-saving.html',
  styleUrl: './view-saving.scss',
})
export class ViewSaving {

}
