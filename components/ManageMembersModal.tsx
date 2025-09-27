
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import Modal from './ui/Modal';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ isOpen, onClose, members, setMembers }) => {
  const [editableMembers, setEditableMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditableMembers(JSON.parse(JSON.stringify(members)));
      setNewMemberName('');
    }
  }, [isOpen, members]);

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

  const handleSaveChanges = () => {
    setMembers(editableMembers);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members">
        <style>{`.form-input { @apply mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200; }`}</style>
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Existing Members</h4>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2">
            {editableMembers.map(member => (
              <div key={member.id} className="flex items-center">
                <input
                  type="text"
                  value={member.name}
                  onChange={e => handleNameChange(member.id, e.target.value)}
                  className="form-input"
                />
              </div>
            ))}
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
  );
};

export default ManageMembersModal;
