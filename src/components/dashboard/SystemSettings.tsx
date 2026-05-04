'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save, Server, Shield, Wrench, Key, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Pengaturan berhasil disimpan!');
    }, 1000);
  };

  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-medium text-foreground">Konfigurasi Sistem</CardTitle>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </CardHeader>
      
      <CardContent className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* API Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Server className="w-4 h-4" />
            Konektivitas & API Perangkat
          </h3>
          <div className="space-y-4 bg-background/50 p-4 rounded-xl border border-border/50">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">URL Endpoint API</label>
              <input type="text" defaultValue="https://api.smart-toll.local/v1/gate" className="w-full bg-card/50 border border-border rounded-md px-3 py-2 text-sm focus:border-primary/50 outline-none transition-colors" />
            </div>
            
            <div>
              <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1">
                <Key className="w-3 h-3" /> Secret Key
              </label>
              <div className="relative">
                <input type="password" defaultValue="secret_key_12345" className="w-full bg-card/50 border border-border rounded-md px-3 py-2 text-sm focus:border-primary/50 outline-none transition-colors font-mono" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Timeout Sensor (ms)
              </label>
              <input type="number" defaultValue="5000" min="1000" step="500" className="w-full bg-card/50 border border-border rounded-md px-3 py-2 text-sm focus:border-primary/50 outline-none transition-colors" />
            </div>
          </div>
        </div>

        {/* Security & Pricing */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Harga & Mode Operasional
          </h3>
          <div className="space-y-4 bg-background/50 p-4 rounded-xl border border-border/50">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Tarif Tol (Potongan Saldo)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-muted-foreground">Rp</span>
                <input type="number" defaultValue="15000" step="1000" className="w-full bg-card/50 border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:border-primary/50 outline-none transition-colors font-mono" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50 mt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-warning" />
                    Mode Pemeliharaan
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Menolak semua pemindaian RFID dan mengaktifkan indikator LED merah/Buzzer.
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${maintenanceMode ? 'bg-warning' : 'bg-muted'}`}
                  role="switch"
                  aria-checked={maintenanceMode}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              {maintenanceMode && (
                <div className="mt-3 bg-warning/10 border border-warning/20 rounded-md p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-warning leading-relaxed">
                    <strong>Peringatan:</strong> Sistem saat ini dalam masa pemeliharaan. Gerbang tidak akan beroperasi secara normal sampai mode ini dinonaktifkan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
