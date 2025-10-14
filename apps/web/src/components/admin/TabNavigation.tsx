interface TabNavigationProps {
  activeTab: string;
  tabs: Array<{
    id: string;
    label: string;
  }>;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ activeTab, tabs, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}