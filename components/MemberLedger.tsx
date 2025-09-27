
import React, { useState, useMemo } from 'react';
import { Order, Member, LedgerEntry, VendorPayment, TransactionType, OrderStatus } from '../types';
import { useLedgerData } from '../hooks/useLedgerData';
import { Table, Column } from './ui/Table';
import Badge from './ui/Badge';
import ViewSwitcher from './ui/ViewSwitcher';
import LedgerCard from './LedgerCard';
import OrderStatusUpdater from './ui/OrderStatusUpdater';

interface MemberLedgerProps {
  orders: Order[];
  vendorPayments: VendorPayment[];
  members: Member[];
  onDeleteRequest: (entry: LedgerEntry) => void;
  selectedMemberId: string;
  onMemberChange: (memberId: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewOrderDetails: (orderId: string) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const MemberLedger: React.FC<MemberLedgerProps> = ({ orders, vendorPayments, members, onDeleteRequest, selectedMemberId, onMemberChange, onUpdateOrderStatus, onViewOrderDetails }) => {
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const allLedgerData = useLedgerData(orders, vendorPayments, members);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const filteredData = useMemo(() => {
    if (!selectedMemberId) return [];
    const memberName = members.find(m => m.id === selectedMemberId)?.name;
    return allLedgerData.filter(entry => entry.memberName === memberName);
  }, [allLedgerData, selectedMemberId, members]);

  const columns: Column<LedgerEntry>[] = [
    { title: 'Entry Date', accessor: 'entryDate' },
    { 
      title: 'Order Date', 
      accessor: 'orderDate',
      render: (item) => item.orderDate || <span className="text-gray-400">-</span>
    },
    { 
        title: 'Ref ID', 
        accessor: 'referenceId',
        render: (item) => item.transactionType === TransactionType.Sale ? (
            <button onClick={() => onViewOrderDetails(item.referenceId)} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                {item.referenceId}
            </button>
        ) : item.referenceId
    },
    { title: 'Type', 
      accessor: 'transactionType',
      render: (item) => <Badge text={item.transactionType === TransactionType.Sale ? 'Received' : 'Paid'} colorScheme={item.transactionType === TransactionType.Sale ? 'green' : 'red'} />
    },
    { title: 'Party', accessor: 'partyName' },
    { 
        title: 'Description', 
        accessor: 'description',
        render: (item) => (
            <div>
                <p>{item.description}</p>
                {item.statusDescription && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic whitespace-pre-wrap max-w-xs">
                        &ldquo;{item.statusDescription}&rdquo;
                    </p>
                )}
            </div>
        )
     },
    { 
      title: 'Amount', 
      accessor: 'amount',
      render: (item) => (
        <span className={item.transactionType === TransactionType.Sale ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
          ₹{item.amount.toLocaleString()}
        </span>
      )
    },
    { title: 'Assigned To', accessor: 'assignedMemberName', render: (item) => item.assignedMemberName || '-' },
    { 
      title: 'Status', 
      accessor: 'orderStatus',
      render: (item) => item.orderStatus ? (
        <OrderStatusUpdater 
          currentStatus={item.orderStatus} 
          orderId={item.referenceId}
          onStatusChange={onUpdateOrderStatus}
        />
      ) : '-'
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
    },
    {
      title: 'Actions',
      accessor: 'transactionId' as any, // Only for key purposes
      render: (item) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => onDeleteRequest(item)}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="Delete transaction"
          >
            <TrashIcon />
          </button>
        </div>
      ),
    }
  ];
  
  const renderContent = () => {
    if (!selectedMemberId && members.length > 0) {
        return (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">Please select a member to view their transactions.</p>
            </div>
        )
    }
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">No transactions found for this member.</p>
        </div>
      );
    }

    if (viewMode === 'card') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900">
          {filteredData.map(entry => (
            <LedgerCard 
              key={entry.transactionId} 
              entry={entry} 
              onViewImage={setViewingImage} 
              onDelete={onDeleteRequest}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onViewOrderDetails={onViewOrderDetails}
            />
          ))}
        </div>
      );
    }
    return <Table columns={columns} data={filteredData} />;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Member Ledger</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Transactions handled by a specific member.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <select
                id="member-select"
                value={selectedMemberId}
                onChange={(e) => onMemberChange(e.target.value)}
                className="w-full sm:w-48 block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
            </div>
          </div>
        </div>
        {renderContent()}
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

export default MemberLedger;