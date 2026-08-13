import React, { useState, useEffect } from 'react';
import { 
  Bus, MapPin, Users, Fuel, Settings, Plus, 
  Search, Trash, Edit, AlertTriangle, ChevronRight,
  TrendingUp, Calendar, Clock, Navigation, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';
import { generateUniqueId } from '../lib/idUtils';

interface Route {
  id: string;
  name: string;
  stops: string[];
  driverName: string;
  vehicleNumber: string;
  capacity: number;
  enrolledStudents: number;
  status: 'active' | 'maintenance' | 'inactive';
}

interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  amount: number;
  odometer: number;
}

export default function TransportManagement({ onBack }: { onBack: () => void }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  useEffect(() => {
    const savedRoutes = localStorage.getItem('transport_routes');
    const savedFuel = localStorage.getItem('transport_fuel');
    if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
    if (savedFuel) setFuelLogs(JSON.parse(savedFuel));
  }, []);

  const saveRoutes = (newRoutes: Route[]) => {
    setRoutes(newRoutes);
    updateCentralKey('transport_routes', newRoutes);
  };

  const [formData, setFormData] = useState({
    name: '',
    stops: '',
    driverName: '',
    vehicleNumber: '',
    capacity: 30,
    status: 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stopsArray = formData.stops.split(',').map(s => s.trim());
    if (editingRoute) {
      const updated = routes.map(r => r.id === editingRoute.id ? {
        ...r,
        ...formData,
        stops: stopsArray
      } : r);
      saveRoutes(updated);
    } else {
      const newRoute: Route = {
        id: generateUniqueId(),
        ...formData,
        stops: stopsArray,
        enrolledStudents: 0
      };
      saveRoutes([newRoute, ...routes]);
    }
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Transport Management <Bus className="w-5 h-5 text-amber-600" />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setEditingRoute(null); setFormData({ name: '', stops: '', driverName: '', vehicleNumber: '', capacity: 30, status: 'active' }); setShowModal(true); }}
              className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Route
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span className="hover:text-amber-600 cursor-pointer" onClick={onBack}>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">Transport</span>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{routes.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Routes</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{routes.reduce((acc, r) => acc + r.enrolledStudents, 0)}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Students Enrolled</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <Fuel className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">Rs. {fuelLogs.reduce((acc, l) => acc + l.amount, 0).toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Fuel Cost (MTD)</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{routes.filter(r => r.status === 'maintenance').length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Under Maintenance</div>
          </div>
        </div>

        {/* Route Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map(route => (
            <div key={route.id} className="bg-white border border-slate-200 rounded-[32px] overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col">
              <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    route.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                    route.status === 'maintenance' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {route.status}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingRoute(route); setFormData({...route, stops: route.stops.join(', ')}); setShowModal(true); }} className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => saveRoutes(routes.filter(r => r.id !== route.id))} className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg"><Trash className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">{route.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Bus className="w-3 h-3" />
                  <span>Vehicle: {route.vehicleNumber}</span>
                </div>
              </div>
              
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">{route.enrolledStudents}/{route.capacity}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Capacity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">{route.driverName}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Driver</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Route Stops</div>
                  <div className="flex flex-wrap gap-2">
                    {route.stops.map((stop, i) => (
                      <div key={i} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {stop}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  <Clock className="w-3 h-3" /> View Timings
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl relative z-10 p-8">
              <h2 className="text-xl font-black text-slate-800 mb-8">{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Route Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" placeholder="e.g. North Area Bus 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Driver Name</label>
                    <input required type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Vehicle No</label>
                    <input required type="text" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Route Stops (Comma separated)</label>
                  <textarea required value={formData.stops} onChange={e => setFormData({...formData, stops: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 min-h-[100px]" placeholder="Stop A, Stop B, Stop C..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Max Capacity</label>
                    <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-2 py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-600/20">{editingRoute ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
