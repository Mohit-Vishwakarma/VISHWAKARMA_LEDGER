import React, { useMemo } from 'react';
import { Order, Member, VendorPayment, TransactionType } from '../types';
import { useLedgerData } from '../hooks/useLedgerData';
import { exportToCsv } from '../utils';

interface MemberAnalysisProps {
  orders: Order[];
  vendorPayments: VendorPayment[];
  members: Member[];
  onMemberCardClick: (memberId: string) => void;
}

interface AnalysisData {
  received: { total: number; cash: number; online: number; cheque: number; };
  spent: { total: number; cash: number; online: number; cheque: number; };
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const IncomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ExpenseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const OnlineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const ChequeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const BreakdownRow: React.FC<{ icon: React.ReactNode; label: string; amount: number }> = ({ icon, label, amount }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
            {icon}
            <span className="ml-2">{label}</span>
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200">₹{amount.toLocaleString()}</span>
    </div>
);

const MemberAnalysis: React.FC<MemberAnalysisProps> = ({ orders, vendorPayments, members, onMemberCardClick }) => {
  const allLedgerData = useLedgerData(orders, vendorPayments, members);

  const analysisByMember = useMemo(() => {
    const data: Record<string, AnalysisData> = {};

    members.forEach(member => {
      data[member.name] = {
        received: { total: 0, cash: 0, online: 0, cheque: 0 },
        spent: { total: 0, cash: 0, online: 0, cheque: 0 },
      };
    });

    allLedgerData.forEach(entry => {
      if (!data[entry.memberName]) return;

      const amount = entry.amount;
      const modeKey = entry.paymentMode.toLowerCase() as keyof AnalysisData['received' | 'spent'];

      if (entry.transactionType === TransactionType.Sale) {
        data[entry.memberName].received.total += amount;
        if(modeKey in data[entry.memberName].received) {
           data[entry.memberName].received[modeKey] += amount;
        }
      } else if (entry.transactionType === TransactionType.Purchase) {
        data[entry.memberName].spent.total += amount;
        if(modeKey in data[entry.memberName].spent) {
            data[entry.memberName].spent[modeKey] += amount;
        }
      }
    });

    return data;
  }, [allLedgerData, members]);

  const handleExport = () => {
    const dataToExport = Object.entries(analysisByMember).map(([memberName, data]) => {
      const netTotal = data.received.total - data.spent.total;
      const netCash = data.received.cash - data.spent.cash;
      const netOnline = data.received.online - data.spent.online;
      const netCheque = data.received.cheque - data.spent.cheque;

      return {
        memberName,
        totalReceived: data.received.total,
        receivedCash: data.received.cash,
        receivedOnline: data.received.online,
        receivedCheque: data.received.cheque,
        totalSpent: data.spent.total,
        spentCash: data.spent.cash,
        spentOnline: data.spent.online,
        spentCheque: data.spent.cheque,
        netTotal,
        netCash,
        netOnline,
        netCheque,
      };
    });

    const headers: {key: keyof typeof dataToExport[0], label: string}[] = [
      { key: 'memberName', label: 'Member Name' },
      { key: 'totalReceived', label: 'Total Received' },
      { key: 'receivedCash', label: 'Received (Cash)' },
      { key: 'receivedOnline', label: 'Received (Online)' },
      { key: 'receivedCheque', label: 'Received (Cheque)' },
      { key: 'totalSpent', label: 'Total Spent' },
      { key: 'spentCash', label: 'Spent (Cash)' },
      { key: 'spentOnline', label: 'Spent (Online)' },
      { key: 'spentCheque', label: 'Spent (Cheque)' },
      { key: 'netTotal', label: 'Net Total' },
      { key: 'netCash', label: 'Net (Cash)' },
      { key: 'netOnline', label: 'Net (Online)' },
      { key: 'netCheque', label: 'Net (Cheque)' },
    ];

    exportToCsv({
      data: dataToExport,
      headers,
      filename: `member-analysis-${new Date().toISOString().split('T')[0]}.csv`,
    });
  };

  return (
    <div>
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Member Analysis</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                A breakdown of total funds received and spent by each member.
              </p>
            </div>
            <button
                onClick={handleExport}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label="Export analysis to CSV"
            >
                <ExportIcon />
                <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(analysisByMember).map(([memberName, data]) => {
                const netTotal = data.received.total - data.spent.total;
                const isNetPositive = netTotal >= 0;
                
                const member = members.find(m => m.name === memberName);
                if (!member) return null;

                return (
                    <div 
                        key={memberName}
                        onClick={() => onMemberCardClick(member.id)}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1.5 cursor-pointer"
                    >
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-1">{memberName}</h3>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">Net Balance</p>
                            <p className={`text-center text-4xl font-extrabold mb-5 ${isNetPositive ? 'text-green-500' : 'text-red-500'}`}>
                                ₹{netTotal.toLocaleString()}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-5 border-t border-gray-200 dark:border-gray-700 pt-5">
                                {/* Income Column */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full">
                                            <IncomeIcon />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">₹{data.received.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pl-1">
                                        <BreakdownRow icon={<CashIcon />} label="Cash" amount={data.received.cash} />
                                        <BreakdownRow icon={<OnlineIcon />} label="Online" amount={data.received.online} />
                                        <BreakdownRow icon={<ChequeIcon />} label="Cheque" amount={data.received.cheque} />
                                    </div>
                                </div>
                                
                                {/* Expense Column */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-full">
                                            <ExpenseIcon />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
                                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">₹{data.spent.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pl-1">
                                        <BreakdownRow icon={<CashIcon />} label="Cash" amount={data.spent.cash} />
                                        <BreakdownRow icon={<OnlineIcon />} label="Online" amount={data.spent.online} />
                                        <BreakdownRow icon={<ChequeIcon />} label="Cheque" amount={data.spent.cheque} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default MemberAnalysis;