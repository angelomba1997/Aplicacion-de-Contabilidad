
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, Supplier } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { DeleteIcon } from './icons';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: Omit<Order, 'id'> | Order) => void;
    order: Order | null;
    suppliers: Supplier[];
    onAddNewSupplier: (name: string) => Promise<Supplier>;
    onDeleteSupplier: (id: string) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave, order, suppliers, onAddNewSupplier, onDeleteSupplier }) => {
    const getInitialState = (): Omit<Order, 'id'> => {
        if (order) return order;

        return {
            date: new Date().toISOString().split('T')[0],
            orderNumber: '',
            supplier: '',
            amount: 0,
            status: OrderStatus.PENDING,
            notes: '',
            paidAmount: 0,
        };
    };
    
    const [formData, setFormData] = useState(getInitialState);
    const [isAddingSupplier, setIsAddingSupplier] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');

    useEffect(() => {
        setFormData(getInitialState());
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order, isOpen]);
    
    const suppliersForDropdown = useMemo(() => {
        const allSuppliers = [...suppliers];
        if (order?.supplier && !suppliers.some(s => s.name === order.supplier)) {
            allSuppliers.push({ id: `readonly-${order.supplier}`, name: order.supplier });
        }
        return allSuppliers;
    }, [suppliers, order]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Omit<Order, 'id'> | Order);
    };
    
    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '__ADD_NEW__') {
            setIsAddingSupplier(true);
        } else {
            setFormData(prev => ({ ...prev, supplier: value }));
            setIsAddingSupplier(false);
        }
    };

    const handleSaveNewSupplier = async () => {
        if (newSupplierName.trim() === '') return;
        try {
            const newSupplier = await onAddNewSupplier(newSupplierName);
            setFormData(prev => ({ ...prev, supplier: newSupplier.name }));
            setNewSupplierName('');
            setIsAddingSupplier(false);
        } catch (error) {
            console.error("Failed to add new supplier", error);
        }
    };

    const handleDeleteSelectedSupplier = () => {
        if (!formData.supplier) return;
        const supplierToDelete = suppliers.find(s => s.name === formData.supplier);
        if (supplierToDelete) {
            onDeleteSupplier(supplierToDelete.id);
            setFormData(prev => ({ ...prev, supplier: '' }));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={order ? 'Editar Pedido' : 'Nuevo Pedido'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">Nº de Pedido</label>
                        <input type="text" name="orderNumber" id="orderNumber" value={formData.orderNumber} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                </div>

                <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Proveedor</label>
                    <div className="flex items-center gap-2">
                        <select id="supplier" name="supplier" value={isAddingSupplier ? '__ADD_NEW__' : formData.supplier} onChange={handleSupplierChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                            <option value="" disabled>Seleccione un proveedor</option>
                            {suppliersForDropdown.map(sup => <option key={sup.id} value={sup.name}>{sup.name}</option>)}
                            <option value="__ADD_NEW__">-- Agregar nuevo proveedor --</option>
                        </select>
                        {formData.supplier && !isAddingSupplier && (
                            <button
                                type="button"
                                onClick={handleDeleteSelectedSupplier}
                                className="mt-1 text-red-500 hover:text-red-700 p-2 disabled:text-gray-300 disabled:cursor-not-allowed"
                                disabled={!suppliers.some(s => s.name === formData.supplier)}
                                aria-label="Eliminar proveedor seleccionado"
                                title={suppliers.some(s => s.name === formData.supplier) ? 'Eliminar proveedor' : 'No se pueden eliminar los proveedores de los datos de ejemplo'}
                            >
                                <DeleteIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {isAddingSupplier && (
                        <div className="mt-2 flex gap-2">
                            <input type="text" placeholder="Nombre del proveedor" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                            <Button type="button" onClick={handleSaveNewSupplier}>Guardar</Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Importe</label>
                        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleAmountChange} required min="0.01" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                         <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                            <option value={OrderStatus.PENDING}>Pendiente</option>
                            <option value={OrderStatus.RECEIVED}>Recibido</option>
                            <option value={OrderStatus.PAID} disabled>Pagado</option>
                            <option value={OrderStatus.PARTIALLY_PAID} disabled>Parcialmente Pagado</option>
                            <option value={OrderStatus.CANCELLED}>Cancelado</option>
                        </select>
                    </div>
                </div>
                
                 <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
                    <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default OrderModal;
