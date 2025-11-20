import { Component } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-saving',
  imports: [Sidebar, Header, RouterLink],
  templateUrl: './add-saving.html',
  styleUrl: './add-saving.scss',
})
export class AddSaving {

}
