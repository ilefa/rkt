import ChartJsImage from 'chartjs-to-image';

import { TrackingType, XpComparePayload, XpRecord } from './xp/struct';
import { PriceList } from './stonk';
import { COMPARISON_COLORS } from './util';

export function genPriceChart(prices: PriceList[], open?: number): ChartJsImage {
    const chartColor = (open) && open > prices[prices.length - 1].y 
        ? 'rgba(231, 76, 60,1.0)' 
        : 'rgba(46, 204, 113,1.0)';

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

export function genXpChart(records: XpRecord[], type: TrackingType): ChartJsImage {
    const chart = new ChartJsImage();
    const dataset = type === 'xp' 
        ? {
            label: 'Experience',
            data: records.map(record => {
                let time = new Date(record[0].time);
                time.setHours(time.getHours() - 5);

                return {
                    x: new Date(time.getTime()),
                    y: record[0].experience
                }
            }),
            fill: false,
            borderColor: 'rgba(46, 204, 113,1.0)'
        }
        : type === 'messages' 
            ? {
                label: 'Messages',
                data: records.map(record => {
                    let time = new Date(record[0].time);
                    time.setHours(time.getHours() - 5);

                    return {
                        x: new Date(time.getTime()),
                        y: record[0].messages
                    }
                }),                    
                fill: false,
                borderColor: 'rgba(104, 109, 224,1.0)'
            } 
            : type === 'position' 
                ? {
                    label: 'Position',
                    data: records.map(record => {
                        let time = new Date(record[0].time);
                        time.setHours(time.getHours() - 5);

                        return {
                            x: new Date(time.getTime()),
                            y: record[0].position
                        }
                    }),                    
                    fill: false,
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                } 
                : null;
    if (!dataset) {
        return null;
    }

    chart.setConfig({
        type: 'line',
        data: {
            datasets: [dataset]
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

export function genXpCompareChart(records: XpComparePayload[], type: TrackingType): ChartJsImage {
    const chart = new ChartJsImage();
    const datasets: any[] = type === 'xp' 
        ? records.map((record, i) => {
            return {
                label: 'Experience',
                data: record.data.map(record => {
                    let time = new Date(record[0].time);
                    time.setHours(time.getHours() - 5);

                    return {
                        x: new Date(time.getTime()),
                        y: record[0].experience
                    }
                }),
                fill: false,
                borderColor: COMPARISON_COLORS[i]
            }
        })
        : type === 'messages' 
            ? records.map((record, i) => {
                return {
                    label: 'Messages',
                    data: record.data.map(record => {
                        let time = new Date(record[0].time);
                        time.setHours(time.getHours() - 5);
    
                        return {
                            x: new Date(time.getTime()),
                            y: record[0].message
                        }
                    }),
                    fill: false,
                    borderColor: COMPARISON_COLORS[i]
                }
            }) 
            : type === 'position' 
                ? records.map((record, i) => {
                    return {
                        label: 'Positions',
                        data: record.data.map(record => {
                            let time = new Date(record[0].time);
                            time.setHours(time.getHours() - 5);
        
                            return {
                                x: new Date(time.getTime()),
                                y: record[0].position
                            }
                        }),
                        fill: false,
                        borderColor: COMPARISON_COLORS[i]
                    }
                }) 
                : null;
    if (!datasets) {
        return null;
    }

    chart.setConfig({
        type: 'line',
        data: { datasets },
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