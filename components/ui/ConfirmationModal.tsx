import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    confirmVariant?: 'primary' | 'secondary' | 'danger';
    errorMessage?: string | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirmar',
    confirmVariant = 'primary',
    errorMessage = null
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-gray-600">
                {children}
            </div>
            {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{errorMessage}</p>
                </div>
            )}
            <div className="flex justify-end space-x-3 pt-6">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
                <Button type="button" variant={confirmVariant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
