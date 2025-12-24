import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ChatVisualization } from '../chatbot.service';

/**
 * Reusable chart component for rendering visualizations in chat messages.
 * Supports doughnut, pie, bar, and line charts with automatic styling.
 */
@Component({
    selector: 'app-chat-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './chat-chart.html',
    styleUrl: './chat-chart.scss'
})
export class ChatChart implements OnChanges {
    @Input() visualization!: ChatVisualization;

    chartData!: ChartData;
    chartType!: ChartType;
    chartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 8,
                    font: { size: 11 }
                }
            },
            title: {
                display: false // We use custom title in HTML
            }
        }
    };

    // Default iBudget color palette
    private readonly defaultColors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
        '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
        '#16a085', '#c0392b', '#27ae60', '#d35400'
    ];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visualization'] && this.visualization) {
            this.buildChart();
        }
    }

    private buildChart(): void {
        const { type, data, colors } = this.visualization;

        this.chartType = type;

        const backgroundColors = colors || this.generateColors(data.labels.length);

        if (type === 'line') {
            this.chartData = {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    borderColor: backgroundColors[0],
                    backgroundColor: this.hexToRgba(backgroundColors[0], 0.2),
                    fill: true,
                    tension: 0.3
                }]
            };
            // Line chart specific options
            this.chartOptions = {
                ...this.chartOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { size: 10 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 10 }
                        }
                    }
                }
            };
        } else if (type === 'bar') {
            this.chartData = {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: backgroundColors.map(c => this.hexToRgba(c, 0.8)),
                    borderColor: backgroundColors,
                    borderWidth: 1
                }]
            };
            // Bar chart specific options
            this.chartOptions = {
                ...this.chartOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { size: 10 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 10 }
                        }
                    }
                }
            };
        } else {
            // Doughnut or Pie
            this.chartData = {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            };
            // Reset options for pie/doughnut (no scales)
            this.chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: { size: 11 }
                        }
                    }
                }
            };
        }
    }

    private generateColors(count: number): string[] {
        const colors: string[] = [];
        for (let i = 0; i < count; i++) {
            colors.push(this.defaultColors[i % this.defaultColors.length]);
        }
        return colors;
    }

    private hexToRgba(hex: string, alpha: number): string {
        // Handle rgb/rgba strings - return as-is
        if (hex.startsWith('rgb')) return hex;

        // Remove # if present
        hex = hex.replace('#', '');

        // Handle shorthand hex (e.g., #abc)
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
