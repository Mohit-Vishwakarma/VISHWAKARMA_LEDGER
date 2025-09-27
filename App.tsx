
import React, { useState, useCallback, useEffect } from 'react';
import { Order, VendorPayment, Member, LedgerEntry, TransactionType, OrderStatus } from './types';
import { INITIAL_ORDERS, INITIAL_MEMBERS, INITIAL_VENDOR_PAYMENTS } from './constants';
import MasterLedger from './components/MasterLedger';
import MemberLedger from './components/MemberLedger';
import MemberAnalysis from './components/MemberAnalysis';
import NewTransactionModal from './components/NewOrderModal';
import ManageMembersModal from './components/ManageMembersModal';
import ConfirmationModal from './components/ui/ConfirmationModal';
import OrderDetailsModal from './components/ui/OrderDetailsModal';

type View = 'master' | 'member' | 'analysis';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('master');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(INITIAL_VENDOR_PAYMENTS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionToDelete, setTransactionToDelete] = useState<LedgerEntry | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(INITIAL_MEMBERS[0]?.id || '');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    // If the selected member was deleted, select the first available member.
    if (!members.find(m => m.id === selectedMemberId) && members.length > 0) {
        setSelectedMemberId(members[0].id);
    } else if (members.length === 0) {
        setSelectedMemberId('');
    }
  }, [members, selectedMemberId]);


  const handleViewChange = (view: View) => {
    if (view !== 'master') {
      setSearchQuery('');
    }
    if (view === 'member' && !selectedMemberId && members.length > 0) {
        setSelectedMemberId(members[0].id);
    }
    setActiveView(view);
  };

  const addOrder = useCallback((newOrder: Order) => {
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setIsTransactionModalOpen(false);
  }, []);

  const addVendorPayment = useCallback((newPayment: VendorPayment) => {
    setVendorPayments(prevPayments => [newPayment, ...prevPayments]);
    setIsTransactionModalOpen(false);
  }, []);
  
  const handleDeleteRequest = useCallback((entry: LedgerEntry) => {
    setTransactionToDelete(entry);
  }, []);

  const cancelDelete = useCallback(() => {
    setTransactionToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!transactionToDelete) return;

    if (transactionToDelete.transactionType === TransactionType.Purchase) {
        setVendorPayments(prev => prev.filter(p => p.id !== transactionToDelete.transactionId));
    } else if (transactionToDelete.transactionType === TransactionType.Sale) {
        setOrders(prevOrders => {
            return prevOrders.map(order => {
                if (order.id === transactionToDelete.referenceId) {
                    const updatedOrder = { ...order };
                    updatedOrder.payments = updatedOrder.payments.filter(p => p.id !== transactionToDelete.transactionId);
                    // Status is now manual, so we don't recalculate it here.
                    return updatedOrder;
                }
                return order;
            }).filter(order => order.payments.length > 0 || order.status !== OrderStatus.Pending); // Optional: remove orders with no payments if they are still pending
        });
    }

    setTransactionToDelete(null);
  }, [transactionToDelete]);
  
  const handleUpdateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }, []);
  
  const handleUpdateOrderStatusDescription = useCallback((orderId: string, description: string) => {
    setOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, statusDescription: description } : order
        )
    );
    // Also update the viewing order so the change is reflected immediately in the modal
    setViewingOrder(prev => prev ? { ...prev, statusDescription: description } : null);
  }, []);

  const handleMemberAnalysisClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setActiveView('member');
  };

  const handleViewOrderDetails = useCallback((orderId: string) => {
    const orderToView = orders.find(o => o.id === orderId);
    if (orderToView) {
        setViewingOrder(orderToView);
    }
  }, [orders]);

  const handleCloseOrderDetails = useCallback(() => {
    setViewingOrder(null);
  }, []);

  const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => handleViewChange(view)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeView === view
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const renderActiveView = () => {
    switch(activeView) {
      case 'master':
        return <MasterLedger orders={orders} vendorPayments={vendorPayments} members={members} searchQuery={searchQuery} onDeleteRequest={handleDeleteRequest} onUpdateOrderStatus={handleUpdateOrderStatus} onViewOrderDetails={handleViewOrderDetails} />;
      case 'member':
        return <MemberLedger orders={orders} vendorPayments={vendorPayments} members={members} onDeleteRequest={handleDeleteRequest} selectedMemberId={selectedMemberId} onMemberChange={setSelectedMemberId} onUpdateOrderStatus={handleUpdateOrderStatus} onViewOrderDetails={handleViewOrderDetails} />;
      case 'analysis':
        return <MemberAnalysis orders={orders} vendorPayments={vendorPayments} members={members} onMemberCardClick={handleMemberAnalysisClick} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Jay Shree Vishwakarma Timber Traders
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member Ledger System</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 mt-2 w-full sm:w-auto sm:mt-0">
              <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                <NavButton view="master" label="Master Ledger" />
                <NavButton view="member" label="Member Ledger" />
                <NavButton view="analysis" label="Member Analysis" />
              </div>
              
              {activeView === 'master' && (
                  <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Search party, description, ref ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent sm:text-sm transition-all duration-300 ease-in-out"
                    />
                    {searchQuery && (
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                        <button 
                          onClick={() => setSearchQuery('')} 
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800" 
                          aria-label="Clear search">
                          <ClearIcon />
                        </button>
                      </div>
                    )}
                  </div>
              )}
               <button
                onClick={() => setIsMembersModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Manage Members
              </button>
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                + New Transaction
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderActiveView()}
      </main>

      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirm Transaction Deletion"
        message={
          <>
            <p>Are you sure you want to delete this transaction record? This action cannot be undone.</p>
            {transactionToDelete && (
               <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{transactionToDelete.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {transactionToDelete.partyName} - <span className={transactionToDelete.transactionType === TransactionType.Sale ? 'text-green-600' : 'text-red-500'}>₹{transactionToDelete.amount.toLocaleString()}</span>
                  </p>
               </div>
            )}
          </>
        }
      />

      <NewTransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
        onAddOrder={addOrder}
        onAddVendorPayment={addVendorPayment}
        members={members}
        nextOrderId={`ORD-${(orders.length + 1).toString().padStart(3, '0')}`}
        nextVendorPaymentId={`VEN-${(vendorPayments.length + 1).toString().padStart(3, '0')}`}
      />
      <ManageMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        setMembers={setMembers}
        orders={orders}
        vendorPayments={vendorPayments}
      />
      <OrderDetailsModal
        isOpen={!!viewingOrder}
        onClose={handleCloseOrderDetails}
        order={viewingOrder}
        onUpdateDescription={handleUpdateOrderStatusDescription}
        members={members}
      />
    </div>
  );
};

export default App;