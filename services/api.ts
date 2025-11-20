
import { db } from './firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    getDoc 
} from 'firebase/firestore';
import { Transaction, TransactionType, Category, LicensePlate, Order, OrderStatus, Supplier } from '../types';

// Colecciones de Firestore
const COLLECTIONS = {
    TRANSACTIONS: 'transactions',
    ORDERS: 'orders',
    CATEGORIES: 'categories',
    LICENSE_PLATES: 'license_plates',
    SUPPLIERS: 'suppliers'
};

// Lógica auxiliar para actualizar el estado de un pedido basado en sus transacciones
const updateOrderStatusInDb = async (orderId: string) => {
    try {
        // 1. Obtener todas las transacciones de gasto vinculadas a este pedido
        const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
        const q = query(
            transactionsRef,
            where('orderId', '==', orderId),
            where('type', '==', TransactionType.EXPENSE)
        );
        const querySnapshot = await getDocs(q);
        
        let paidAmount = 0;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            paidAmount += Number(data.amount) || 0;
        });

        // 2. Obtener el pedido actual
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists()) return;
        
        const orderData = orderSnap.data() as Order;
        let newStatus = orderData.status;

        // 3. Calcular nuevo estado
        // No cambiar automáticamente si fue cancelado manualmente
        if (orderData.status !== OrderStatus.CANCELLED) {
            // Si está como RECIBIDO y no se ha pagado completo, mantener RECIBIDO
            if (orderData.status === OrderStatus.RECEIVED && paidAmount < orderData.amount) {
                // Mantener estado
            } else if (paidAmount >= orderData.amount) {
                newStatus = OrderStatus.PAID;
            } else if (paidAmount > 0 && paidAmount < orderData.amount) {
                newStatus = OrderStatus.PARTIALLY_PAID;
            } else {
                // Solo revertir a PENDIENTE si no estaba en RECIBIDO
                if (orderData.status !== OrderStatus.RECEIVED) {
                    newStatus = OrderStatus.PENDING;
                }
            }
        }

        // 4. Actualizar pedido con el monto pagado real y el nuevo estado
        await updateDoc(orderRef, {
            paidAmount: paidAmount,
            status: newStatus
        });

    } catch (error) {
        console.error("Error actualizando estado del pedido:", error);
    }
};

const api = {
  getTransactionsForMonth: async (year: number, month: number): Promise<Transaction[]> => {
    // month es 0-indexado (0 para Enero)
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Último día del mes

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching transactions from ${startStr} to ${endStr}`);
    
    // No usamos try-catch aquí para permitir que el error de "API not enabled" llegue a la UI
    const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('date', '>=', startStr),
        where('date', '<=', endStr)
    );
    
    const snapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    snapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    
    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  getTransactionsForYear: async (year: number): Promise<Transaction[]> => {
    const startStr = `${year}-01-01`;
    const endStr = `${year}-12-31`;

    console.log(`Fetching transactions for year ${year}`);
    
    const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('date', '>=', startStr),
        where('date', '<=', endStr)
    );

    const snapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    snapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });

    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
        const newTransaction = { ...transaction, id: docRef.id };
        
        if (newTransaction.orderId && newTransaction.type === TransactionType.EXPENSE) {
            await updateOrderStatusInDb(newTransaction.orderId);
        }
        
        return newTransaction;
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
    }
  },

  updateTransaction: async (transaction: Transaction): Promise<Transaction> => {
    try {
        const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transaction.id);
        
        // Obtener la transacción anterior para verificar cambios en el orderId
        const oldSnap = await getDoc(transactionRef);
        let originalOrderId: string | undefined;
        
        if (oldSnap.exists()) {
            originalOrderId = oldSnap.data().orderId;
        }

        // Excluir el ID del objeto que se guarda en Firestore
        const { id, ...dataToUpdate } = transaction;
        await updateDoc(transactionRef, dataToUpdate);

        // Recalcular estados de pedidos involucrados
        if (originalOrderId && originalOrderId !== transaction.orderId) {
            await updateOrderStatusInDb(originalOrderId);
        }
        if (transaction.orderId) {
            await updateOrderStatusInDb(transaction.orderId);
        }
        
        return transaction;
    } catch (error) {
        console.error("Error updating transaction:", error);
        throw error;
    }
  },

  deleteTransaction: async (id: string): Promise<{ success: boolean }> => {
    try {
        const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
        const snap = await getDoc(transactionRef);
        let orderId: string | undefined;

        if (snap.exists()) {
            orderId = snap.data().orderId;
        }

        await deleteDoc(transactionRef);

        if (orderId) {
            await updateOrderStatusInDb(orderId);
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return { success: false };
    }
  },
  
  getCategories: async (): Promise<Category[]> => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories: Category[] = [];
    snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() } as Category));
    return categories;
  },

  addCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), category);
    return { ...category, id: docRef.id };
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id);
        const catSnap = await getDoc(categoryRef);
        if (!catSnap.exists()) return { success: false, message: 'Categoría no encontrada.' };
        
        const categoryName = catSnap.data().name;

        const q = query(collection(db, COLLECTIONS.TRANSACTIONS), where('category', '==', categoryName));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
            return { success: false, message: 'La categoría está en uso por una o más transacciones.' };
        }

        await deleteDoc(categoryRef);
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Error al eliminar categoría' };
    }
  },

  getLicensePlates: async (): Promise<LicensePlate[]> => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.LICENSE_PLATES));
    const plates: LicensePlate[] = [];
    snapshot.forEach(doc => plates.push({ id: doc.id, ...doc.data() } as LicensePlate));
    return plates;
  },

  addLicensePlate: async (plateData: Omit<LicensePlate, 'id'>): Promise<LicensePlate> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.LICENSE_PLATES), plateData);
    return { ...plateData, id: docRef.id };
  },

  deleteLicensePlate: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const plateRef = doc(db, COLLECTIONS.LICENSE_PLATES, id);
        const plateSnap = await getDoc(plateRef);
        if (!plateSnap.exists()) return { success: false, message: 'Matrícula no encontrada.' };
        
        const plateName = plateSnap.data().plate;

        const q = query(collection(db, COLLECTIONS.TRANSACTIONS), where('licensePlates', 'array-contains', plateName));
        const snap = await getDocs(q);

        if (!snap.empty) {
            return { success: false, message: 'La matrícula está en uso por una o más transacciones.' };
        }

        await deleteDoc(plateRef);
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Error al eliminar matrícula' };
    }
  },
  
  getSuppliers: async (): Promise<Supplier[]> => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SUPPLIERS));
    const suppliers: Supplier[] = [];
    snapshot.forEach(doc => suppliers.push({ id: doc.id, ...doc.data() } as Supplier));
    return suppliers;
  },
  
  addSupplier: async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.SUPPLIERS), supplier);
    return { ...supplier, id: docRef.id };
  },

  deleteSupplier: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const supplierRef = doc(db, COLLECTIONS.SUPPLIERS, id);
        const supplierSnap = await getDoc(supplierRef);
        if (!supplierSnap.exists()) return { success: false, message: 'Proveedor no encontrado.' };
        
        const supplierName = supplierSnap.data().name;

        const qTrans = query(collection(db, COLLECTIONS.TRANSACTIONS), where('supplier', '==', supplierName));
        const snapTrans = await getDocs(qTrans);

        const qOrders = query(collection(db, COLLECTIONS.ORDERS), where('supplier', '==', supplierName));
        const snapOrders = await getDocs(qOrders);

        if (!snapTrans.empty || !snapOrders.empty) {
            return { success: false, message: 'El proveedor está en uso en transacciones o pedidos.' };
        }

        await deleteDoc(supplierRef);
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Error al eliminar proveedor' };
    }
  },

  getOrders: async (): Promise<Order[]> => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
    const orders: Order[] = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() } as Order));
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addOrder: async (order: Omit<Order, 'id' | 'paidAmount'>): Promise<Order> => {
    const newOrderData = {
        ...order,
        paidAmount: 0
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), newOrderData);
    return { ...newOrderData, id: docRef.id };
  },

  updateOrder: async (order: Order): Promise<Order> => {
    try {
        const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);
        
        // IMPORTANTE: Excluir 'paidAmount' de los datos que se guardan directamente desde la UI.
        // 'paidAmount' debe ser calculado por el sistema basado en transacciones.
        const { id, paidAmount, ...data } = order;
        
        await updateDoc(orderRef, data);
        
        // Recalcular estado e importe pagado (por si cambió el importe total del pedido)
        await updateOrderStatusInDb(id);
        
        // Devolver el objeto actualizado de la BD
        const updatedSnap = await getDoc(orderRef);
        return { id, ...updatedSnap.data() } as Order;
    } catch (error) {
        console.error("Error updating order:", error);
        throw error;
    }
  },

  deleteOrder: async (id: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const q = query(collection(db, COLLECTIONS.TRANSACTIONS), where('orderId', '==', id));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
            return { success: false, message: 'El pedido tiene transacciones asociadas y no se puede eliminar.' };
        }

        await deleteDoc(doc(db, COLLECTIONS.ORDERS, id));
        return { success: true };
      } catch (error) {
        return { success: false, message: 'Error eliminando pedido' };
      }
  }
};

export default api;
