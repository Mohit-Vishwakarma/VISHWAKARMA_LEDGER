
import React, { useState, useMemo } from 'react';
import { Order, Member, LedgerEntry, VendorPayment, TransactionType } from '../types';
import { useLedgerData } from '../hooks/useLedgerData';
import { Table, Column } from './ui/Table';
import Badge from './ui/Badge';

interface MemberLedgerProps {
  orders: Order[];
  vendorPayments: VendorPayment[];
  members: Member[];
}

const MemberLedger: React.FC<MemberLedgerProps> = ({ orders, vendorPayments, members }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const allLedgerData = useLedgerData(orders, vendorPayments, members);

  const filteredData = useMemo(() => {
    if (!selectedMemberId) return [];
    const memberName = members.find(m => m.id === selectedMemberId)?.name;
    return allLedgerData.filter(entry => entry.memberName === memberName);
  }, [allLedgerData, selectedMemberId, members]);

  const columns: Column<LedgerEntry>[] = [
    { title: 'Date', accessor: 'date' },
    { title: 'Ref ID', accessor: 'referenceId' },
    { title: 'Type', 
      accessor: 'transactionType',
      render: (item) => <Badge text={item.transactionType === TransactionType.Sale ? 'Received' : 'Paid'} colorScheme={item.transactionType === TransactionType.Sale ? 'green' : 'red'} />
    },
    { 
      title: 'Amount', 
      accessor: 'amount',
      render: (item) => (
        <span className={item.transactionType === TransactionType.Sale ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          ₹{item.amount.toLocaleString()}
        </span>
      )
    },
    { 
      title: 'Payment Mode', 
      accessor: 'paymentMode',
      render: (item) => <Badge text={item.paymentMode} colorScheme="blue" />
    },
    { title: 'Customer / Vendor', accessor: 'partyName' },
    { title: 'Notes', accessor: 'notes' },
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
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Member Ledger</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Transactions handled by a specific member.
              </p>
            </div>
            <div className="w-1/4">
              <label htmlFor="member-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Member
              </label>
              <select
                id="member-select"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <Table columns={columns} data={filteredData} />
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
