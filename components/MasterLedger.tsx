
import React, { useState } from 'react';
import { Order, Member, VendorPayment, LedgerEntry, TransactionType } from '../types';
import { useLedgerData } from '../hooks/useLedgerData';
import { Table, Column } from './ui/Table';
import Badge from './ui/Badge';


interface MasterLedgerProps {
  orders: Order[];
  vendorPayments: VendorPayment[];
  members: Member[];
}

const MasterLedger: React.FC<MasterLedgerProps> = ({ orders, vendorPayments, members }) => {
  const ledgerData = useLedgerData(orders, vendorPayments, members);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const columns: Column<LedgerEntry>[] = [
    { title: 'Date', accessor: 'date' },
    { title: 'Ref ID', accessor: 'referenceId' },
    { 
      title: 'Type',
      accessor: 'transactionType',
      render: (item) => <Badge text={item.transactionType} colorScheme={item.transactionType === TransactionType.Sale ? 'green' : 'red'} />
    },
    { title: 'Party', accessor: 'partyName' },
    { title: 'Description', accessor: 'description' },
    { 
      title: 'Amount', 
      accessor: 'amount',
      render: (item) => (
        <span className={item.transactionType === TransactionType.Sale ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {item.transactionType === TransactionType.Sale ? '+' : '-'}₹{item.amount.toLocaleString()}
        </span>
      )
    },
    { 
      title: 'Payment Mode', 
      accessor: 'paymentMode',
      render: (item) => <Badge text={item.paymentMode} colorScheme="blue" />
    },
    { title: 'Member', accessor: 'memberName' },
    { 
      title: 'Details', 
      accessor: 'paymentOf',
      render: (item) => item.paymentOf ? <Badge text={item.paymentOf} colorScheme="purple" /> : '-'
    },
    { 
      title: 'Status', 
      accessor: 'orderStatus',
      render: (item) => item.orderStatus ? <Badge text={item.orderStatus} colorScheme={item.orderStatus === 'Completed' ? 'green' : item.orderStatus === 'Partial Payment' ? 'yellow' : 'red'} /> : '-'
    },
    {
      title: 'Attachment',
      accessor: 'image',
      render: (item) => item.image ? (
        <button
          onClick={() => setViewingImage(item.image!)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
        >
          View
        </button>
      ) : (
        <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
      )
    }
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Master Ledger</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            A comprehensive view of all transactions across all members.
          </p>
        </div>
        <Table columns={columns} data={ledgerData} />
      </div>

      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative p-4 max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={viewingImage} alt="Attachment" className="rounded-lg object-contain h-full w-full" />
            <button 
              onClick={() => setViewingImage(null)} 
              className="absolute -top-2 -right-2 text-white bg-gray-800 rounded-full p-1 leading-none text-2xl hover:bg-black"
              aria-label="Close image viewer"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MasterLedger;
