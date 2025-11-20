import React, { useState } from 'react';
import { Transaction } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { DownloadIcon } from './icons';

interface ReportsProps {
    transactions: Transaction[];
    selectedDate: Date;
}

// Helper function for proper CSV escaping according to RFC-4180 standard.
const escapeCSVField = (field: string | number | undefined | null, delimiter: string): string => {
    if (field === null || field === undefined) {
        return '';
    }
    const stringField = String(field);
    const needsQuotes = stringField.includes(delimiter) || stringField.includes('"') || stringField.includes('\n');
    
    if (needsQuotes) {
        // Enclose in double quotes and escape any internal double quotes by doubling them.
        const escapedField = stringField.replace(/"/g, '""');
        return `"${escapedField}"`;
    }
    
    return stringField;
};


const Reports: React.FC<ReportsProps> = ({ transactions, selectedDate }) => {
    
    // Default to semicolon for better out-of-the-box Excel compatibility in Spanish locales.
    const [delimiter, setDelimiter] = useState<',' | ';'>(';');

    const downloadCSV = () => {
        const headers = ['Fecha', 'Nº Albarán', 'Proveedor / Cliente', 'Categoría', 'Descripción', 'Importe', 'Tipo', 'Matrículas'];
        
        const rows = transactions.map(t => [
            t.date,
            t.deliveryNoteNumber,
            t.supplier,
            t.category,
            t.description,
            t.amount,
            t.type,
            t.licensePlates?.join(' ') ?? ''
        ].map(field => escapeCSVField(field, delimiter)));

        const csvHeader = headers.map(h => escapeCSVField(h, delimiter)).join(delimiter);
        const csvRows = rows.map(row => row.join(delimiter));
        
        // Add BOM (Byte Order Mark) for Excel to correctly open UTF-8 CSV files
        const csvContent = '\uFEFF' + [csvHeader, ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        // Use URL.createObjectURL for robust download handling
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        link.setAttribute("download", `reporte_${year}-${month}.csv`);
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Generador de Reportes</h2>
            </div>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h3 className="font-semibold">Libro Diario (CSV)</h3>
                            <p className="text-sm text-gray-500">Exporta las transacciones del mes a un archivo CSV.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                             <div>
                                 <label htmlFor="csv-delimiter" className="sr-only">Delimitador CSV</label>
                                 <select 
                                    id="csv-delimiter"
                                    value={delimiter} 
                                    onChange={e => setDelimiter(e.target.value as ',' | ';')}
                                    className="block w-full h-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    aria-label="Seleccionar delimitador CSV"
                                 >
                                    <option value=";">Delimitador: Punto y coma (;)</option>
                                    <option value=",">Delimitador: Coma (,)</option>
                                </select>
                            </div>
                            <Button onClick={downloadCSV} disabled={transactions.length === 0} className="flex-shrink-0">
                                <DownloadIcon className="w-5 h-5 mr-2"/>
                                Exportar CSV
                            </Button>
                        </div>
                    </div>
                     <p className="text-xs text-gray-400 mt-2 sm:text-right">
                        Seleccione "Punto y coma" para máxima compatibilidad con Excel.
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                     <h3 className="font-semibold text-gray-400">Balance General (Próximamente)</h3>
                     <p className="text-sm text-gray-400">Genera un balance de situación para el periodo seleccionado.</p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                     <h3 className="font-semibold text-gray-400">Cuenta de Resultados (Próximamente)</h3>
                     <p className="text-sm text-gray-400">Genera un informe de pérdidas y ganancias para el periodo seleccionado.</p>
                </div>
            </div>
        </Card>
    );
};

export default Reports;