import { Component, inject, signal } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { SubHeader } from './sub-header/sub-header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [Sidebar, Header, SubHeader, RouterOutlet],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

}
