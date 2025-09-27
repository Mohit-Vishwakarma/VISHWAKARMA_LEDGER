
import { Member, Order, VendorPayment, PaymentMode, PaymentOf, OrderStatus } from './types';

export const INITIAL_MEMBERS: Member[] = [
  { id: 'mem-1', name: 'Alice' },
  { id: 'mem-2', name: 'Bob' },
  { id: 'mem-3', name: 'Charlie' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    productDescription: 'Ready-stock: 10x T-shirts',
    totalAmount: 5000,
    discount: 200,
    finalAmount: 4800,
    status: OrderStatus.Completed,
    date: '2024-07-20',
    notes: 'Urgent delivery',
    payments: [
      { id: 'pay-1', amount: 4800, mode: PaymentMode.Online, memberId: 'mem-1', paymentOf: PaymentOf.Final, date: '2024-07-20' }
    ]
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    productDescription: 'Custom order: 1x Designer Gown',
    totalAmount: 15000,
    discount: 0,
    finalAmount: 15000,
    status: OrderStatus.Partial,
    date: '2024-07-21',
    payments: [
      { id: 'pay-2', amount: 5000, mode: PaymentMode.Cash, memberId: 'mem-2', paymentOf: PaymentOf.Advance, date: '2024-07-21' },
      { id: 'pay-3', amount: 5000, mode: PaymentMode.Online, memberId: 'mem-1', paymentOf: PaymentOf.Partial, date: '2024-07-25' }
    ]
  },
  {
    id: 'ORD-003',
    customerName: 'Peter Jones',
    productDescription: 'Ready-stock: 5x Hoodies',
    totalAmount: 7500,
    discount: 500,
    finalAmount: 7000,
    status: OrderStatus.Completed,
    date: '2024-07-22',
    notes: 'Gift wrapped',
    payments: [
      { id: 'pay-4', amount: 7000, mode: PaymentMode.Online, memberId: 'mem-3', paymentOf: PaymentOf.Final, date: '2024-07-22' }
    ]
  },
  {
    id: 'ORD-004',
    customerName: 'Mary Williams',
    productDescription: 'Custom order: Wedding Attire',
    totalAmount: 50000,
    discount: 2000,
    finalAmount: 48000,
    status: OrderStatus.Completed,
    date: '2024-07-15',
    payments: [
      { id: 'pay-5', amount: 20000, mode: PaymentMode.Online, memberId: 'mem-2', paymentOf: PaymentOf.Advance, date: '2024-07-15' },
      { id: 'pay-6', amount: 28000, mode: PaymentMode.Cash, memberId: 'mem-2', paymentOf: PaymentOf.Final, date: '2024-07-28' }
    ]
  }
];

export const INITIAL_VENDOR_PAYMENTS: VendorPayment[] = [
  {
    id: 'VEN-001',
    vendorName: 'Fabric Suppliers Inc.',
    description: 'Payment for raw silk material',
    amount: 12000,
    mode: PaymentMode.Cheque,
    memberId: 'mem-1',
    date: '2024-07-18',
    notes: 'Cheque #12345'
  },
  {
    id: 'VEN-002',
    vendorName: 'Local Artisan Weavers',
    description: 'Weaving charges for Gown',
    amount: 3000,
    mode: PaymentMode.Cash,
    memberId: 'mem-2',
    date: '2024-07-23',
  }
];
