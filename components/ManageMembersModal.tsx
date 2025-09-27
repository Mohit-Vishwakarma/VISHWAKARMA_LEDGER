
import React, { useState, useEffect, useMemo } from 'react';
import { Member, Order, VendorPayment } from '../types';
import Modal from './ui/Modal';
import ConfirmationModal from './ui/ConfirmationModal';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  orders: Order[];
  vendorPayments: VendorPayment[];
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ isOpen, onClose, members, setMembers, orders, vendorPayments }) => {
  const [editableMembers, setEditableMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const memberUsage = useMemo(() => {
    if (!isOpen) return new Set();
    const usage = new Set<string>();
    orders.forEach(order => order.payments.forEach(p => usage.add(p.memberId)));
    vendorPayments.forEach(vp => usage.add(vp.memberId));
    return usage;
  }, [isOpen, orders, vendorPayments]);

  useEffect(() => {
    if (isOpen) {
      setEditableMembers(JSON.parse(JSON.stringify(members)));
      setNewMemberName('');
    }
  }, [isOpen, members]);

  const isMemberInUse = (memberId: string) => memberUsage.has(memberId);

  const handleNameChange = (id: string, newName: string) => {
    setEditableMembers(prev => prev.map(m => (m.id === id ? { ...m, name: newName } : m)));
  };

  const handleAddNewMember = () => {
    if (newMemberName.trim() === '') return;
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
    };
    setEditableMembers(prev => [...prev, newMember]);
    setNewMemberName('');
  };
  
  const handleDeleteRequest = (member: Member) => {
    setMemberToDelete(member);
  };
  
  const confirmDeleteMember = () => {
    if (memberToDelete) {
        setEditableMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
        setMemberToDelete(null);
    }
  };

  const handleSaveChanges = () => {
    setMembers(editableMembers);
    onClose();
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members">
        <style>{`.form-input { @apply mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200; }`}</style>
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Existing Members</h4>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2">
            {editableMembers.map(member => {
              const inUse = isMemberInUse(member.id);
              return (
              <div key={member.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={e => handleNameChange(member.id, e.target.value)}
                  className="form-input flex-grow"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(member)}
                  disabled={inUse}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-500 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:hover:bg-gray-700 disabled:dark:text-gray-600"
                  title={inUse ? "Cannot delete member with existing transactions." : "Delete member"}
                  aria-label={inUse ? "Cannot delete member with existing transactions." : "Delete member"}
                >
                  <TrashIcon />
                </button>
              </div>
            )})}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Add New Member</h4>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              placeholder="New member's name"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              onClick={handleAddNewMember}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
        <button type="button" onClick={handleSaveChanges} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700">Save Changes</button>
      </div>
    </Modal>
    <ConfirmationModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={confirmDeleteMember}
        title="Confirm Member Deletion"
        message={
            <p>
                Are you sure you want to delete the member <span className="font-semibold">{memberToDelete?.name}</span>? This action cannot be undone.
            </p>
        }
    />
    </>
  );
};

export default ManageMembersModal;
