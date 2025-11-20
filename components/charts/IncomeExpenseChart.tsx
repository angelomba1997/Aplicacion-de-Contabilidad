import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface ChartProps {
    transactions: Transaction[];
}

type MonthlyChartData = { name: string; Ingresos: number; Gastos: number };

const IncomeExpenseChart: React.FC<ChartProps> = ({ transactions }) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    // Initialize data structure for all 12 months
    const chartData: MonthlyChartData[] = months.map(month => ({
        name: month,
        Ingresos: 0,
        Gastos: 0,
    }));

    // Aggregate transaction data by month
    transactions.forEach(t => {
        const monthIndex = new Date(t.date).getMonth();
        if (t.type === TransactionType.INCOME) {
            chartData[monthIndex].Ingresos += t.amount;
        } else {
            chartData[monthIndex].Gastos += t.amount;
        }
    });

    if (transactions.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No hay datos en este año para mostrar.</div>;
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
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('es-ES', { notation: "compact", compactDisplay: "short" }).format(value as number)} />
                <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)}
                    labelFormatter={(label) => `Mes: ${label}`}
                />
                <Legend wrapperStyle={{fontSize: "14px"}} />
                <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default IncomeExpenseChart;