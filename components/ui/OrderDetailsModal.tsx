
import React, { useState, useEffect, useMemo } from 'react';
import { Order, Member } from '../../types';
import Modal from './Modal';
import Badge from './Badge';
import OrderStatusUpdater from './OrderStatusUpdater'; // Although status is updated elsewhere, we can display it consistently

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateDescription: (orderId: string, description: string) => void;
  members: Member[];
}

const InfoRow: React.FC<{ label: string; value?: string | React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value || '-'}</span>
  </div>
);

const FinancialsCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-xl font-bold ${color}`}>₹{value.toLocaleString()}</p>
    </div>
);

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, onUpdateDescription, members }) => {
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    if (order) {
      setDescription(order.statusDescription || '');
    }
  }, [order]);

  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m.name])), [members]);

  const totalPaid = useMemo(() => order?.payments.reduce((sum, p) => sum + p.amount, 0) ?? 0, [order]);
  const amountDue = useMemo(() => (order?.finalAmount ?? 0) - totalPaid, [order, totalPaid]);

  const handleDescriptionUpdate = () => {
    if (order) {
      onUpdateDescription(order.id, description);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: ${order.id}`}>
      <div className="space-y-6">
        {/* Customer & Order Info */}
        <section>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <InfoRow label="Customer" value={order.customerName} className="col-span-2 md:col-span-2" />
                <InfoRow label="Order Date" value={order.orderDate} />
                <InfoRow label="Entry Date" value={order.entryDate} />
                <InfoRow label="Assigned To" value={memberMap.get(order.assignedMemberId)} className="col-span-2" />
                <div className="col-span-2">
                    <InfoRow label="Description" value={order.productDescription} />
                </div>
            </div>
        </section>

        {/* Financials */}
        <section>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Financials</h4>
            <div className="flex flex-wrap gap-4">
                <FinancialsCard label="Total Amount" value={order.finalAmount} color="text-gray-800 dark:text-gray-200" />
                <FinancialsCard label="Total Paid" value={totalPaid} color="text-green-600 dark:text-green-400" />
                <FinancialsCard label="Amount Due" value={amountDue} color={amountDue > 0 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"} />
            </div>
        </section>

        {/* Status Description */}
        <section>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Status Description</h4>
             <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a status update for this order..."
                    rows={3}
                    className="flex-grow mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <button
                    onClick={handleDescriptionUpdate}
                    disabled={description === (order.statusDescription || '')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Update
                </button>
            </div>
        </section>

        {/* Payment History */}
        <section>
             <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Payment History</h4>
             <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mode</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Member</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {order.payments.length > 0 ? order.payments.map(p => (
                            <tr key={p.id}>
                                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{p.entryDate}</td>
                                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">₹{p.amount.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200"><Badge text={p.mode} colorScheme="blue" /></td>
                                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{memberMap.get(p.memberId)}</td>
                                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200"><Badge text={p.paymentOf} colorScheme="purple" /></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">No payments recorded for this order.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </section>
      </div>
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Close</button>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;