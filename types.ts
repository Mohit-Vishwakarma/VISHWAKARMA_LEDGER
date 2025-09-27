
export enum PaymentMode {
  Cash = 'Cash',
  Online = 'Online',
  Cheque = 'Cheque',
}

export enum PaymentOf {
  Advance = 'Advance',
  Partial = 'Partial',
  Final = 'Final',
  VendorFee = 'Vendor Fee',
}

export enum OrderStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Partial = 'Partial Payment',
}

export enum TransactionType {
  Sale = 'Sale',
  Purchase = 'Purchase',
}

export interface Member {
  id: string;
  name: string;
}

export interface Payment {
  id: string;
  amount: number;
  mode: PaymentMode;
  memberId: string;
  paymentOf: string; // Allow custom payment types
  entryDate: string; // YYYY-MM-DD
}

export interface Order {
  id: string; // e.g., 'ORD-001'
  customerName: string;
  customerContact?: string;
  customerAddress?: string;
  productDescription: string;
  totalAmount: number;
  discount: number;
  finalAmount: number; // totalAmount - discount
  status: OrderStatus;
  notes?: string;
  image?: string; // Base64 string for local image storage
  payments: Payment[];
  orderDate: string; // YYYY-MM-DD
  entryDate: string; // YYYY-MM-DD
}

export interface VendorPayment {
  id: string;
  vendorName: string;
  description: string;
  amount: number;
  mode: PaymentMode;
  memberId: string;
  entryDate: string; // YYYY-MM-DD
  notes?: string;
  image?: string; // Base64 string for local image storage
}


// Flattened structure for table display
export interface LedgerEntry {
    entryDate: string;
    transactionId: string; // a unique id for this transaction row
    referenceId: string; // the orderId or vendor payment id
    partyName: string; // customer or vendor
    transactionType: TransactionType;
    description: string;
    amount: number;
    paymentMode: PaymentMode;
    memberName: string;
    orderDate?: string;
    paymentOf?: string;
    orderStatus?: OrderStatus;
    notes?: string;
    image?: string;
}
