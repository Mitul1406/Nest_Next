'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import BudgetModal from '@/components/BudgetModal';
import { budgetsApi, CATEGORY_COLORS } from '@/lib/api';
import { AlertTriangle, CreditCard, Target } from 'lucide-react';
const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function BudgetProgress({ budget }: { budget: any }) {
  const spent = budget.spent || 0;
  const limit = budget.amount || 1;
  const pct = Math.min(100, (spent / limit) * 100);
  const color = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div className="budget-item">
      <div className="budget-item-header">
        <div className="budget-name">
          <span className="category-dot" style={{ background: CATEGORY_COLORS[budget.category] || '#7C6FE0', width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
          {budget.category}
          {pct > 90 && <span className="alert alert-error" style={{ padding: '2px 8px', margin: 0, fontSize: 11 }}>Over limit!</span>}
        </div>
        <div className="budget-amounts">
          <span>{fmt(spent)}</span> / {fmt(budget.amount)}
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(0)}% used</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(Math.max(0, limit - spent))} remaining</span>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;
  const [filters, setFilters] = useState({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

const totalPages = Math.ceil(total / LIMIT);

  const load = async () => {
  setLoading(true);
  try {
    const res = await budgetsApi.findAll({
      page: page,
      limit: LIMIT,
      month:filters.month,
      year: filters.year,
    });
    setBudgets(res.data.data || []);
    setTotal(res.data.pagination.total || 0);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, [filters, page]);

  const handleSave = async (data: any) => {
    if (editBudget) {
      await budgetsApi.update(editBudget.id, data);
    } else {
      await budgetsApi.create(data);
    }
    setEditBudget(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    await budgetsApi.remove(id);
    await load();
  };

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent || 0), 0);
  const overBudget = budgets.filter(b => Number(b.spent || 0) > Number(b.amount || 0)).length;

  return (
    <ProtectedLayout>
      <div className="page-header">
        <h1 className="page-title">Budgets</h1>
        <p className="page-subtitle">Set limits and track your spending goals</p>
      </div>

      <div className="page-body animate-in">
        
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          <div className="stat-card accent">
            <div className="stat-icon accent"><Target size={20} color="var(--accent)" /></div>
            <div className="stat-label">Total Budgeted</div>
            <div className="stat-value">{fmt(totalBudgeted)}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><CreditCard size={20} color="var(--green)" /></div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">{fmt(totalSpent)}</div>
            <div className="stat-meta">{totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(0) : 0}% of budget</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon red"><AlertTriangle size={20} color="var(--red)" /></div>
            <div className="stat-label">Over Budget</div>
            <div className="stat-value">{overBudget}</div>
            <div className="stat-meta">categories</div>
          </div>
        </div>

        

        <div className="card">
          <div className="card-header"><div>
            <div style={{marginBottom:"10px"}}>
              <span className="card-title" style={{marginRight:"10px"}}>Budget Tracker</span>
              <span className="card-subtitle">{budgets.length} budgets set</span>
            </div>
                        <div className="filters-bar" style={{margin:"0px"}}>
                          <select
                            className="filter-select"
                            value={filters.month}
                            onChange={e => {
                              setFilters(f => ({ ...f, month: Number(e.target.value) }));
                            }}
                          >
                            {[
                              'Jan','Feb','Mar','Apr','May','Jun',
                              'Jul','Aug','Sep','Oct','Nov','Dec'
                            ].map((m, i) => (
                              <option key={i} value={i + 1}>{m}</option>
                            ))}
                          </select>

                          <select
                            className="filter-select"
                            value={filters.year}
                            onChange={e => {
                              setFilters(f => ({ ...f, year: Number(e.target.value) }));
                            }}
                          >
                            {[2024, 2025, 2026, 2027].map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>

                          <div className="filters-spacer" />
                        </div>
                        </div>




            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setEditBudget(null); setShowModal(true); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Set Budget
            </button>
          </div>

          {loading ? (
            <div className="loading-center"><div className="loading-spinner" /></div>
          ) : budgets.length > 0 ? (
            <>
              {budgets.map((budget: any) => (
                <div key={budget.id} style={{ position: 'relative' }}>
                  <BudgetProgress budget={budget} />
                  <div style={{ position: 'absolute', top: 16, right: 0, display: 'flex', gap: 6,flexDirection:"column" }}>
                    <button
                      className="btn-icon"
                      onClick={() => { setEditBudget(budget); setShowModal(true); }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(budget.id)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

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
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No budgets yet</div>
              <div className="empty-desc">Set budgets for your expense categories to track your spending</div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <BudgetModal
          budget={editBudget}
          onClose={() => { setShowModal(false); setEditBudget(null); }}
          onSave={handleSave}
        />
      )}
    </ProtectedLayout>
  );
}
