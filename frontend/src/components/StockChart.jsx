import React, { useEffect, useState, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";

/**
 * Custom SVG component to render the pulsating dot and price tag
 * at the end of the line chart.
 */
const LastPriceDot = ({ cx, cy, value, basePrice }) => {
    const isAbove = value >= basePrice;
    const color = isAbove ? "#16a34a" : "#dc2626"; // Green or Red

    return (
        <g>
            <circle cx={cx} cy={cy} r={4} fill={color} />
            <rect
                x={cx + 8}
                y={cy - 12}
                rx={4}
                ry={4}
                width={52}
                height={20}
                fill={color}
            />
            <text
                x={cx + 34}
                y={cy + 3}
                textAnchor="middle"
                fontSize="12"
                fill="#fff"
                fontWeight="bold"
            >
                {value}
            </text>
        </g>
    );
};

export default function StockChart() {
    const [data, setData] = useState([]);
    const basePrice = 100;

    // Refs used to maintain state inside the interval without triggering re-renders
    const step = useRef(0);
    const tick = useRef(0);

    useEffect(() => {
        // Simulating live market data feed
        const interval = setInterval(() => {
            step.current += 0.12;
            tick.current += 1;

            // Generate realistic-looking volatility using sine waves + noise
            const wave = Math.sin(step.current) * 3;
            const noise = Math.sin(step.current * 2.5) * 0.4;
            const price = +(basePrice + wave + noise).toFixed(2);

            setData(prev => {
                // Keep only the last 30 data points for performance
                const newData = [...prev, {
                    index: tick.current,
                    time: new Date().toLocaleTimeString(),
                    price
                }];
                return newData.slice(-30);
            });

        }, 1000); // Updates every 1 second

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-64 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-500">Live Market: VAULT Index</h3>
                <span className="text-xs text-gray-400 animate-pulse">● Live</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="index" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <ReferenceLine y={basePrice} stroke="#9ca3af" strokeDasharray="3 3" />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={(props) => {
                            // Only render the custom dot for the very last data point
                            if (props.index !== data.length - 1) return null;
                            return <LastPriceDot {...props} basePrice={basePrice} />;
                        }}
                        isAnimationActive={false} // Disable animation for smoother real-time updates
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}