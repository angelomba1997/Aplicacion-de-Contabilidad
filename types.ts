export enum TransactionType {
    INCOME = 'INGRESO',
    EXPENSE = 'GASTO',
}

export enum OrderStatus {
    PENDING = 'PENDIENTE',
    RECEIVED = 'RECIBIDO',
    PAID = 'PAGADO',
    CANCELLED = 'CANCELADO',
    PARTIALLY_PAID = 'PARCIALMENTE PAGADO',
}

export interface Transaction {
    id: string;
    date: string; // YYYY-MM-DD
    deliveryNoteNumber: string;
    supplier: string;
    category: string;
    description: string;
    amount: number;
    type: TransactionType;
    licensePlates?: string[];
    orderId?: string;
}

export interface Order {
    id: string;
    date: string;
    orderNumber: string;
    supplier: string;
    amount: number;
    status: OrderStatus;
    notes?: string;
    paidAmount: number;
}

export interface Category {
    id: string;
    name: string;
}

export interface LicensePlate {
    id: string;
    plate: string;
    description: string;
}

export interface Supplier {
    id: string;
    name: string;
}

export interface MonthlySummary {
    income: number;
    expenses: number;
    balance: number;
}
