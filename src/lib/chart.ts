import ChartJsImage from 'chartjs-to-image';
import { PriceList } from './stonk';

export function genPriceChart(prices: PriceList[], volumes: PriceList[], open?: number): ChartJsImage {
    const chartColor = (open) && open > prices[prices.length-1].y ? 'rgba(231, 76, 60,1.0)' : 'rgba(46, 204, 113,1.0)';
    const chart = new ChartJsImage();
    chart.setConfig({
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'stonks',
                    data: prices,
                    fill: false,
                    borderColor: chartColor
                },
                {
                    label: 'line',
                    data: [
                        {
                            x: prices[0].x,
                            y: open
                        },
                        {
                            x: prices[prices.length - 1].x,
                            y: open
                        }
                    ],
                    fill: false,
                    borderDash: [10, 5],
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                }
            ]
        },
        options: {
            backgroundColor: 'transparent',
            legend: {
                display: false
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            scales: {
                xAxes: [
                    {
                        type: 'time',
                        position: 'bottom',
                        distribution: 'series',
                        gridLines: {
                            display: true,
                            color: 'rgba(255, 255, 255, 0.35)'
                        }
                    }
                ],
                yAxes: [
                    {
                        gridLines: {
                            display: true,
                            color: 'rgba(255, 255, 255, 0.35)'
                        }
                    }
                ]
            }
        }
    });

    return chart;
}