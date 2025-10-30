import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-categories',
  imports: [Sidebar, Header],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {

}
