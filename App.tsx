
import React, { useState, useCallback } from 'react';
import { Order, VendorPayment, Member } from './types';
import { INITIAL_ORDERS, INITIAL_MEMBERS, INITIAL_VENDOR_PAYMENTS } from './constants';
import MasterLedger from './components/MasterLedger';
import MemberLedger from './components/MemberLedger';
import MemberAnalysis from './components/MemberAnalysis';
import NewTransactionModal from './components/NewOrderModal';
import ManageMembersModal from './components/ManageMembersModal';

type View = 'master' | 'member' | 'analysis';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('master');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(INITIAL_VENDOR_PAYMENTS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);


  const addOrder = useCallback((newOrder: Order) => {
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setIsTransactionModalOpen(false);
  }, []);

  const addVendorPayment = useCallback((newPayment: VendorPayment) => {
    setVendorPayments(prevPayments => [newPayment, ...prevPayments]);
    setIsTransactionModalOpen(false);
  }, []);
  
  const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setActiveView(view)}
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
        return <MasterLedger orders={orders} vendorPayments={vendorPayments} members={members} />;
      case 'member':
        return <MemberLedger orders={orders} vendorPayments={vendorPayments} members={members} />;
      case 'analysis':
        return <MemberAnalysis orders={orders} vendorPayments={vendorPayments} members={members} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Ledger System
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                <NavButton view="master" label="Master Ledger" />
                <NavButton view="member" label="Member Ledger" />
                <NavButton view="analysis" label="Member Analysis" />
              </div>
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
      />
    </div>
  );
};

export default App;
