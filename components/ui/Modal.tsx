
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8 overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 dark:border-gray-700 rounded-t">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 ml-auto bg-transparent border-0 text-black dark:text-white opacity-50 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:opacity-100"
          >
            <span className="h-6 w-6 text-2xl block outline-none focus:outline-none">
              ×
            </span>
          </button>
        </div>
        <div className="relative p-6 flex-auto max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
