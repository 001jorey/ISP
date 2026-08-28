import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Zap, Clock, Download, DollarSign, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatCurrency, formatDuration } from '../utils/formatters';
import toast from 'react-hot-toast';
import type { Plan } from '../types';

export const PlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    dataLimit: '',
    speedLimit: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price.toString(),
        duration: plan.duration.toString(),
        dataLimit: plan.dataLimit,
        speedLimit: plan.speedLimit
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '1',
        dataLimit: 'Unlimited',
        speedLimit: '25 Mbps'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingPlan) {
        await adminAPI.updatePlan(editingPlan.id, {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          duration: Number(formData.duration),
          dataLimit: formData.dataLimit,
          speedLimit: formData.speedLimit
        });
        toast.success('Plan updated successfully');
      } else {
        await adminAPI.createPlan({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          duration: Number(formData.duration),
          dataLimit: formData.dataLimit,
          speedLimit: formData.speedLimit
        });
        toast.success('New plan created successfully');
      }
      setShowModal(false);
      fetchPlans();
    } catch {
      toast.error('Failed to save plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this internet plan?')) {
      try {
        await adminAPI.deletePlan(id);
        toast.success('Plan deactivated');
        fetchPlans();
      } catch {
        toast.error('Failed to delete plan');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-neon-emerald">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Internet Package Manager</h1>
          </div>
          <p className="text-xs text-slate-400">Configure time-based, volume-based, and unlimited hotspot tiers with MikroTik bandwidth limits</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-kijani px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-neon-emerald flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plan 3D Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-panel-card rounded-3xl p-6 border border-white/10 hover:border-emerald-500/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 font-display uppercase tracking-wider">
                  {plan.badge || 'Kijani Hotspot'}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                  {formatDuration(plan.duration)}
                </span>
              </div>

              <h3 className="text-xl font-bold font-display text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-4 min-h-[32px]">{plan.description || 'High-speed fiber connection'}</p>

              <div className="text-3xl font-extrabold font-display text-emerald-400 mb-4">
                {formatCurrency(plan.price)}
                <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">
                  / {formatDuration(plan.duration)}
                </span>
              </div>

              <div className="space-y-2 py-3 border-t border-b border-white/10 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Speed Limit:</span>
                  <span className="font-semibold text-white font-mono">{plan.speedLimit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Data Limit:</span>
                  <span className="font-semibold text-white font-mono">{plan.dataLimit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">MikroTik Profile:</span>
                  <span className="font-mono text-cyan-400 text-[10px]">plan_{plan.id}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-2 pt-2">
              <button
                onClick={() => handleOpenModal(plan)}
                className="btn-glass flex-1 py-2 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1"
              >
                <Edit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                title="Deactivate Plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel-emerald rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-xl font-bold font-display text-white">
                {editingPlan ? 'Edit Internet Package' : 'Create New Internet Package'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Package Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 24-Hour Day Pass"
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Non-stop high-speed streaming & gaming"
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price (KES)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="150"
                    className="glass-input w-full px-3 py-2.5 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="24"
                    className="glass-input w-full px-3 py-2.5 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Speed Limit</label>
                  <input
                    type="text"
                    value={formData.speedLimit}
                    onChange={(e) => setFormData({ ...formData, speedLimit: e.target.value })}
                    placeholder="35 Mbps"
                    className="glass-input w-full px-3 py-2.5 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Data Limit</label>
                  <input
                    type="text"
                    value={formData.dataLimit}
                    onChange={(e) => setFormData({ ...formData, dataLimit: e.target.value })}
                    placeholder="Unlimited / 10GB"
                    className="glass-input w-full px-3 py-2.5 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-glass px-4 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-kijani px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-neon-emerald"
                >
                  {editingPlan ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansManagement;
