import React, { useState, useEffect } from 'react';
import { MasterOptionItem, DEFAULT_GUTTER_TYPES, DEFAULT_DAMAGE_TYPES } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  AlertTriangle, 
  RotateCcw, 
  Pencil, 
  Save, 
  Wrench,
  Sparkles
} from 'lucide-react';

interface ManageTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeTarget: 'gutter' | 'damage';
  currentItems: MasterOptionItem[];
  onSave: (updatedList: MasterOptionItem[], newlyAddedId?: string) => void;
}

export const ManageTypesModal: React.FC<ManageTypesModalProps> = ({
  isOpen,
  onClose,
  typeTarget,
  currentItems,
  onSave,
}) => {
  const isGutter = typeTarget === 'gutter';
  const defaultPresets = isGutter ? DEFAULT_GUTTER_TYPES : DEFAULT_DAMAGE_TYPES;

  const [items, setItems] = useState<MasterOptionItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lastAddedId, setLastAddedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (currentItems && currentItems.length > 0) {
        setItems(JSON.parse(JSON.stringify(currentItems)));
      } else {
        setItems(JSON.parse(JSON.stringify(defaultPresets)));
      }
      setNewItemName('');
      setErrorMsg('');
      setSuccessMsg('');
      setLastAddedId(undefined);
    }
  }, [isOpen, currentItems, defaultPresets]);

  if (!isOpen) return null;

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) {
      setErrorMsg('Nama jenis tidak boleh kosong');
      return;
    }

    // Check duplicate
    if (items.some((i) => i.label.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(`Jenis "${trimmed}" sudah ada di daftar`);
      return;
    }

    const newId = `custom_${Date.now()}`;
    const newItem: MasterOptionItem = {
      id: newId,
      label: trimmed,
      isCustom: true,
    };

    const updated = [...items, newItem];
    setItems(updated);
    setNewItemName('');
    setErrorMsg('');
    setLastAddedId(newId);
    setSuccessMsg(`Jenis "${trimmed}" berhasil ditambahkan ke daftar!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMsg('Minimal harus ada 1 jenis dalam daftar');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset daftar kembali ke jenis bawaan default?')) {
      setItems(JSON.parse(JSON.stringify(defaultPresets)));
      setSuccessMsg('Daftar direset ke bawaan default.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const handleSaveAndApply = () => {
    // Validate no empty labels
    const hasEmpty = items.some((i) => !i.label.trim());
    if (hasEmpty) {
      setErrorMsg('Semua nama jenis harus memiliki teks');
      return;
    }

    onSave(items, lastAddedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
              {isGutter ? <Layers className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {isGutter ? 'Kelola & Tambah Material Talang' : 'Kelola & Tambah Bentuk Kerusakan'}
              </h3>
              <p className="text-[11px] text-blue-200">
                Edit label atau tambah jenis baru yang disinkronkan real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Tambah Jenis Baru */}
          <form onSubmit={handleAddItem} className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/90 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Tambah Jenis {isGutter ? 'Material Talang' : 'Kerusakan'} Baru:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={
                  isGutter 
                    ? 'Contoh: Tembaga / Copper, Zincalume 0.4mm, Komposit...' 
                    : 'Contoh: Sambungan Flashing Rusak, Karat Asam...'
                }
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </form>

          {/* Daftar Jenis yang Ada (Bisa Diedit Langsung) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Daftar Jenis ({items.length} Jenis Tersedia)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Ubah teks langsung pada kolom di bawah
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-400 w-5 text-center font-mono">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleLabelChange(item.id, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {item.isCustom ? (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                      Kustom
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      Bawaan
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Hapus jenis ini"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset ke Bawaan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
