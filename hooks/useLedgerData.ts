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
          entryDate: payment.entryDate,
          transactionId: payment.id,
          referenceId: order.id,
          partyName: order.customerName,
          transactionType: TransactionType.Sale,
          description: order.productDescription,
          amount: payment.amount,
          paymentMode: payment.mode,
          memberName: memberMap.get(payment.memberId) || 'Unknown Member',
          assignedMemberName: memberMap.get(order.assignedMemberId) || 'Unassigned',
          orderDate: order.orderDate,
          paymentOf: payment.paymentOf,
          orderStatus: order.status,
          statusDescription: order.statusDescription,
          notes: order.notes,
          image: order.image,
        });
      });
    });

    // Process Purchases from Vendor Payments
    vendorPayments.forEach(payment => {
        ledgerEntries.push({
            entryDate: payment.entryDate,
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

    // Sort by most recent date first. Prioritize orderDate for sales, otherwise use entryDate.
    return ledgerEntries.sort((a, b) => {
      const dateA = a.orderDate || a.entryDate;
      const dateB = b.orderDate || b.entryDate;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [orders, vendorPayments, members]);
};
