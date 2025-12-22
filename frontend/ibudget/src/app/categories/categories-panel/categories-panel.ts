import { AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from "ng2-charts";

@Component({
  selector: 'app-categories-panel',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
})

export class CategoriesPanel {
  
}
