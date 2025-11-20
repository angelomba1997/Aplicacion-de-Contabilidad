
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlusIcon, EditIcon, DeleteIcon, CheckCircleIcon } from './icons';

interface OrdersProps {
    orders: Order[];
    isLoading: boolean;
    onAddOrder: () => void;
    onEditOrder: (order: Order) => void;
    onDeleteOrder: (id: string) => void;
    onSaveOrder: (order: Order) => void; // For status changes
}

const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING:
            return 'bg-yellow-100 text-yellow-800';
        case OrderStatus.PARTIALLY_PAID:
            return 'bg-cyan-100 text-cyan-800';
        case OrderStatus.RECEIVED:
            return 'bg-blue-100 text-blue-800';
        case OrderStatus.PAID:
            return 'bg-green-100 text-green-800';
        case OrderStatus.CANCELLED:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const OrderRow: React.FC<{ order: Order; onEdit: () => void; onDelete: () => void; onStatusChange: (status: OrderStatus) => void; }> = ({ order, onEdit, onDelete, onStatusChange }) => {
    const formattedTotalAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.amount);
    const formattedPaidAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.paidAmount);
    const formattedDate = new Date(order.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const statusClasses = getStatusStyles(order.status);

    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-3 text-sm text-gray-700">{formattedDate}</td>
            <td className="p-3 text-sm font-mono text-gray-600">
                 <div className="flex items-center gap-2">
                    {order.status === OrderStatus.PAID && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    <span>{order.orderNumber}</span>
                </div>
            </td>
            <td className="p-3 text-sm text-gray-700">{order.supplier}</td>
            <td className="p-3 text-sm text-gray-700 text-right">
                <div className="flex flex-col">
                    <span className="font-semibold">{formattedTotalAmount}</span>
                    {(order.paidAmount > 0 || order.status === OrderStatus.PAID) && (
                        <span className="text-xs text-gray-500" title="Importe Pagado">
                            Pagado: {formattedPaidAmount}
                        </span>
                    )}
                </div>
            </td>
            <td className="p-3 text-sm text-center">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}>
                    {order.status}
                </span>
            </td>
            <td className="p-3 text-right">
                <div className="flex justify-end items-center space-x-2">
                     <select 
                        value={order.status} 
                        onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
                        className="text-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        disabled={order.status === OrderStatus.CANCELLED || order.status === OrderStatus.PAID || order.status === OrderStatus.PARTIALLY_PAID}
                        aria-label="Cambiar estado del pedido"
                    >
                        <option value={OrderStatus.PENDING}>Pendiente</option>
                        <option value={OrderStatus.PARTIALLY_PAID} disabled>Parcialmente Pagado</option>
                        <option value={OrderStatus.RECEIVED}>Recibido</option>
                        <option value={OrderStatus.PAID} disabled>Pagado</option>
                        <option value={OrderStatus.CANCELLED}>Cancelar</option>
                    </select>
                    <button onClick={onEdit} className="text-gray-400 hover:text-blue-500 p-1" aria-label="Editar pedido"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1" aria-label="Eliminar pedido"><DeleteIcon className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};


const Orders: React.FC<OrdersProps> = ({ orders, isLoading, onAddOrder, onEditOrder, onDeleteOrder, onSaveOrder }) => {
    const [supplierFilter, setSupplierFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredOrders = useMemo(() => orders.filter(o =>
        (o.supplier.toLowerCase().includes(supplierFilter.toLowerCase()) ||
         o.orderNumber.toLowerCase().includes(supplierFilter.toLowerCase())) &&
        (statusFilter === '' || o.status === statusFilter)
    ), [orders, supplierFilter, statusFilter]);
    
    const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
        onSaveOrder({ ...order, status: newStatus });
    };

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Gestión de Pedidos</h2>
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por Nº o Proveedor..."
                        value={supplierFilter}
                        onChange={(e) => setSupplierFilter(e.target.value)}
                        className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                     <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        className="block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                     >
                        <option value="">Todos los estados</option>
                        <option value={OrderStatus.PENDING}>Pendiente</option>
                        <option value={OrderStatus.PARTIALLY_PAID}>Parcialmente Pagado</option>
                        <option value={OrderStatus.RECEIVED}>Recibido</option>
                        <option value={OrderStatus.PAID}>Pagado</option>
                        <option value={OrderStatus.CANCELLED}>Cancelado</option>
                    </select>
                    <Button onClick={onAddOrder}>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nuevo Pedido
                    </Button>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Pedido</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                            <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                            <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                         {isLoading ? (
                            <tr><td colSpan={6} className="text-center p-4">Cargando...</td></tr>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map(o => (
                                <OrderRow 
                                    key={o.id} 
                                    order={o}
                                    onEdit={() => onEditOrder(o)} 
                                    onDelete={() => onDeleteOrder(o.id)}
                                    onStatusChange={(newStatus) => handleStatusChange(o, newStatus)}
                                />
                            ))
                        ) : (
                            <tr><td colSpan={6} className="text-center p-4">No se encontraron pedidos.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Orders;