import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-transactions',
  imports: [Sidebar, Header],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {

}
