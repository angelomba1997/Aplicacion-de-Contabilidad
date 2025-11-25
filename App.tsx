
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, Category, LicensePlate, TransactionType, Order, Supplier } from './types';
import api from './services/api';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import TransactionModal from './components/TransactionModal';
import ConfirmationModal from './components/ui/ConfirmationModal';
import Orders from './components/Orders';
import OrderModal from './components/OrderModal';
import Settings from './components/Settings';

type View = 'dashboard' | 'transactions' | 'orders' | 'reports' | 'settings';

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [yearlyTransactions, setYearlyTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [licensePlates, setLicensePlates] = useState<LicensePlate[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [isOrderConfirmModalOpen, setIsOrderConfirmModalOpen] = useState(false);
    const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);
    const [orderDeleteError, setOrderDeleteError] = useState<string | null>(null);

    // Settings deletion state
    const [settingsDeleteTarget, setSettingsDeleteTarget] = useState<{ id: string, type: 'category' | 'supplier' | 'licensePlate' } | null>(null);
    const [settingsDeleteError, setSettingsDeleteError] = useState<string | null>(null);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [monthly, yearly, cats, plates, fetchedOrders, fetchedSuppliers] = await Promise.all([
                api.getTransactionsForMonth(selectedDate.getFullYear(), selectedDate.getMonth()),
                api.getTransactionsForYear(selectedDate.getFullYear()),
                api.getCategories(),
                api.getLicensePlates(),
                api.getOrders(),
                api.getSuppliers(),
            ]);
            setTransactions(monthly);
            setYearlyTransactions(yearly);
            setCategories(cats);
            setLicensePlates(plates);
            setOrders(fetchedOrders);
            setSuppliers(fetchedSuppliers);
        } catch (err: any) {
            console.error("Error refreshing data:", err);
            setError(err.message || "Error al cargar los datos. Verifique su conexión.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const handleOpenModal = (transaction: Transaction | null = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id'> | Transaction) => {
        if ('id' in transactionData) {
            await api.updateTransaction(transactionData);
        } else {
            await api.addTransaction(transactionData);
        }
        await refreshData();
        handleCloseModal();
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactionToDeleteId(id);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (transactionToDeleteId) {
            await api.deleteTransaction(transactionToDeleteId);
            await refreshData();
        }
        setIsConfirmModalOpen(false);
        setTransactionToDeleteId(null);
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setTransactionToDeleteId(null);
    };
    
    const handleAddNewCategory = async (name: string): Promise<Category> => {
        const newCategory = await api.addCategory({ name });
        await refreshData();
        return newCategory;
    };

    const handleAddNewLicensePlate = async (plate: string, description: string): Promise<LicensePlate> => {
        const newPlate = await api.addLicensePlate({ plate, description });
        await refreshData();
        return newPlate;
    };
    
    // Settings Delete Handlers
    const handleDeleteCategory = (id: string) => {
        setSettingsDeleteTarget({ id, type: 'category' });
        setSettingsDeleteError(null);
    };

    const handleDeleteLicensePlate = (id: string) => {
        setSettingsDeleteTarget({ id, type: 'licensePlate' });
        setSettingsDeleteError(null);
    };

    const handleAddNewSupplier = async (name: string): Promise<Supplier> => {
        const newSupplier = await api.addSupplier({ name });
        await refreshData();
        return newSupplier;
    };

    const handleDeleteSupplier = (id: string) => {
        setSettingsDeleteTarget({ id, type: 'supplier' });
        setSettingsDeleteError(null);
    };

    const handleConfirmSettingsDelete = async () => {
        if (!settingsDeleteTarget) return;

        setSettingsDeleteError(null);
        let result;

        if (settingsDeleteTarget.type === 'category') {
            result = await api.deleteCategory(settingsDeleteTarget.id);
        } else if (settingsDeleteTarget.type === 'supplier') {
            result = await api.deleteSupplier(settingsDeleteTarget.id);
        } else {
            result = await api.deleteLicensePlate(settingsDeleteTarget.id);
        }

        if (result.success) {
            await refreshData();
            setSettingsDeleteTarget(null);
        } else {
            setSettingsDeleteError(result.message || 'Error desconocido al eliminar.');
        }
    };

    const handleCancelSettingsDelete = () => {
        setSettingsDeleteTarget(null);
        setSettingsDeleteError(null);
    };

    const handleOpenOrderModal = (order: Order | null = null) => {
        setEditingOrder(order);
        setIsOrderModalOpen(true);
    };

    const handleCloseOrderModal = () => {
        setIsOrderModalOpen(false);
        setEditingOrder(null);
    };

    const handleSaveOrder = async (orderData: Omit<Order, 'id'> | Order) => {
        if ('id' in orderData) {
            await api.updateOrder(orderData);
        } else {
            await api.addOrder(orderData as Omit<Order, 'id' | 'paidAmount'>);
        }
        await refreshData();
        handleCloseOrderModal();
    };

    const handleDeleteOrder = (id: string) => {
        setOrderToDeleteId(id);
        setOrderDeleteError(null);
        setIsOrderConfirmModalOpen(true);
    };

    const handleConfirmOrderDelete = async () => {
        if (orderToDeleteId) {
            setOrderDeleteError(null);
            const result = await api.deleteOrder(orderToDeleteId);
            if (result.success) {
                await refreshData();
                setIsOrderConfirmModalOpen(false);
                setOrderToDeleteId(null);
            } else {
                setOrderDeleteError(result.message || 'Ocurrió un error desconocido.');
            }
        }
    };

    const handleCancelOrderDelete = () => {
        setIsOrderConfirmModalOpen(false);
        setOrderToDeleteId(null);
        setOrderDeleteError(null);
    };

    const monthlySummary = useMemo(() => {
        const summary = transactions.reduce((acc, t) => {
            if (t.type === TransactionType.INCOME) {
                acc.income += t.amount;
            } else {
                acc.expenses += t.amount;
            }
            return acc;
        }, { income: 0, expenses: 0 });
        
        return {
            ...summary,
            balance: summary.income - summary.expenses,
        };
    }, [transactions]);

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard 
                            summary={monthlySummary} 
                            monthlyTransactions={transactions}
                            yearlyTransactions={yearlyTransactions}
                            isLoading={isLoading} 
                        />;
            case 'transactions':
                return <TransactionList 
                            transactions={transactions} 
                            orders={orders}
                            isLoading={isLoading}
                            onAddTransaction={() => handleOpenModal()}
                            onEditTransaction={handleOpenModal}
                            onDeleteTransaction={handleDeleteTransaction}
                         />;
            case 'orders':
                return <Orders
                            orders={orders}
                            isLoading={isLoading}
                            onAddOrder={() => handleOpenOrderModal()}
                            onEditOrder={handleOpenOrderModal}
                            onDeleteOrder={handleDeleteOrder}
                            onSaveOrder={handleSaveOrder}
                        />;
            case 'reports':
                return <Reports transactions={transactions} selectedDate={selectedDate} />;
            case 'settings':
                return <Settings 
                            categories={categories}
                            suppliers={suppliers}
                            licensePlates={licensePlates}
                            onAddCategory={handleAddNewCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onAddSupplier={handleAddNewSupplier}
                            onDeleteSupplier={handleDeleteSupplier}
                            onAddLicensePlate={handleAddNewLicensePlate}
                            onDeleteLicensePlate={handleDeleteLicensePlate}
                        />;
            default:
                return <Dashboard 
                           summary={monthlySummary} 
                           monthlyTransactions={transactions}
                           yearlyTransactions={yearlyTransactions}
                           isLoading={isLoading} 
                        />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800">
            <Header
                currentView={view}
                onNavigate={setView}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                {error && (
                    <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
                        <p className="font-bold">Error de Base de Datos</p>
                        <p>{error}</p>
                        {error.includes("Cloud Firestore API has not been used") && (
                            <div className="mt-2">
                                <p className="mb-1 text-sm text-red-600">Es necesario habilitar la base de datos en tu proyecto de Firebase:</p>
                                <a 
                                    href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=aplicacion-de-contabilid-72e34`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold transition-colors"
                                >
                                    Habilitar Firestore API ahora
                                </a>
                            </div>
                        )}
                    </div>
                )}
                {renderView()}
            </main>
            {isModalOpen && (
                <TransactionModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveTransaction}
                    transaction={editingTransaction}
                    selectedDate={selectedDate}
                    categories={categories}
                    licensePlates={licensePlates}
                    suppliers={suppliers}
                    orders={orders}
                    onAddNewCategory={handleAddNewCategory}
                    onAddNewLicensePlate={handleAddNewLicensePlate}
                    onDeleteCategory={handleDeleteCategory}
                    onDeleteLicensePlate={handleDeleteLicensePlate}
                    onAddNewSupplier={handleAddNewSupplier}
                    onDeleteSupplier={handleDeleteSupplier}
                />
            )}
            {isOrderModalOpen && (
                <OrderModal
                    isOpen={isOrderModalOpen}
                    onClose={handleCloseOrderModal}
                    onSave={handleSaveOrder}
                    order={editingOrder}
                    suppliers={suppliers}
                    onAddNewSupplier={handleAddNewSupplier}
                    onDeleteSupplier={handleDeleteSupplier}
                />
            )}
            {/* Modal para eliminar Transacciones */}
            {isConfirmModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    confirmText="Eliminar"
                    confirmVariant="danger"
                >
                    <p>¿Está seguro de que desea eliminar esta transacción? Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}
            {/* Modal para eliminar Pedidos */}
            {isOrderConfirmModalOpen && (
                <ConfirmationModal
                    isOpen={isOrderConfirmModalOpen}
                    onClose={handleCancelOrderDelete}
                    onConfirm={handleConfirmOrderDelete}
                    title="Confirmar Eliminación"
                    confirmText="Eliminar"
                    confirmVariant="danger"
                    errorMessage={orderDeleteError}
                >
                    <p>¿Está seguro de que desea eliminar este pedido? Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}
             {/* Modal para eliminar Configuración (Proveedores, Categorías, Matrículas) */}
             {settingsDeleteTarget && (
                <ConfirmationModal
                    isOpen={!!settingsDeleteTarget}
                    onClose={handleCancelSettingsDelete}
                    onConfirm={handleConfirmSettingsDelete}
                    title="Confirmar Eliminación"
                    confirmText="Eliminar"
                    confirmVariant="danger"
                    errorMessage={settingsDeleteError}
                >
                    <p>
                        ¿Está seguro de que desea eliminar 
                        {settingsDeleteTarget.type === 'category' ? ' esta categoría' : 
                         settingsDeleteTarget.type === 'supplier' ? ' este proveedor' : 
                         ' esta matrícula'}? 
                        Esta acción no se puede deshacer.
                    </p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default App;
