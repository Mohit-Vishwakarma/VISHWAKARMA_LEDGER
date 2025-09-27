
import React from 'react';
import { LedgerEntry, TransactionType } from '../types';
import Badge from './ui/Badge';

interface LedgerCardProps {
  entry: LedgerEntry;
  onViewImage: (image: string) => void;
  onDelete?: (entry: LedgerEntry) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const LedgerCard: React.FC<LedgerCardProps> = ({ entry, onViewImage, onDelete }) => {
  const isSale = entry.transactionType === TransactionType.Sale;
  const borderColor = isSale ? 'border-green-500' : 'border-red-500';
  const amountColor = isSale ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const amountSign = isSale ? '+' : '-';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 ${borderColor} p-4 flex flex-col space-y-3`}>
      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div className="pr-4 overflow-hidden">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ref: {entry.referenceId}</p>
          <p className="font-semibold text-gray-800 dark:text-white truncate">{entry.partyName}</p>
        </div>
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
      <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow min-h-[40px]">{entry.description}</p>
      
      {/* Amount and Member */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <div>
            <p className={`text-xl font-bold ${amountColor}`}>{amountSign}₹{entry.amount.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">by {entry.memberName}</p>
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
        {entry.orderStatus && <Badge text={entry.orderStatus} colorScheme={entry.orderStatus === 'Completed' ? 'green' : entry.orderStatus === 'Partial Payment' ? 'yellow' : 'red'} />}
      </div>
    </div>
  );
};

export default LedgerCard;
