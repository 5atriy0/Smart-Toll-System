'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Wallet, CreditCard, Plus, History, Loader2, AlertTriangle, CheckCircle, Car } from 'lucide-react';

export default function UserPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  
  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Topup State
  const [showTopup, setShowTopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMessage, setTopupMessage] = useState({ type: '', text: '' });

  // Add Card State
  const [showAddCard, setShowAddCard] = useState(false);
  const [newUid, setNewUid] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [addCardMessage, setAddCardMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    
    // For development: if no profile, mock some data
    if (!profile) {
      setCards([
        { id: '1', uid: '1A2B3C4D', balance: 150000, status: 'ACTIVE', vehicle: { plate_number: 'B 1234 ABC', vehicle_type: 'CAR' } },
        { id: '2', uid: '9F8E7D6C', balance: 50000, status: 'ACTIVE', vehicle: { plate_number: 'D 5678 EFG', vehicle_type: 'CAR' } }
      ]);
      setTransactions([
        { id: 't1', gate_in_name: 'Gerbang Tol Ancol', gate_out_name: 'Gerbang Tol Pluit', fee: 15000, status: 'COMPLETED', created_at: new Date().toISOString(), plate_number: 'B 1234 ABC' },
        { id: 't2', gate_in_name: 'Gerbang Tol Pluit', gate_out_name: 'Gerbang Tol Bandara', fee: 20000, status: 'COMPLETED', created_at: new Date(Date.now() - 86400000).toISOString(), plate_number: 'B 1234 ABC' }
      ]);
      setLoading(false);
      return;
    }

    // Fetch Cards & Vehicles
    const { data: cardsData } = await supabase
      .from('cards')
      .select('*, vehicle:vehicles(plate_number, vehicle_type)')
      .eq('profile_id', profile.id);
    
    if (cardsData) setCards(cardsData);

    // Fetch Transactions
    const { data: txData } = await supabase
      .from('vw_transaction_details')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (txData) setTransactions(txData);
    
    setLoading(false);
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !topupAmount) return;
    
    setTopupLoading(true);
    setTopupMessage({ type: '', text: '' });
    
    const amount = parseInt(topupAmount.replace(/[^0-9]/g, ''));
    
    const { error } = await supabase.rpc('top_up', {
      p_card_uid: selectedCard,
      p_amount: amount,
      p_method: 'Transfer Bank',
      p_created_by: profile?.id || ''
    });

    setTopupLoading(false);

    if (error) {
      setTopupMessage({ type: 'error', text: error.message });
    } else {
      setTopupMessage({ type: 'success', text: `Berhasil top up Rp ${amount.toLocaleString('id-ID')}` });
      setTopupAmount('');
      setSelectedCard('');
      setTimeout(() => { setShowTopup(false); fetchData(); }, 2000);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUid || !plateNumber) return;
    
    setAddCardLoading(true);
    setAddCardMessage({ type: '', text: '' });
    
    try {
      // 1. Create Vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          profile_id: profile?.id,
          plate_number: plateNumber,
          vehicle_type: vehicleType
        })
        .select()
        .single();
        
      if (vehicleError) throw vehicleError;
      
      // 2. Create Card
      const { error: cardError } = await supabase
        .from('cards')
        .insert({
          profile_id: profile?.id,
          vehicle_id: vehicleData.id,
          uid: newUid,
          balance: 0,
          status: 'ACTIVE'
        });
        
      if (cardError) throw cardError;
      
      setAddCardMessage({ type: 'success', text: 'Kartu berhasil ditambahkan!' });
      setNewUid('');
      setPlateNumber('');
      setTimeout(() => { setShowAddCard(false); fetchData(); }, 2000);
      
    } catch (err: any) {
      setAddCardMessage({ type: 'error', text: err.message || 'Terjadi kesalahan' });
    } finally {
      setAddCardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalBalance = cards.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm text-primary font-medium mb-1">Total Saldo</p>
            <h2 className="text-3xl font-bold text-foreground">Rp {totalBalance.toLocaleString('id-ID')}</h2>
            <p className="text-xs text-muted-foreground mt-2">Dari {cards.length} kartu aktif</p>
          </div>
          <Wallet className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-primary opacity-5" />
        </Card>
        
        <Card className="p-6 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground mb-1">Total Transaksi</p>
          <h2 className="text-3xl font-bold text-foreground">{transactions.length}</h2>
          <p className="text-xs text-muted-foreground mt-2">Riwayat terakhir</p>
        </Card>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { setShowTopup(true); setShowAddCard(false); }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all font-medium"
          >
            <Wallet className="w-5 h-5" />
            Top Up Saldo
          </button>
          <button 
            onClick={() => { setShowAddCard(true); setShowTopup(false); }}
            className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Kartu
          </button>
        </div>
      </div>

      {/* Forms Section */}
      {showTopup && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> Top Up Saldo
          </h3>
          <form onSubmit={handleTopup} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1.5">Pilih Kartu</label>
              <select 
                className="w-full h-11 px-3 rounded-lg border border-input bg-background"
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                required
              >
                <option value="">Pilih kartu...</option>
                {cards.map(c => (
                  <option key={c.uid} value={c.uid}>
                    {c.uid} - {c.vehicle?.plate_number} (Rp {c.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nominal Top Up</label>
              <input 
                type="text" 
                placeholder="Rp 50.000"
                className="w-full h-11 px-3 rounded-lg border border-input bg-background"
                value={topupAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setTopupAmount(val ? `Rp ${parseInt(val).toLocaleString('id-ID')}` : '');
                }}
                required
              />
            </div>
            {topupMessage.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${topupMessage.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                {topupMessage.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {topupMessage.text}
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowTopup(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors">Batal</button>
              <button type="submit" disabled={topupLoading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg transition-colors flex items-center gap-2">
                {topupLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Konfirmasi Top Up
              </button>
            </div>
          </form>
        </Card>
      )}

      {showAddCard && (
        <Card className="p-6 border-secondary bg-secondary/5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-secondary-foreground" /> Tambah Kartu Baru
          </h3>
          <form onSubmit={handleAddCard} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1.5">UID Kartu</label>
              <input 
                type="text" 
                placeholder="Contoh: 1A2B3C4D"
                className="w-full h-11 px-3 rounded-lg border border-input bg-background uppercase"
                value={newUid}
                onChange={(e) => setNewUid(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Plat Nomor</label>
                <input 
                  type="text" 
                  placeholder="B 1234 ABC"
                  className="w-full h-11 px-3 rounded-lg border border-input bg-background uppercase"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tipe Kendaraan</label>
                <select 
                  className="w-full h-11 px-3 rounded-lg border border-input bg-background"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="CAR">Mobil (Gol I)</option>
                  <option value="PICKUP">Pickup (Gol I)</option>
                  <option value="BUS">Bus (Gol I)</option>
                  <option value="LIGHT_TRUCK">Truk Ringan (Gol II)</option>
                  <option value="HEAVY_TRUCK">Truk Berat (Gol III+)</option>
                </select>
              </div>
            </div>
            {addCardMessage.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${addCardMessage.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                {addCardMessage.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {addCardMessage.text}
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setShowAddCard(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors">Batal</button>
              <button type="submit" disabled={addCardLoading} className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg transition-colors flex items-center gap-2">
                {addCardLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Kartu
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kartu Saya */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Kartu Saya
            </h3>
          </div>
          
          <div className="space-y-4">
            {cards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Belum ada kartu</p>
              </div>
            ) : (
              cards.map(card => (
                <div key={card.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{card.vehicle?.plate_number}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{card.uid}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rp {card.balance.toLocaleString('id-ID')}</p>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-600">
                      {card.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Riwayat Penggunaan */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Riwayat Transaksi
            </h3>
          </div>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl">
                <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Belum ada transaksi</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="p-4 rounded-xl border border-border bg-card text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{tx.gate_in_name} <span className="text-muted-foreground font-normal mx-1">→</span> {tx.gate_out_name || '...'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(tx.created_at).toLocaleString('id-ID')}</p>
                    </div>
                    <p className="font-bold text-destructive">-Rp {tx.fee?.toLocaleString('id-ID') || 0}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <span>{tx.plate_number}</span>
                    <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/10 text-secondary-foreground">{tx.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}
