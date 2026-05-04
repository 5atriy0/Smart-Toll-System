'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Search, Filter, Wallet, Ban, CheckCircle } from 'lucide-react';

export function UserManagement() {
  const { users, searchQuery, setSearchQuery, statusFilter, setStatusFilter, addBalance, addUser, updateUserStatus } = useUsers();
  
  const [topUpModal, setTopUpModal] = useState<{ isOpen: boolean; rfid: string; amount: number }>({ isOpen: false, rfid: '', amount: 50000 });
  
  const [addUserModal, setAddUserModal] = useState<{ isOpen: boolean }>({ isOpen: false });
  const [newUser, setNewUser] = useState({ name: '', rfid: '', plateNumber: '', role: 'User' });

  const handleTopUp = () => {
    addBalance(topUpModal.rfid, topUpModal.amount);
    setTopUpModal({ isOpen: false, rfid: '', amount: 50000 });
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.rfid) {
      addUser(newUser);
      setAddUserModal({ isOpen: false });
      setNewUser({ name: '', rfid: '', plateNumber: '', role: 'User' });
    }
  };

  return (
    <>
      <Card className="col-span-1 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium text-foreground">Manajemen Pengguna & RFID</CardTitle>
          <button 
            onClick={() => setAddUserModal({ isOpen: true })}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Tag</span>
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, RFID, atau Plat Nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-card/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
              >
                <option value="All">Semua Status</option>
                <option value="Active">Aktif</option>
                <option value="Suspended">Diblokir</option>
              </select>
            </div>
          </div>
          
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Nama Pengguna</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Plat Nomor</th>
                  <th className="px-4 py-3">ID Tag RFID</th>
                  <th className="px-4 py-3">Saldo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${user.role === 'Admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.plateNumber || '-'}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{user.rfid}</td>
                    <td className="px-4 py-3 text-foreground font-semibold">{user.balance}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {user.status === 'Active' ? 'Aktif' : 'Diblokir'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => setTopUpModal({ isOpen: true, rfid: user.rfid, amount: 50000 })}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex items-center gap-1"
                          title="Isi Saldo"
                        >
                          <Wallet className="w-4 h-4" />
                        </button>
                        {user.status === 'Active' ? (
                          <button 
                            onClick={() => updateUserStatus(user.rfid, 'Suspended')}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-colors inline-flex items-center gap-1"
                            title="Blokir Kartu"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateUserStatus(user.rfid, 'Active')}
                            className="p-1.5 text-success hover:bg-success/10 rounded-md transition-colors inline-flex items-center gap-1"
                            title="Aktifkan Kartu"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Tidak ada pengguna ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Up Modal Overlay */}
      {topUpModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border shadow-2xl p-6 rounded-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-4">Isi Saldo</h3>
            <p className="text-sm text-muted-foreground mb-4">RFID: <span className="font-mono">{topUpModal.rfid}</span></p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Jumlah (Rp)</label>
              <input 
                type="number" 
                value={topUpModal.amount}
                onChange={(e) => setTopUpModal(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full bg-background/50 border border-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                min="0"
                step="10000"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setTopUpModal({ isOpen: false, rfid: '', amount: 0 })}
                className="px-4 py-2 rounded-md border border-border text-sm hover:bg-muted/50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleTopUp}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal Overlay */}
      {addUserModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border shadow-2xl p-6 rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-4">Daftarkan Tag RFID Baru</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="misal. Budi Santoso"
                  className="w-full bg-background/50 border border-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">UID RFID</label>
                <input 
                  type="text" 
                  value={newUser.rfid}
                  onChange={(e) => setNewUser(prev => ({ ...prev, rfid: e.target.value }))}
                  placeholder="misal. AA-BB-CC-DD"
                  className="w-full bg-background/50 border border-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Plat Nomor</label>
                <input 
                  type="text" 
                  value={newUser.plateNumber}
                  onChange={(e) => setNewUser(prev => ({ ...prev, plateNumber: e.target.value }))}
                  placeholder="misal. B 1234 XYZ"
                  className="w-full bg-background/50 border border-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Peran</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-background/50 border border-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setAddUserModal({ isOpen: false })}
                className="px-4 py-2 rounded-md border border-border text-sm hover:bg-muted/50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.rfid}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Daftarkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
