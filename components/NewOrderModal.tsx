
import React, { useState, useEffect, useCallback } from 'react';
import { Order, Payment, Member, PaymentMode, PaymentOf, OrderStatus, VendorPayment } from '../types';
import Modal from './ui/Modal';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Order) => void;
  onAddVendorPayment: (payment: VendorPayment) => void;
  members: Member[];
  nextOrderId: string;
  nextVendorPaymentId: string;
}

type TransactionFormType = 'sale' | 'purchase';

const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddOrder, 
  onAddVendorPayment,
  members, 
  nextOrderId,
  nextVendorPaymentId 
}) => {
  const [formType, setFormType] = useState<TransactionFormType>('sale');

  // Sale State
  const [customerName, setCustomerName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [orderPayments, setOrderPayments] = useState<Partial<Payment>[]>([{}]);
  
  // Purchase State
  const [vendorName, setVendorName] = useState('');
  const [purchaseDescription, setPurchaseDescription] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [purchaseMode, setPurchaseMode] = useState<PaymentMode | ''>('');
  const [purchaseMemberId, setPurchaseMemberId] = useState('');
  
  // Common State
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const finalAmount = totalAmount - discount;
  const totalPaid = orderPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const resetForms = useCallback(() => {
    // Sale
    setCustomerName('');
    setProductDescription('');
    setTotalAmount(0);
    setDiscount(0);
    setOrderPayments([{}]);
    // Purchase
    setVendorName('');
    setPurchaseDescription('');
    setPurchaseAmount(0);
    setPurchaseMode('');
    setPurchaseMemberId('');
    // Common
    setNotes('');
    setImage(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForms();
      setFormType('sale');
    }
  }, [isOpen, resetForms]);

  // Sale form handlers
  const handleOrderPaymentChange = <T,>(index: number, field: keyof Payment, value: T) => {
    const newPayments = [...orderPayments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setOrderPayments(newPayments);
  };

  const addOrderPaymentRow = () => setOrderPayments([...orderPayments, {}]);

  const removeOrderPaymentRow = (index: number) => {
    if (orderPayments.length > 1) {
      setOrderPayments(orderPayments.filter((_, i) => i !== index));
    }
  };
  
  // Common handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formType === 'sale') {
      handleSaleSubmit();
    } else {
      handlePurchaseSubmit();
    }
  };

  const handleSaleSubmit = () => {
     if (!customerName || !productDescription || finalAmount < 0) {
      alert('Please fill all required fields and ensure Final Amount is valid.');
      return;
    }

    const orderStatus = totalPaid >= finalAmount ? OrderStatus.Completed : totalPaid > 0 ? OrderStatus.Partial : OrderStatus.Pending;

    const newOrder: Order = {
      id: nextOrderId,
      customerName,
      productDescription,
      totalAmount,
      discount,
      finalAmount,
      status: orderStatus,
      notes,
      image: image || undefined,
      date: new Date().toISOString().split('T')[0],
      payments: orderPayments
        .filter(p => p.amount && p.amount > 0 && p.memberId && p.mode && p.paymentOf)
        .map((p, index) => ({
          ...p,
          id: `pay-${Date.now()}-${index}`,
          date: p.date || new Date().toISOString().split('T')[0],
        } as Payment)),
    };
    onAddOrder(newOrder);
  }

  const handlePurchaseSubmit = () => {
    if (!vendorName || !purchaseDescription || !purchaseAmount || !purchaseMode || !purchaseMemberId) {
      alert('Please fill all required fields for the vendor payment.');
      return;
    }
    const newVendorPayment: VendorPayment = {
      id: nextVendorPaymentId,
      vendorName,
      description: purchaseDescription,
      amount: purchaseAmount,
      mode: purchaseMode,
      memberId: purchaseMemberId,
      date: new Date().toISOString().split('T')[0],
      notes,
      image: image || undefined,
    }
    onAddVendorPayment(newVendorPayment);
  }
  
  const renderSaleForm = () => (
    <>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="form-input" required />
          <input type="text" placeholder="Product Description" value={productDescription} onChange={e => setProductDescription(e.target.value)} className="form-input" required />
          <input type="number" placeholder="Total Amount" value={totalAmount || ''} onChange={e => setTotalAmount(parseFloat(e.target.value) || 0)} className="form-input" />
          <input type="number" placeholder="Discount" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="form-input" />
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-md text-center">
          <span className="font-semibold text-blue-800 dark:text-blue-200">Final Amount: ₹{finalAmount.toLocaleString()}</span>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payments</h3>
          <button type="button" onClick={addOrderPaymentRow} className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">+ Add Payment</button>
        </div>
        {orderPayments.map((payment, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <input type="number" placeholder="Amount" value={payment.amount || ''} onChange={e => handleOrderPaymentChange(index, 'amount', parseFloat(e.target.value))} className="col-span-3 form-input" required/>
            <select value={payment.mode || ''} onChange={e => handleOrderPaymentChange(index, 'mode', e.target.value as PaymentMode)} className="col-span-2 form-select" required>
              <option value="">Mode</option>
              {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={payment.memberId || ''} onChange={e => handleOrderPaymentChange(index, 'memberId', e.target.value)} className="col-span-3 form-select" required>
              <option value="">Member</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div className="col-span-3">
              <input type="text" list="payment-types" placeholder="Type" value={payment.paymentOf || ''} onChange={e => handleOrderPaymentChange(index, 'paymentOf', e.target.value)} className="form-input" required />
              <datalist id="payment-types">
                {Object.values(PaymentOf).map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div className="col-span-1 flex justify-end">
              {orderPayments.length > 1 && <button type="button" onClick={() => removeOrderPaymentRow(index)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>}
            </div>
          </div>
        ))}
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/50 rounded-md text-center">
          <span className="font-semibold text-green-800 dark:text-green-200">Total Paid: ₹{totalPaid.toLocaleString()}</span>
        </div>
      </div>
    </>
  );

  const renderPurchaseForm = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Vendor Payment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Vendor Name" value={vendorName} onChange={e => setVendorName(e.target.value)} className="form-input" required />
        <input type="text" placeholder="Payment Description" value={purchaseDescription} onChange={e => setPurchaseDescription(e.target.value)} className="form-input" required />
        <input type="number" placeholder="Amount" value={purchaseAmount || ''} onChange={e => setPurchaseAmount(parseFloat(e.target.value) || 0)} className="form-input" required />
        <select value={purchaseMode || ''} onChange={e => setPurchaseMode(e.target.value as PaymentMode)} className="form-select" required>
            <option value="">Payment Mode</option>
            {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="md:col-span-2">
            <select value={purchaseMemberId || ''} onChange={e => setPurchaseMemberId(e.target.value)} className="form-select" required>
                <option value="">Paid By (Member)</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
        </div>
      </div>
    </div>
  );

  const TypeButton: React.FC<{ type: TransactionFormType; label: string }> = ({ type, label }) => (
    <button
        type="button"
        onClick={() => setFormType(type)}
        className={`w-full py-2 text-sm font-semibold rounded-md transition-all ${
            formType === type
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        }`}
    >{label}</button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`New Transaction (${formType === 'sale' ? nextOrderId : nextVendorPaymentId})`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <style>{`.form-input, .form-select { @apply mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200; }`}</style>
        
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <TypeButton type="sale" label="Sale / Income" />
            <TypeButton type="purchase" label="Purchase / Expense" />
        </div>

        {formType === 'sale' ? renderSaleForm() : renderPurchaseForm()}
        
        <div>
           <textarea placeholder="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} className="form-input" rows={2}></textarea>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attach Image (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"/>
            {image && (
              <div className="mt-4 relative inline-block">
                <img src={image} alt="Preview" className="h-40 rounded-lg shadow-md" />
                <button type="button" onClick={() => { setImage(null); const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement; if(fileInput) fileInput.value = ""; }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold hover:bg-red-700" aria-label="Remove image">
                  &times;
                </button>
              </div>
            )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Save Transaction</button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTransactionModal;
