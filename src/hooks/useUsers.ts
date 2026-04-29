import { useState, useMemo } from 'react';
import { MOCK_USERS } from '@/lib/constants';

export function useUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.rfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (user.plateNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const addBalance = (rfid: string, amount: number) => {
    setUsers(prev => prev.map(user => {
      if (user.rfid === rfid) {
        // Simple string manipulation for mock data (assuming format "Rp X.XXX")
        const currentAmount = parseInt(user.balance.replace(/[^0-9]/g, ''), 10) || 0;
        const newAmount = currentAmount + amount;
        return { ...user, balance: `Rp ${newAmount.toLocaleString('id-ID')}` };
      }
      return user;
    }));
  };

  const addUser = (newUser: { name: string, rfid: string, plateNumber: string, role: string }) => {
    setUsers(prev => [...prev, { ...newUser, balance: 'Rp 0', status: 'Active' }]);
  };

  const updateUserStatus = (rfid: string, newStatus: string) => {
    setUsers(prev => prev.map(user => 
      user.rfid === rfid ? { ...user, status: newStatus } : user
    ));
  };

  return {
    users: filteredUsers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    addBalance,
    addUser,
    updateUserStatus
  };
}
