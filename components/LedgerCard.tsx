
import React from 'react';
import { LedgerEntry, TransactionType, OrderStatus } from '../types';
import Badge from './ui/Badge';
import OrderStatusUpdater from './ui/OrderStatusUpdater';

interface LedgerCardProps {
  entry: LedgerEntry;
  onViewImage: (image: string) => void;
  onDelete?: (entry: LedgerEntry) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onViewOrderDetails?: (orderId: string) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const LedgerCard: React.FC<LedgerCardProps> = ({ entry, onViewImage, onDelete, onUpdateOrderStatus, onViewOrderDetails }) => {
  const isSale = entry.transactionType === TransactionType.Sale;
  const borderColor = isSale ? 'border-green-500' : 'border-red-500';
  const amountColor = isSale ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const amountSign = isSale ? '+' : '-';

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 ${borderColor} p-4 flex flex-col space-y-3`}>
      {/* Card Header */}
      <div className="flex justify-between items-start">
        <button
          disabled={!isSale || !onViewOrderDetails}
          onClick={() => isSale && onViewOrderDetails && onViewOrderDetails(entry.referenceId)}
          className="pr-4 overflow-hidden text-left disabled:cursor-default"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Ref: {entry.referenceId}</p>
          <p className={`font-semibold text-gray-800 dark:text-white truncate ${isSale && onViewOrderDetails ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors' : ''}`}>{entry.partyName}</p>
        </button>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Entered: {entry.entryDate}</p>
              {entry.orderDate && <p className="text-xs text-gray-400 dark:text-gray-500">Ordered: {entry.orderDate}</p>}
          </div>
          {onDelete && (
              <button
                  onClick={() => onDelete(entry)}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  aria-label="Delete transaction"
              >
                  <TrashIcon />
              </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-grow min-h-[40px]">
        <p className="text-sm text-gray-600 dark:text-gray-300">{entry.description}</p>
        {entry.statusDescription && (
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Status Update:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  &ldquo;{entry.statusDescription}&rdquo;
              </p>
          </div>
        )}
      </div>
      
      {/* Amount and Member */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <div>
            <p className={`text-xl font-bold ${amountColor}`}>{amountSign}₹{entry.amount.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Handled by: {entry.memberName}</p>
            {entry.assignedMemberName && <p className="text-xs text-gray-500 dark:text-gray-400">Assigned to: {entry.assignedMemberName}</p>}
        </div>
        {entry.image && (
          <button
            onClick={() => onViewImage(entry.image!)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View Attachment
          </button>
        )}
      </div>

      {/* Card Footer - Badges */}
      <div className="flex flex-wrap gap-2 items-center">
        <Badge text={entry.paymentMode} colorScheme="blue" />
        {entry.paymentOf && <Badge text={entry.paymentOf} colorScheme="purple" />}
        {entry.orderStatus && onUpdateOrderStatus && (
          <OrderStatusUpdater 
            currentStatus={entry.orderStatus} 
            orderId={entry.referenceId}
            onStatusChange={onUpdateOrderStatus}
          />
        )}
      </div>
    </div>
  );
};

export default LedgerCard;