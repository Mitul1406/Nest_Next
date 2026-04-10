'use client';
import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES } from '@/lib/api';

interface Props {
  expense?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ExpenseModal({ expense, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setForm({
        amount: String(expense.amount || ''),
        category: expense.category || EXPENSE_CATEGORIES[0],
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        note: expense.note || '',
      });
    }
  }, [expense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({
        ...form,
        amount: parseFloat(form.amount),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">note </label>
            <input
              type="text"
              name="note"
              className="form-input"
              placeholder="Any additional note…"
              value={form.note}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                className="form-input"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className="form-select" value={form.category} onChange={handleChange}>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
              ) : (
                expense ? 'Update Expense' : 'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
