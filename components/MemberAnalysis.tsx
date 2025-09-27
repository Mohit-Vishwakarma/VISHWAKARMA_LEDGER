
import React, { useMemo } from 'react';
import { Order, Member, VendorPayment, PaymentMode, TransactionType } from '../types';
import { useLedgerData } from '../hooks/useLedgerData';

interface MemberAnalysisProps {
  orders: Order[];
  vendorPayments: VendorPayment[];
  members: Member[];
}

interface AnalysisData {
  received: { total: number; cash: number; online: number; cheque: number; };
  spent: { total: number; cash: number; online: number; cheque: number; };
}

const MemberAnalysis: React.FC<MemberAnalysisProps> = ({ orders, vendorPayments, members }) => {
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

  const StatCard: React.FC<{ title: string; amount: number; isPositive?: boolean }> = ({ title, amount, isPositive }) => (
    <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className={`text-xl font-bold ${isPositive ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            ₹{amount.toLocaleString()}
        </p>
    </div>
  );

  const NetStatCard: React.FC<{ title: string; amount: number; }> = ({ title, amount }) => {
    const isNetPositive = amount >= 0;
    return (
        <div className={`p-4 rounded-xl text-center shadow-inner ${isNetPositive ? 'bg-blue-50 dark:bg-blue-900/40' : 'bg-orange-50 dark:bg-orange-900/40'}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</p>
            <p className={`text-2xl font-extrabold ${isNetPositive ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'}`}>
                ₹{amount.toLocaleString()}
            </p>
        </div>
    );
  }

  return (
    <div>
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Member Analysis</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            A breakdown of total funds received and spent by each member, and the net amount they should have in hand.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(analysisByMember).map(([memberName, data]) => {
                const netCash = data.received.cash - data.spent.cash;
                const netOnline = data.received.online - data.spent.online;
                const netCheque = data.received.cheque - data.spent.cheque;
                const netTotal = data.received.total - data.spent.total;

                return (
                    <div key={memberName} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">{memberName}</h3>
                        </div>
                        <div className="p-5 space-y-6">
                            {/* Received Section */}
                            <div>
                                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">Total Received: ₹{data.received.total.toLocaleString()}</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <StatCard title="Cash" amount={data.received.cash} isPositive/>
                                    <StatCard title="Online" amount={data.received.online} isPositive/>
                                    <StatCard title="Cheque" amount={data.received.cheque} isPositive/>
                                </div>
                            </div>
                            {/* Spent Section */}
                            <div>
                                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3">Total Spent: ₹{data.spent.total.toLocaleString()}</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <StatCard title="Cash" amount={data.spent.cash}/>
                                    <StatCard title="Online" amount={data.spent.online}/>
                                    <StatCard title="Cheque" amount={data.spent.cheque}/>
                                </div>
                            </div>
                            {/* Net In Hand Section */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                               <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 text-center text-lg">Net In Hand</h4>
                                <div className="grid grid-cols-1 gap-4">
                                     <div className="grid grid-cols-3 gap-3">
                                        <NetStatCard title="Cash" amount={netCash}/>
                                        <NetStatCard title="Online" amount={netOnline}/>
                                        <NetStatCard title="Cheque" amount={netCheque}/>
                                     </div>
                                     <div className="mt-2">
                                        <NetStatCard title="Total Net Balance" amount={netTotal} />
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
