import { Component } from '@angular/core';
import { Header } from "../../header/header";
import { Sidebar } from "../../sidebar/sidebar";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-update-saving',
  imports: [Header, Sidebar, RouterLink],
  templateUrl: './update-saving.html',
  styleUrl: './update-saving.scss',
})
export class UpdateSaving {

}
