
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Category, LicensePlate, Order, OrderStatus, Supplier } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { DeleteIcon } from './icons';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    transaction: Transaction | null;
    selectedDate: Date;
    categories: Category[];
    licensePlates: LicensePlate[];
    suppliers: Supplier[];
    orders: Order[];
    onAddNewCategory: (name: string) => Promise<Category>;
    onAddNewLicensePlate: (plate: string, description: string) => Promise<LicensePlate>;
    onDeleteCategory: (id: string) => void;
    onDeleteLicensePlate: (id: string) => void;
    onAddNewSupplier: (name: string) => Promise<Supplier>;
    onDeleteSupplier: (id: string) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
    isOpen, onClose, onSave, transaction, selectedDate, 
    categories, licensePlates, suppliers, orders, 
    onAddNewCategory, onAddNewLicensePlate, onDeleteCategory, onDeleteLicensePlate,
    onAddNewSupplier, onDeleteSupplier
}) => {
    const getInitialState = () => {
        if (transaction) return { ...transaction, licensePlates: transaction.licensePlates || [] };
        
        const today = new Date();
        const localTimezoneOffset = today.getTimezoneOffset() * 60000;
        const localDate = new Date(today.getTime() - localTimezoneOffset);
        
        localDate.setFullYear(selectedDate.getFullYear());
        localDate.setMonth(selectedDate.getMonth());

        return {
            date: localDate.toISOString().split('T')[0],
            deliveryNoteNumber: '',
            supplier: '',
            category: '',
            description: '',
            amount: 0,
            type: TransactionType.EXPENSE,
            licensePlates: [] as string[],
            orderId: undefined,
        };
    };

    const [formData, setFormData] = useState(getInitialState);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingPlate, setIsAddingPlate] = useState(false);
    const [newPlate, setNewPlate] = useState({ plate: '', description: '' });
    const [isAddingSupplier, setIsAddingSupplier] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');

    useEffect(() => {
        setFormData(getInitialState());
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transaction, isOpen]);
    
    const categoriesForDropdown = useMemo(() => {
        const allCategories = [...categories];
        if (transaction?.category && !categories.some(c => c.name === transaction.category)) {
            allCategories.push({ id: `readonly-${transaction.category}`, name: transaction.category });
        }
        return allCategories;
    }, [categories, transaction]);

    const suppliersForDropdown = useMemo(() => {
        const allSuppliers = [...suppliers];
        if (transaction?.supplier && !suppliers.some(s => s.name === transaction.supplier)) {
            allSuppliers.push({ id: `readonly-${transaction.supplier}`, name: transaction.supplier });
        }
        return allSuppliers;
    }, [suppliers, transaction]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'type' && value === TransactionType.INCOME) {
            setFormData(prev => ({ 
                ...prev, 
                type: value as TransactionType,
                orderId: undefined, // Desvincular pedido al cambiar a Ingreso
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Omit<Transaction, 'id'> | Transaction);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '__ADD_NEW__') {
            setIsAddingCategory(true);
        } else {
            setFormData(prev => ({ ...prev, category: value }));
            setIsAddingCategory(false);
        }
    };
    
    const handleDeleteSelectedCategory = () => {
        if (!formData.category) return;
        const categoryToDelete = categories.find(c => c.name === formData.category);
        if (categoryToDelete) {
            onDeleteCategory(categoryToDelete.id);
            setFormData(prev => ({...prev, category: ''}));
        }
    };

    const handleSaveNewCategory = async () => {
        if (newCategoryName.trim() === '') return;
        try {
            const newCategory = await onAddNewCategory(newCategoryName);
            setFormData(prev => ({ ...prev, category: newCategory.name }));
            setNewCategoryName('');
            setIsAddingCategory(false);
        } catch (error) {
            console.error("Failed to add new category", error);
        }
    };
    
    const handlePlateSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const plateValue = e.target.value;
        if (plateValue === '__ADD_NEW__') {
            setIsAddingPlate(true);
            return;
        }
        if (plateValue && !formData.licensePlates.includes(plateValue)) {
            setFormData(prev => ({...prev, licensePlates: [...prev.licensePlates, plateValue]}));
        }
        e.target.value = ''; // Reset select
    };

    const handleRemovePlate = (plateToRemove: string) => {
        setFormData(prev => ({...prev, licensePlates: prev.licensePlates.filter(p => p !== plateToRemove)}));
    };

    const handleSaveNewPlate = async () => {
        if (newPlate.plate.trim() === '') return;
        try {
            const addedPlate = await onAddNewLicensePlate(newPlate.plate, newPlate.description);
            setFormData(prev => ({...prev, licensePlates: [...prev.licensePlates, addedPlate.plate]}));
            setNewPlate({ plate: '', description: '' });
            setIsAddingPlate(false);
        } catch (error) {
            console.error("Failed to add new plate", error);
        }
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

    const handleOrderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOrderId = e.target.value;
        const selectedOrder = orders.find(o => o.id === selectedOrderId);

        if (selectedOrder) {
            const pendingAmount = selectedOrder.amount - selectedOrder.paidAmount;
            setFormData(prev => ({
                ...prev,
                orderId: selectedOrderId,
                supplier: selectedOrder.supplier,
                amount: pendingAmount > 0 ? Number(pendingAmount.toFixed(2)) : 0,
                description: prev.description || `Pago pedido ${selectedOrder.orderNumber}`,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                orderId: undefined,
            }));
        }
    };

    const availablePlates = useMemo(() => {
        return licensePlates.filter(p => !formData.licensePlates.includes(p.plate));
    }, [licensePlates, formData.licensePlates]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Editar Transacción' : 'Nueva Transacción'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                            <option value={TransactionType.EXPENSE}>Gasto</option>
                            <option value={TransactionType.INCOME}>Ingreso</option>
                        </select>
                    </div>
                </div>

                {formData.type === TransactionType.EXPENSE && (
                    <div>
                        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Vincular Pedido (opcional)</label>
                        <select
                            name="orderId"
                            id="orderId"
                            value={formData.orderId || ''}
                            onChange={handleOrderSelection}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">-- Seleccionar un pedido para autorrellenar --</option>
                            {orders
                                .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.PAID)
                                .map(order => {
                                    const pendingAmount = order.amount - order.paidAmount;
                                    const formattedPending = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(pendingAmount);
                                    
                                    const statusText = `(Pendiente: ${formattedPending})`;

                                    return (
                                        <option key={order.id} value={order.id}>
                                            {`${order.orderNumber} - ${order.supplier} ${statusText}`}
                                        </option>
                                    );
                                })
                            }
                        </select>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="deliveryNoteNumber" className="block text-sm font-medium text-gray-700">Nº Albarán</label>
                        <input type="text" name="deliveryNoteNumber" id="deliveryNoteNumber" value={formData.deliveryNoteNumber} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Proveedor / Cliente</label>
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
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                    <div className="flex items-center gap-2">
                        <select id="category" name="category" value={isAddingCategory ? '__ADD_NEW__' : formData.category} onChange={handleCategoryChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                            <option value="" disabled>Seleccione una categoría</option>
                            {categoriesForDropdown.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            <option value="__ADD_NEW__">-- Agregar nueva categoría --</option>
                        </select>
                        {formData.category && !isAddingCategory && (
                             <button 
                                type="button" 
                                onClick={handleDeleteSelectedCategory} 
                                className="mt-1 text-red-500 hover:text-red-700 p-2 disabled:text-gray-300 disabled:cursor-not-allowed"
                                disabled={!categories.some(c => c.name === formData.category)}
                                aria-label="Eliminar categoría seleccionada"
                                title={categories.some(c => c.name === formData.category) ? 'Eliminar categoría' : 'No se pueden eliminar las categorías de los datos de ejemplo'}
                            >
                                <DeleteIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {isAddingCategory && (
                        <div className="mt-2 flex gap-2">
                            <input type="text" placeholder="Nombre de categoría" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                            <Button type="button" onClick={handleSaveNewCategory}>Guardar</Button>
                        </div>
                    )}
                </div>
                
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Importe</label>
                    <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleAmountChange} required min="0.01" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Camión / Matrículas</label>
                     <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[40px]">
                        {formData.licensePlates.map(plate => (
                            <span key={plate} className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-md">
                                {plate}
                                <button type="button" onClick={() => handleRemovePlate(plate)} className="ml-1.5 text-primary-600 hover:text-primary-800">&times;</button>
                            </span>
                        ))}
                    </div>
                    <select onChange={handlePlateSelection} className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                        <option value="">-- Añadir matrícula --</option>
                        {availablePlates.map(p => <option key={p.id} value={p.plate}>{p.plate} ({p.description})</option>)}
                        <option value="__ADD_NEW__">-- Agregar nueva matrícula --</option>
                    </select>
                     {isAddingPlate && (
                        <div className="mt-2 space-y-2">
                            <input type="text" placeholder="Nueva matrícula (ej: 1234ABC)" value={newPlate.plate} onChange={e => setNewPlate(p => ({...p, plate: e.target.value.toUpperCase()}))} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                            <input type="text" placeholder="Descripción (ej: Furgoneta Ford)" value={newPlate.description} onChange={e => setNewPlate(p => ({...p, description: e.target.value}))} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                            <Button type="button" onClick={handleSaveNewPlate}>Guardar Matrícula</Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionModal;
