
import { useMemo } from 'react';
import { Order, VendorPayment, Member, LedgerEntry, TransactionType } from '../types';

export const useLedgerData = (orders: Order[], vendorPayments: VendorPayment[], members: Member[]): LedgerEntry[] => {
  return useMemo(() => {
    const memberMap = new Map(members.map(m => [m.id, m.name]));
    
    const ledgerEntries: LedgerEntry[] = [];

    // Process Sales from Orders
    orders.forEach(order => {
      order.payments.forEach(payment => {
        ledgerEntries.push({
          date: payment.date,
          transactionId: payment.id,
          referenceId: order.id,
          partyName: order.customerName,
          transactionType: TransactionType.Sale,
          description: order.productDescription,
          amount: payment.amount,
          paymentMode: payment.mode,
          memberName: memberMap.get(payment.memberId) || 'Unknown Member',
          paymentOf: payment.paymentOf,
          orderStatus: order.status,
          notes: order.notes,
          image: order.image,
        });
      });
    });

    // Process Purchases from Vendor Payments
    vendorPayments.forEach(payment => {
        ledgerEntries.push({
            date: payment.date,
            transactionId: payment.id,
            referenceId: payment.id,
            partyName: payment.vendorName,
            transactionType: TransactionType.Purchase,
            description: payment.description,
            amount: payment.amount,
            paymentMode: payment.mode,
            memberName: memberMap.get(payment.memberId) || 'Unknown Member',
            notes: payment.notes,
            image: payment.image,
        });
    });

    // Sort by most recent date first
    return ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, vendorPayments, members]);
};
