import { Component } from '@angular/core';
import { Header } from "../header/header";
import { CategoriesPanel } from "./categories-panel/categories-panel";
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-categories',
  imports: [Header, CategoriesPanel, ToggleableSidebar],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {

}
