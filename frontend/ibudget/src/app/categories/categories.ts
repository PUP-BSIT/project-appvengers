import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { CategoriesPanel } from "./categories-panel/categories-panel";

@Component({
  selector: 'app-categories',
  imports: [Sidebar, Header, CategoriesPanel],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {

}
