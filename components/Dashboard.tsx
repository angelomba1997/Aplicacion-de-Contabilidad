import React, { useState, useMemo } from 'react';
import { MonthlySummary, Transaction, TransactionType } from '../types';
import IncomeExpenseChart from './charts/IncomeExpenseChart';
import CategoryPieChart from './charts/CategoryPieChart';
import AnnualChart from './charts/AnnualChart';
import Card from './ui/Card';
import LicensePlateExpensesChart from './charts/LicensePlateExpensesChart';
import Modal from './ui/Modal';

interface DashboardProps {
    summary: MonthlySummary;
    monthlyTransactions: Transaction[];
    yearlyTransactions: Transaction[];
    isLoading: boolean;
}

const StatCard: React.FC<{ title: string; amount: number; color: string }> = ({ title, amount, color }) => {
    const formattedAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    return (
        <Card>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className={`text-2xl font-semibold ${color}`}>{formattedAmount}</p>
        </Card>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ summary, monthlyTransactions, yearlyTransactions, isLoading }) => {
    const [drillDownPlate, setDrillDownPlate] = useState<string | null>(null);

    const handlePlateClick = (plate: string) => {
        setDrillDownPlate(plate);
    };

    const handleCloseDrillDown = () => {
        setDrillDownPlate(null);
    };

    const drillDownTransactions = useMemo(() => {
        if (!drillDownPlate) return [];
        return monthlyTransactions.filter(
            t => t.type === TransactionType.EXPENSE && t.licensePlates?.includes(drillDownPlate)
        );
    }, [drillDownPlate, monthlyTransactions]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><p>Cargando datos...</p></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Ingresos (Mes)" amount={summary.income} color="text-green-600" />
                <StatCard title="Total Gastos (Mes)" amount={summary.expenses} color="text-red-600" />
                <StatCard title="Saldo del Mes" amount={summary.balance} color={summary.balance >= 0 ? "text-blue-600" : "text-red-600"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Ingresos vs. Gastos (Mensual)</h3>
                        <div className="h-80">
                            <IncomeExpenseChart transactions={yearlyTransactions} />
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Distribución de Gastos (Mensual)</h3>
                         <div className="h-80">
                            <CategoryPieChart transactions={monthlyTransactions} />
                        </div>
                    </Card>
                </div>
            </div>

            <Card>
                <h3 className="text-lg font-semibold mb-2">Gastos por Matrícula (Mensual)</h3>
                <p className="text-sm text-gray-500 mb-4">Haz clic en una barra para ver el detalle de las transacciones.</p>
                <div className="h-96">
                    <LicensePlateExpensesChart transactions={monthlyTransactions} onBarClick={handlePlateClick} />
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold mb-4">Resumen Anual</h3>
                <div className="h-96">
                    <AnnualChart transactions={yearlyTransactions} />
                </div>
            </Card>

            {drillDownPlate && (
                <Modal isOpen={!!drillDownPlate} onClose={handleCloseDrillDown} title={`Detalle de Gastos - ${drillDownPlate}`}>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Fecha</th>
                                    <th scope="col" className="px-4 py-2">Categoría</th>
                                    <th scope="col" className="px-4 py-2">Descripción</th>
                                    <th scope="col" className="px-4 py-2 text-right">Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drillDownTransactions.map(t => (
                                    <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">{new Date(t.date).toLocaleDateString('es-ES')}</td>
                                        <td className="px-4 py-2">{t.category}</td>
                                        <td className="px-4 py-2">{t.description}</td>
                                        <td className="px-4 py-2 text-right font-medium text-red-600">
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;