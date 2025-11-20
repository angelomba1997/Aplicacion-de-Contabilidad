import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface ChartProps {
    transactions: Transaction[];
    onBarClick: (plate: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D4FF'];

// Define a type for aggregated plate data for type safety.
type PlateChartData = { name: string; Gastos: number; count: number };

const LicensePlateExpensesChart: React.FC<ChartProps> = ({ transactions, onBarClick }) => {
    const expensesWithPlates = transactions.filter(
        t => t.type === TransactionType.EXPENSE && t.licensePlates && t.licensePlates.length > 0
    );

    const dataByPlate = expensesWithPlates.reduce((acc, t) => {
        t.licensePlates?.forEach(plate => {
            if (!acc[plate]) {
                acc[plate] = { name: plate, Gastos: 0, count: 0 };
            }
            acc[plate].Gastos += t.amount;
            acc[plate].count += 1;
        });
        return acc;
    }, {} as Record<string, PlateChartData>);

    // FIX: Explicitly type the sort callback parameters. TypeScript was inferring 'a' and 'b' 
    // as 'unknown', causing an error when accessing the 'Gastos' property.
    const chartData = Object.values(dataByPlate).sort((a: PlateChartData, b: PlateChartData) => b.Gastos - a.Gastos);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No hay gastos asociados a matrículas este mes.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 5,
                }}
                onClick={(data) => {
                    if (data && data.activePayload && data.activePayload.length > 0) {
                        onBarClick(data.activePayload[0].payload.name);
                    }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('es-ES', { notation: "compact", compactDisplay: "short" }).format(value as number)} />
                <Tooltip 
                    formatter={(value, name, props) => [
                        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number),
                        `Gastos (${props.payload.count} trans.)`
                    ]}
                    labelFormatter={(label) => `Matrícula: ${label}`}
                    cursor={{fill: 'rgba(219, 234, 254, 0.4)'}}
                />
                <Legend wrapperStyle={{fontSize: "14px"}} />
                <Bar dataKey="Gastos" name="Total Gastos" radius={[4, 4, 0, 0]} cursor="pointer">
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default LicensePlateExpensesChart;