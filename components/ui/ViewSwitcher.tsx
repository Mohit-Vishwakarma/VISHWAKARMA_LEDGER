import React from 'react';

const TableIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
  </svg>
);

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);


interface ViewSwitcherProps {
  currentView: 'table' | 'card';
  onViewChange: (view: 'table' | 'card') => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const options = [
    { value: 'table', icon: <TableIcon />, label: 'Table View' },
    { value: 'card', icon: <CardIcon />, label: 'Card View' },
  ];

  return (
    <div className="flex items-center bg-gray-200 dark:bg-gray-900/50 p-1 rounded-lg">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onViewChange(option.value as 'table' | 'card')}
          className={`p-2 rounded-md transition-all duration-200 ease-in-out flex items-center justify-center ${
            currentView === option.value
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-800/50'
          }`}
          aria-label={`Switch to ${option.label}`}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
