'use client';

import { useState, useEffect } from "react";
import { loadSettings, updateSetting } from "@/services/settingsService";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToast } from "@/contexts/ToastContext";
import {
  Settings, Server, DollarSign, Pencil, X, Check,
} from 'lucide-react';

interface FieldDef {
  key: string;
  label: string;
  section: 'pricing' | 'operational';
  prefix?: string;
  suffix?: string;
  step: number;
}

const FIELDS: FieldDef[] = [
  { key: 'CAR_FEE', label: 'Mobil', section: 'pricing', prefix: 'Rp', step: 1000 },
  { key: 'PICKUP_FEE', label: 'Pickup', section: 'pricing', prefix: 'Rp', step: 1000 },
  { key: 'MINIBUS_FEE', label: 'Minibus', section: 'pricing', prefix: 'Rp', step: 1000 },
  { key: 'BUS_FEE', label: 'Bus', section: 'pricing', prefix: 'Rp', step: 1000 },
  { key: 'LIGHT_TRUCK_FEE', label: 'Light Truck', section: 'pricing', prefix: 'Rp', step: 5000 },
  { key: 'HEAVY_TRUCK_FEE', label: 'Heavy Truck', section: 'pricing', prefix: 'Rp', step: 10000 },
  { key: 'MINIMUM_BALANCE', label: 'Saldo Minimum', section: 'operational', prefix: 'Rp', step: 5000 },
  { key: 'LOW_BALANCE_THRESHOLD', label: 'Ambang Saldo Rendah', section: 'operational', prefix: 'Rp', step: 5000 },
  { key: 'TOLL_DISTANCE_KM', label: 'Jarak Tempuh', section: 'operational', suffix: 'km', step: 0.5 },
];

function formatValue(key: string, value: string): string {
  const field = FIELDS.find((f) => f.key === key);
  const num = Number(value);
  if (isNaN(num)) return value || '—';
  if (field?.prefix === 'Rp') return `Rp ${num.toLocaleString('id-ID')}`;
  if (field?.suffix === 'km') return `${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km`;
  return value;
}

export function SettingsView() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setEditValues(s);
      setLoaded(true);
    });
  }, []);

  const startEdit = () => {
    setEditValues({ ...settings });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditValues({ ...settings });
    setIsEditing(false);
  };

  const saveEdit = async () => {
    setSaving(true);
    const changedKeys = FIELDS.map((f) => f.key).filter((k) => editValues[k] !== settings[k]);
    if (changedKeys.length === 0) {
      setSaving(false);
      setIsEditing(false);
      toast('Tidak ada perubahan.', 'info');
      return;
    }
    const results = await Promise.all(changedKeys.map((k) => updateSetting(k, editValues[k])));
    if (results.every(Boolean)) {
      setSettings({ ...editValues });
      setIsEditing(false);
      toast('Pengaturan berhasil disimpan!', 'success');
    } else {
      toast('Gagal menyimpan beberapa pengaturan.', 'error');
    }
    setSaving(false);
  };

  const pricingFields = FIELDS.filter((f) => f.section === 'pricing');
  const operationalFields = FIELDS.filter((f) => f.section === 'operational');

  if (!loaded) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-sm text-muted-foreground">Konfigurasi parameter sistem</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-sm text-muted-foreground">Konfigurasi parameter sistem</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Batal
            </button>
            <button
              onClick={saveEdit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarif Tol */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-border/50">
            <Server className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Tarif Tol</h3>
          </div>
          <div className="p-5 space-y-4">
            {pricingFields.map(({ key, label, prefix, suffix, step }) => {
              const value = isEditing ? editValues[key] ?? '' : settings[key] ?? '';
              return (
                <div key={key}>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    {label} <span className="text-muted-foreground font-mono">({key})</span>
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      {prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{prefix}</span>
                      )}
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setEditValues((p) => ({ ...p, [key]: e.target.value }))}
                        step={step}
                        min="0"
                        className={`w-full bg-background border border-border rounded-lg py-2 text-sm text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${prefix ? 'pl-9' : 'pl-3'} pr-3`}
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-background/50 border border-transparent rounded-lg px-3 py-2 text-sm text-foreground font-mono">
                      {formatValue(key, value)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Operasional */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-border/50">
            <DollarSign className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Pengaturan Operasional</h3>
          </div>
          <div className="p-5 space-y-4">
            {operationalFields.map(({ key, label, prefix, suffix, step }) => {
              const value = isEditing ? editValues[key] ?? '' : settings[key] ?? '';
              return (
                <div key={key}>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    {label} <span className="text-muted-foreground font-mono">({key})</span>
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      {prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{prefix}</span>
                      )}
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setEditValues((p) => ({ ...p, [key]: e.target.value }))}
                        step={step}
                        min="0"
                        className={`w-full bg-background border border-border rounded-lg py-2 text-sm text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${prefix ? 'pl-9' : suffix ? 'pr-9' : 'px-3'}`}
                      />
                      {suffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{suffix}</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full bg-background/50 border border-transparent rounded-lg px-3 py-2 text-sm text-foreground font-mono">
                      {formatValue(key, value)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
