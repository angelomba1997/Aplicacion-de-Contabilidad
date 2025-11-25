
import React, { Fragment } from 'react';

interface HeaderProps {
    currentView: string;
    onNavigate: (view: 'dashboard' | 'transactions' | 'orders' | 'reports' | 'settings') => void;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, selectedDate, onDateChange }) => {

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(parseInt(e.target.value, 10));
        onDateChange(newDate);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(selectedDate);
        const year = parseInt(e.target.value, 10);
        if (!isNaN(year) && year > 1900 && year < 3000) {
            newDate.setFullYear(year);
            onDateChange(newDate);
        }
    };
    
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const navItems = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'orders', label: 'Pedidos' },
        { key: 'transactions', label: 'Transacciones' },
        { key: 'reports', label: 'Reportes' },
        { key: 'settings', label: 'Configuración' },
    ];

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-2xl font-bold text-primary-600">Contabilidad Pro</h1>
                        <nav className="hidden md:flex space-x-4">
                            {navItems.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => onNavigate(item.key as any)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentView === item.key
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                             <select
                                value={selectedDate.getMonth()}
                                onChange={handleMonthChange}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            >
                                {months.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={selectedDate.getFullYear()}
                                onChange={handleYearChange}
                                className="block w-24 pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            />
                        </div>
                    </div>
                </div>
                 <div className="md:hidden flex space-x-2 p-2 border-t">
                     {navItems.map(item => (
                         <button
                             key={item.key}
                             onClick={() => onNavigate(item.key as any)}
                             className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                 currentView === item.key
                                     ? 'bg-primary-100 text-primary-700'
                                     : 'text-gray-500 hover:bg-gray-100'
                             }`}
                         >
                             {item.label}
                         </button>
                     ))}
                 </div>
            </div>
        </header>
    );
};

export default Header;
