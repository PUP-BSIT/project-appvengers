import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-savings',
  imports: [Sidebar, Header],
  templateUrl: './savings.html',
  styleUrl: './savings.scss',
})
export class Savings {

}
