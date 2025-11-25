
import React, { useState } from 'react';
import { Category, LicensePlate, Supplier } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlusIcon, DeleteIcon } from './icons';

interface SettingsProps {
    categories: Category[];
    suppliers: Supplier[];
    licensePlates: LicensePlate[];
    onAddCategory: (name: string) => Promise<any>;
    onDeleteCategory: (id: string) => void;
    onAddSupplier: (name: string) => Promise<any>;
    onDeleteSupplier: (id: string) => void;
    onAddLicensePlate: (plate: string, description: string) => Promise<any>;
    onDeleteLicensePlate: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
    categories,
    suppliers,
    licensePlates,
    onAddCategory,
    onDeleteCategory,
    onAddSupplier,
    onDeleteSupplier,
    onAddLicensePlate,
    onDeleteLicensePlate
}) => {
    const [newCategory, setNewCategory] = useState('');
    const [newSupplier, setNewSupplier] = useState('');
    const [newPlate, setNewPlate] = useState({ plate: '', description: '' });

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        await onAddCategory(newCategory);
        setNewCategory('');
    };

    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSupplier.trim()) return;
        await onAddSupplier(newSupplier);
        setNewSupplier('');
    };

    const handleAddPlate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlate.plate.trim()) return;
        await onAddLicensePlate(newPlate.plate.toUpperCase(), newPlate.description);
        setNewPlate({ plate: '', description: '' });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Configuración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sección Proveedores */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Proveedores / Clientes</h3>
                    <div className="mb-4 max-h-60 overflow-y-auto space-y-2 border rounded-md p-2 bg-gray-50">
                        {suppliers.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center italic">No hay proveedores.</p>
                        ) : (
                            suppliers.map(s => (
                                <div key={s.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                    <span className="text-sm text-gray-700">{s.name}</span>
                                    <button 
                                        onClick={() => onDeleteSupplier(s.id)} 
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Eliminar proveedor"
                                    >
                                        <DeleteIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={handleAddSupplier} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newSupplier} 
                            onChange={(e) => setNewSupplier(e.target.value)} 
                            placeholder="Nuevo proveedor..." 
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Button type="submit" disabled={!newSupplier.trim()} className="px-3">
                            <PlusIcon className="w-5 h-5" />
                        </Button>
                    </form>
                </Card>

                {/* Sección Categorías */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Categorías</h3>
                    <div className="mb-4 max-h-60 overflow-y-auto space-y-2 border rounded-md p-2 bg-gray-50">
                         {categories.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center italic">No hay categorías.</p>
                        ) : (
                            categories.map(c => (
                                <div key={c.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                    <span className="text-sm text-gray-700">{c.name}</span>
                                    <button 
                                        onClick={() => onDeleteCategory(c.id)} 
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Eliminar categoría"
                                    >
                                        <DeleteIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCategory} 
                            onChange={(e) => setNewCategory(e.target.value)} 
                            placeholder="Nueva categoría..." 
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Button type="submit" disabled={!newCategory.trim()} className="px-3">
                            <PlusIcon className="w-5 h-5" />
                        </Button>
                    </form>
                </Card>

                {/* Sección Matrículas */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Matrículas</h3>
                    <div className="mb-4 max-h-60 overflow-y-auto space-y-2 border rounded-md p-2 bg-gray-50">
                        {licensePlates.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center italic">No hay matrículas.</p>
                        ) : (
                            licensePlates.map(p => (
                                <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">{p.plate}</span>
                                        <span className="text-xs text-gray-500">{p.description}</span>
                                    </div>
                                    <button 
                                        onClick={() => onDeleteLicensePlate(p.id)} 
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Eliminar matrícula"
                                    >
                                        <DeleteIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={handleAddPlate} className="space-y-2">
                        <input 
                            type="text" 
                            value={newPlate.plate} 
                            onChange={(e) => setNewPlate({...newPlate, plate: e.target.value.toUpperCase()})} 
                            placeholder="Matrícula (ej: 1234ABC)" 
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                         <input 
                            type="text" 
                            value={newPlate.description} 
                            onChange={(e) => setNewPlate({...newPlate, description: e.target.value})} 
                            placeholder="Descripción (ej: Camión 1)" 
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Button type="submit" disabled={!newPlate.plate.trim()} className="w-full justify-center">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Añadir
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
