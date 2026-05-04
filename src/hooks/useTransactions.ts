import { useState, useMemo } from 'react';
import { MOCK_TRANSACTIONS } from '@/lib/constants';

export function useTransactions() {
  const [logs, setLogs] = useState(MOCK_TRANSACTIONS);
  const [dateRange, setDateRange] = useState('Today'); // e.g. 'Today', 'Last 7 Days', 'All Time'
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.rfid.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (dateRange === 'All Time') return matchesSearch;
      
      // For mock data, we just assume they all match the date if not All Time, 
      // but in real app we'd filter by timestamp here too
      return matchesSearch;
    });
  }, [logs, dateRange, searchQuery]);

  const exportData = (format: 'csv' | 'pdf') => {
    console.log(`Exporting ${filteredLogs.length} records as ${format.toUpperCase()}...`);
    alert(`Exported ${filteredLogs.length} transactions as ${format.toUpperCase()}`);
  };

  return {
    logs: filteredLogs,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    exportData
  };
}
