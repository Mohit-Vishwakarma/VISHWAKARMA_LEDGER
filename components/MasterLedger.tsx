
import React, { useState, useMemo } from 'react';
import { Order, Member, VendorPayment, LedgerEntry, TransactionType, PaymentMode, OrderStatus } from '../types';
import { useLedgerData } from '../hooks/useLedgerData';
import { Table, Column } from './ui/Table';
import Badge from './ui/Badge';
import ViewSwitcher from './ui/ViewSwitcher';
import LedgerCard from './LedgerCard';
import { exportToCsv } from '../utils';
import OrderStatusUpdater from './ui/OrderStatusUpdater';


interface MasterLedgerProps {
  orders: Order[];
  vendorPayments: VendorPayment[];
  members: Member[];
  searchQuery: string;
  onDeleteRequest: (entry: LedgerEntry) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewOrderDetails: (orderId: string) => void;
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);


const MasterLedger: React.FC<MasterLedgerProps> = ({ orders, vendorPayments, members, searchQuery, onDeleteRequest, onUpdateOrderStatus, onViewOrderDetails }) => {
  const ledgerData = useLedgerData(orders, vendorPayments, members);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  
  const areFiltersActive = useMemo(() => {
    return dateRange.start !== '' || dateRange.end !== '' || selectedType !== 'all' || selectedMode !== 'all';
  }, [dateRange, selectedType, selectedMode]);

  const filteredLedgerData = useMemo(() => {
    let data = [...ledgerData];

    // 1. Filter by search query
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (lowercasedQuery) {
            data = data.filter(entry =>
                entry.partyName.toLowerCase().includes(lowercasedQuery) ||
                entry.description.toLowerCase().includes(lowercasedQuery) ||
                entry.referenceId.toLowerCase().includes(lowercasedQuery) ||
                (entry.notes && entry.notes.toLowerCase().includes(lowercasedQuery))
            );
        }
    }

    // 2. Filter by date range
    if (dateRange.start) {
        data = data.filter(entry => entry.entryDate >= dateRange.start);
    }
    if (dateRange.end) {
        data = data.filter(entry => entry.entryDate <= dateRange.end);
    }

    // 3. Filter by transaction type
    if (selectedType !== 'all') {
        data = data.filter(entry => entry.transactionType === selectedType);
    }
    
    // 4. Filter by payment mode
    if (selectedMode !== 'all') {
        data = data.filter(entry => entry.paymentMode === selectedMode);
    }

    return data;
  }, [ledgerData, searchQuery, dateRange, selectedType, selectedMode]);

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedType('all');
    setSelectedMode('all');
  };

  const handleExport = () => {
    const dataToExport = filteredLedgerData.map(entry => ({
      entryDate: entry.entryDate,
      orderDate: entry.orderDate || '',
      referenceId: entry.referenceId,
      transactionType: entry.transactionType,
      partyName: entry.partyName,
      description: entry.description,
      statusDescription: entry.statusDescription || '',
      amount: `${entry.transactionType === TransactionType.Sale ? '+' : '-'}${entry.amount}`,
      paymentMode: entry.paymentMode,
      memberName: entry.memberName,
      assignedMemberName: entry.assignedMemberName || '',
      paymentOf: entry.paymentOf || '',
      orderStatus: entry.orderStatus || '',
      notes: entry.notes || '',
    }));

    const headers: {key: keyof typeof dataToExport[0], label: string}[] = [
      { key: 'entryDate', label: 'Entry Date' },
      { key: 'orderDate', label: 'Order Date' },
      { key: 'referenceId', label: 'Ref ID' },
      { key: 'transactionType', label: 'Type' },
      { key: 'partyName', label: 'Party' },
      { key: 'description', label: 'Description' },
      { key: 'statusDescription', label: 'Status Description' },
      { key: 'amount', label: 'Amount (INR)' },
      { key: 'paymentMode', label: 'Payment Mode' },
      { key: 'memberName', label: 'Handled By' },
      { key: 'assignedMemberName', label: 'Assigned To'},
      { key: 'paymentOf', label: 'Details' },
      { key: 'orderStatus', label: 'Status' },
      { key: 'notes', label: 'Notes' },
    ];
    
    exportToCsv({
      data: dataToExport,
      headers,
      filename: `master-ledger-${new Date().toISOString().split('T')[0]}.csv`,
    });
  };

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
    { 
      title: 'Type',
      accessor: 'transactionType',
      render: (item) => <Badge text={item.transactionType} colorScheme={item.transactionType === TransactionType.Sale ? 'green' : 'red'} />
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
          {item.transactionType === TransactionType.Sale ? '+' : '-'}₹{item.amount.toLocaleString()}
        </span>
      )
    },
    { title: 'Handled By', accessor: 'memberName' },
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
    if (filteredLedgerData.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || areFiltersActive
             ? 'No transactions found matching your filters.' 
             : 'No transactions recorded yet.'}
          </p>
        </div>
      );
    }
    
    if (viewMode === 'card') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900">
          {filteredLedgerData.map(entry => (
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
    return <Table columns={columns} data={filteredLedgerData} />;
  }
  
  const FilterControlWrapper: React.FC<{label: string; children: React.ReactNode;}> = ({label, children}) => (
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        {children}
      </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Master Ledger</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Displaying <span className="font-bold text-gray-800 dark:text-gray-200">{filteredLedgerData.length}</span> of {ledgerData.length} transactions.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
            <button
                onClick={() => setShowFilters(prev => !prev)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    areFiltersActive
                    ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                aria-label="Toggle filters"
                aria-expanded={showFilters}
            >
                <FilterIcon />
                <span className="hidden sm:inline">Filters</span>
                {areFiltersActive && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
            </button>
            <button
                onClick={handleExport}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label="Export data to CSV"
            >
                <ExportIcon />
                <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
        
        {/* Collapsible Filter Bar */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-[300px]' : 'max-h-0'}`}>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <style>{`.form-filter { @apply block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200; }`}</style>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                    <FilterControlWrapper label="Start Date">
                        <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="form-filter" />
                    </FilterControlWrapper>
                     <FilterControlWrapper label="End Date">
                        <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="form-filter" />
                    </FilterControlWrapper>
                     <FilterControlWrapper label="Transaction Type">
                        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="form-filter">
                            <option value="all">All Types</option>
                            <option value={TransactionType.Sale}>Sale</option>
                            <option value={TransactionType.Purchase}>Purchase</option>
                        </select>
                    </FilterControlWrapper>
                     <FilterControlWrapper label="Payment Mode">
                         <select value={selectedMode} onChange={e => setSelectedMode(e.target.value)} className="form-filter">
                            <option value="all">All Modes</option>
                            {Object.values(PaymentMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                        </select>
                    </FilterControlWrapper>
                    <button 
                        onClick={handleClearFilters}
                        className="w-full lg:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900"
                    >
                        Clear Filters
                    </button>
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

export default MasterLedger;