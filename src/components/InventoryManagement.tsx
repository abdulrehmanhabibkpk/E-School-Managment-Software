import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Plus, Trash, Edit, Printer, 
  ArrowRight, Download, Filter, AlertTriangle, 
  ChevronRight, Box, History, ShoppingCart, 
  TrendingUp, TrendingDown, Layers, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';
import { generateUniqueId } from '../lib/idUtils';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  location: string;
  lastUpdated: string;
  history: {
    id: string;
    date: string;
    type: 'in' | 'out';
    quantity: number;
    notes: string;
  }[];
}

export default function InventoryManagement({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Stationery',
    quantity: 0,
    minQuantity: 5,
    unit: 'pcs',
    price: 0,
    location: 'Main Store'
  });

  useEffect(() => {
    const saved = localStorage.getItem('inventory_items');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const saveItems = (newItems: InventoryItem[]) => {
    setItems(newItems);
    updateCentralKey('inventory_items', newItems);
  };

  const categories = ['Stationery', 'Furniture', 'Electronics', 'Sports', 'Cleaning', 'Books', 'Uniforms'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated = items.map(item => item.id === editingItem.id ? {
        ...item,
        ...formData,
        lastUpdated: new Date().toISOString()
      } : item);
      saveItems(updated);
    } else {
      const newItem: InventoryItem = {
        id: generateUniqueId(),
        ...formData,
        lastUpdated: new Date().toISOString(),
        history: [{
          id: generateUniqueId(),
          date: new Date().toISOString(),
          type: 'in',
          quantity: formData.quantity,
          notes: 'Initial Stock'
        }]
      };
      saveItems([newItem, ...items]);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      saveItems(items.filter(i => i.id !== id));
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = items.filter(i => i.quantity <= i.minQuantity).length;

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Inventory & Stock <Package className="w-5 h-5 text-blue-600" />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button 
              onClick={() => { setEditingItem(null); setFormData({ name: '', category: 'Stationery', quantity: 0, minQuantity: 5, unit: 'pcs', price: 0, location: 'Main Store' }); setShowModal(true); }}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span className="hover:text-blue-600 cursor-pointer" onClick={onBack}>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">Inventory</span>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Box className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{items.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Categories</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{items.reduce((acc, i) => acc + i.quantity, 0)}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Stock Units</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className={`w-10 h-10 ${lowStockCount > 0 ? 'bg-rose-50' : 'bg-slate-50'} rounded-xl flex items-center justify-center mb-4`}>
              <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            </div>
            <div className="text-2xl font-black text-slate-900">{lowStockCount}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Low Stock Alerts</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">Rs. {items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Assets Value</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{item.name}</span>
                        <span className="text-[10px] text-slate-400">ID: {item.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${item.quantity <= item.minQuantity ? 'text-rose-600' : 'text-slate-700'}`}>
                          {item.quantity} {item.unit}
                        </span>
                        {item.quantity <= item.minQuantity && (
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">{item.location}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">Rs. {item.price}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-800">
                    {editingItem ? 'Edit Item' : 'Add New Inventory Item'}
                  </h2>
                  <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Download className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="e.g. Printer Paper A4"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                      <input 
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                        placeholder="pcs, reams, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial Quantity</label>
                      <input 
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Min. Stock Alert</label>
                      <input 
                        type="number"
                        value={formData.minQuantity}
                        onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Price per Unit</label>
                      <input 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Storage Location</label>
                      <input 
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                        placeholder="e.g. Main Store"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
