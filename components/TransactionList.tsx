
import React, { useState } from 'react';
import { Transaction, TransactionType, Order } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlusIcon, EditIcon, DeleteIcon } from './icons';

interface TransactionListProps {
    transactions: Transaction[];
    orders: Order[];
    isLoading: boolean;
    onAddTransaction: () => void;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (id: string) => void;
}

const TransactionRow: React.FC<{ transaction: Transaction; orders: Order[]; onEdit: () => void; onDelete: () => void; }> = ({ transaction, orders, onEdit, onDelete }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
    const amountPrefix = isIncome ? '+' : '-';
    const formattedAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(transaction.amount);
    const formattedDate = new Date(transaction.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const linkedOrder = orders.find(o => o.id === transaction.orderId);

    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-3 text-sm text-gray-700">{formattedDate}</td>
            <td className="p-3 text-sm text-gray-700 hidden sm:table-cell">{transaction.supplier}</td>
            <td className="p-3 text-sm text-gray-700">{transaction.category}</td>
            <td className="p-3 text-sm text-gray-500 font-mono hidden md:table-cell">
                {linkedOrder ? `PED: ${linkedOrder.orderNumber}` : `ALB: ${transaction.deliveryNoteNumber}`}
            </td>
            <td className="p-3 text-sm text-gray-700 hidden lg:table-cell">{transaction.licensePlates?.join(', ')}</td>
            <td className={`p-3 text-sm font-semibold text-right ${amountColor}`}>
                {amountPrefix}{formattedAmount}
            </td>
            <td className="p-3 text-right">
                <div className="flex justify-end items-center space-x-2">
                    <button onClick={onEdit} className="text-gray-400 hover:text-blue-500 p-1"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1"><DeleteIcon className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, orders, isLoading, onAddTransaction, onEditTransaction, onDeleteTransaction }) => {
    const [filter, setFilter] = useState('');

    const filteredTransactions = transactions.filter(t => 
        t.description.toLowerCase().includes(filter.toLowerCase()) ||
        t.category.toLowerCase().includes(filter.toLowerCase()) ||
        t.supplier.toLowerCase().includes(filter.toLowerCase()) ||
        t.deliveryNoteNumber.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Transacciones del Mes</h2>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por proveedor, albarán..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <Button onClick={onAddTransaction}>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nueva
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Proveedor</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Referencia</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Matrículas</th>
                            <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                            <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={7} className="text-center p-4">Cargando...</td></tr>
                        ) : filteredTransactions.length > 0 ? (
                            filteredTransactions.map(t => (
                                <TransactionRow 
                                    key={t.id} 
                                    transaction={t} 
                                    orders={orders}
                                    onEdit={() => onEditTransaction(t)} 
                                    onDelete={() => onDeleteTransaction(t.id)} 
                                />
                            ))
                        ) : (
                            <tr><td colSpan={7} className="text-center p-4">No se encontraron transacciones.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default TransactionList;
