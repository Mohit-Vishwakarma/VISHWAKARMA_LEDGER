
import React from 'react';
import { OrderStatus } from '../../types';

interface OrderStatusUpdaterProps {
  currentStatus: OrderStatus;
  orderId: string;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const getStatusColorClasses = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Completed:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case OrderStatus.Ready:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case OrderStatus.InProgress:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case OrderStatus.Pending:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case OrderStatus.Cancelled:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({ currentStatus, orderId, onStatusChange }) => {
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(orderId, e.target.value as OrderStatus);
  };

  const colorClasses = getStatusColorClasses(currentStatus);

  return (
    <div className={`relative inline-flex items-center rounded-full transition-colors`}>
      <select
        value={currentStatus}
        onChange={handleSelectChange}
        className={`appearance-none cursor-pointer pl-2.5 pr-6 py-0.5 border-none rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${colorClasses}`}
        aria-label="Update order status"
      >
        {Object.values(OrderStatus).map(status => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
       <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};

export default OrderStatusUpdater;
