'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import ExpenseModal from '@/components/ExpenseModal';
import { expensesApi, EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/lib/api';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;
      const res = await expensesApi.findAll(params);
      setExpenses(res.data?.data || res.data || []);
      setTotal(res.data?.pagination.total || (res.data?.length ?? 0));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filters]);

  const handleSave = async (data: any) => {
    if (editExpense) {
      await expensesApi.update(editExpense.id, data);
    } else {
      await expensesApi.create(data);
    }
    setEditExpense(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    setDeleting(id);
    try {
      await expensesApi.remove(id);
      await load();
    } finally { setDeleting(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <ProtectedLayout>
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">Track and manage your spending</p>
      </div>

      <div className="page-body animate-in">
        <div className="card">
          <div className="card-header">
            <div className="card-title">{total} expenses</div>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditExpense(null); setShowModal(true); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Expense
            </button>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <select
              className="filter-select"
              value={filters.category}
              onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
            >
              <option value="">All categories</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <input
              type="date"
              className="filter-input"
              value={filters.startDate}
              placeholder="Start date"
              onChange={e => { setFilters(f => ({ ...f, startDate: e.target.value })); setPage(1); }}
            />
            <input
              type="date"
              className="filter-input"
              value={filters.endDate}
              placeholder="End date"
              onChange={e => { setFilters(f => ({ ...f, endDate: e.target.value })); setPage(1); }}
            />

            <input
              type="number"
              className="filter-input"
              placeholder="Min amount"
              value={filters.minAmount}
              style={{ width: 110 }}
              onChange={e => { setFilters(f => ({ ...f, minAmount: e.target.value })); setPage(1); }}
            />
            <input
              type="number"
              className="filter-input"
              placeholder="Max amount"
              value={filters.maxAmount}
              style={{ width: 110 }}
              onChange={e => { setFilters(f => ({ ...f, maxAmount: e.target.value })); setPage(1); }}
            />

            <div className="filters-spacer" />
            {Object.values(filters).some(Boolean) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setFilters({ category: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' }); setPage(1); }}
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-center"><div className="loading-spinner" /></div>
          ) : expenses.length > 0 ? (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th >Category</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp: any) => (
                    <tr key={exp.id}>
                      <td>
                        <span className="category-badge">
                          <span className="category-dot" style={{ background: CATEGORY_COLORS[exp.category] || '#7C6FE0' }} />
                          {exp.category}
                        </span>
                      </td>
                      <td>
                        <span className="date-display">
                          {new Date(exp.date || exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{exp.note || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="amount negative">{fmt(exp.amount)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn-icon"
                            onClick={() => { setEditExpense(exp); setShowModal(true); }}
                            title="Edit"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            className="btn-icon"
                            style={{ color: deleting === exp.id ? 'var(--red)' : undefined }}
                            onClick={() => handleDelete(exp.id)}
                            disabled={deleting === exp.id}
                            title="Delete"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💸</div>
              <div className="empty-title">No expenses found</div>
              <div className="empty-desc">Add your first expense to get started</div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ExpenseModal
          expense={editExpense}
          onClose={() => { setShowModal(false); setEditExpense(null); }}
          onSave={handleSave}
        />
      )}
    </ProtectedLayout>
  );
}
