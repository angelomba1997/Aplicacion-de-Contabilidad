
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface ChartProps {
    transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D4FF'];

const CategoryPieChart: React.FC<ChartProps> = ({ transactions }) => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

    const dataByCategory = expenses.reduce((acc, t) => {
        if (!acc[t.category]) {
            acc[t.category] = { name: t.category, value: 0 };
        }
        acc[t.category].value += t.amount;
        return acc;
    }, {} as Record<string, { name: string; value: number }>);

    const chartData = Object.values(dataByCategory);
    
    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No hay datos de gastos para mostrar.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)} />
                <Legend wrapperStyle={{fontSize: "12px", overflowY: "auto", maxHeight: "100px"}} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CategoryPieChart;
