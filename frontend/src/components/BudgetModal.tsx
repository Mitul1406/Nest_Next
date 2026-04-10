'use client';
import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES } from '@/lib/api';

interface Props {
  budget?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function BudgetModal({ budget, onClose, onSave }: Props) {
  const now = new Date();
  const [form, setForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setForm({
        category: budget.category,
        amount: String(budget.amount),
        month: budget.month || now.getMonth() + 1,
        year: budget.year || now.getFullYear(),
      });
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({ ...form, amount: parseFloat(form.amount) });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{budget ? 'Edit Budget' : 'Set Budget'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Budget Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="5000"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
              min="1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Month</label>
              <select className="form-select" value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : budget ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
