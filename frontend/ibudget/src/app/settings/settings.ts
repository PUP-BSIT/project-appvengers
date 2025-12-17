import { Component } from '@angular/core';
import { Header } from "../header/header";
import { SubHeader } from './sub-header/sub-header';
import { RouterOutlet } from '@angular/router';
import { Account } from "./account/account";
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-settings',
  imports: [Header, SubHeader, RouterOutlet, ToggleableSidebar],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

}
