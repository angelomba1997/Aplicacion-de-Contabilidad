import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface ChartProps {
    transactions: Transaction[];
}

const AnnualChart: React.FC<ChartProps> = ({ transactions }) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    const monthlyData = months.map((month, index) => ({
        name: month,
        monthIndex: index,
        Ingresos: 0,
        Gastos: 0,
    }));

    transactions.forEach(t => {
        const monthIndex = new Date(t.date).getMonth();
        if (t.type === TransactionType.INCOME) {
            monthlyData[monthIndex].Ingresos += t.amount;
        } else {
            monthlyData[monthIndex].Gastos += t.amount;
        }
    });
    
    let cumulativeBalance = 0;
    const chartData = monthlyData.map(data => {
        cumulativeBalance += data.Ingresos - data.Gastos;
        return {
            ...data,
            Saldo: cumulativeBalance,
        };
    });
    
    if (transactions.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No hay datos en este año para mostrar.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
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
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('es-ES', { notation: "compact", compactDisplay: "short" }).format(value as number)} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('es-ES', { notation: "compact", compactDisplay: "short" }).format(value as number)} />
                <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)}
                />
                <Legend wrapperStyle={{fontSize: "14px"}} />
                <Bar yAxisId="left" dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="Gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default AnnualChart;