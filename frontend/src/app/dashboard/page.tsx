'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { reportsApi, CATEGORY_COLORS } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CustomTooltip } from '@/components/charts/CustomTooltip';
import {
  Wallet,
  BarChart3,
  AlertTriangle,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Receipt,
  Hand,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<any[]>([]);
  const [yearlyTrend, setYearlyTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  useEffect(() => {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    Promise.all([
      reportsApi.dashboard(),
      reportsApi.monthly(currentMonth, currentYear),
      reportsApi.yearly(currentYear),
    ]).then(([dash, monthly, yearly]) => {
      setDashboard(dash.data);

      const monthlyData = monthly.data?.categories;
      if (Array.isArray(monthlyData)) {
        setMonthlyBreakdown(monthlyData.map((item) => ({
      name: item.category,
      value: item.totalSpent,
    })));
      } else if (monthlyData && typeof monthlyData === 'object') {
        setMonthlyBreakdown(
          Object.entries(monthlyData).map(([name, value]) => ({ name, value }))
        );
      }

      const yearlyData = yearly.data?.monthly || [];

if (Array.isArray(yearlyData)) {
  const formatted = yearlyData.map((item) => ({
    month: item.monthName,   
    total: item.totalSpent,  
  }));

  setYearlyTrend(formatted);
}
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <ProtectedLayout>
      <div className="loading-center"><div className="loading-spinner" /></div>
    </ProtectedLayout>
  );

  const currentMonth   = dashboard?.currentMonth   || {};
  const lastMonth      = dashboard?.lastMonth      || {};
  const currentYear    = dashboard?.currentYear    || {};
  const alerts         = dashboard?.alerts         || {};
  const recentExpenses = dashboard?.recentExpenses || [];

  const exceeded  = alerts.exceeded  || [];
  const nearLimit = alerts.nearLimit || [];
  const hasAlerts = exceeded.length > 0 || nearLimit.length > 0;

  const spendingDiff = currentMonth.totalSpent - lastMonth.totalSpent;
  const spendingUp   = spendingDiff > 0;

  return (
    <ProtectedLayout>
      <div className="page-header">
        <p
  className="page-subtitle"
  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
>
  {greeting}, {user?.name?.split(' ')[0]}
  <span className="wave">👋</span>
</p>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="page-body animate-in">

        {hasAlerts && (
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {exceeded.map((alert: any) => (
              <div key={alert.category} className="alert alert-error" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}><AlertTriangle size={18} color="var(--red)" /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Budget exceeded — {alert.category}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    Spent {fmt(alert.totalSpent)} of {fmt(alert.budgetAmount)} budget
                    ({alert.usedPercentage}% used · {fmt(Math.abs(alert.remaining))} over limit)
                  </div>
                  <div className="progress-bar" style={{ marginTop: 8, height: 4 }}>
                    <div className="progress-fill" style={{ width: '100%', background: 'var(--red)' }} />
                  </div>
                </div>
              </div>
            ))}
            {nearLimit.map((alert: any) => (
              <div key={alert.category} className="alert alert-warning" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}><AlertTriangle size={18} color="var(--yellow)" /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Near limit — {alert.category}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    Spent {fmt(alert.totalSpent)} of {fmt(alert.budgetAmount)} budget
                    ({alert.usedPercentage}% used · {fmt(alert.remaining)} remaining)
                  </div>
                  <div className="progress-bar" style={{ marginTop: 8, height: 4 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(alert.usedPercentage, 100)}%`, background: 'var(--yellow)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="stat-grid">
          <div className="stat-card accent">
            <div className="stat-icon accent"><Wallet size={20} color="var(--accent)" /></div>
            <div className="stat-label">This Month</div>
            <div className="stat-value">{fmt(currentMonth.totalSpent || 0)}</div>
            <div className="stat-meta">{currentMonth.totalTransactions || 0} transactions · {currentMonth.categoryCount || 0} categories</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon red"><BarChart3 size={20} color="var(--red)" /></div>
            <div className="stat-label">Last Month</div>
            <div className="stat-value">{fmt(lastMonth.totalSpent || 0)}</div>
            <div className="stat-meta">
              {lastMonth.totalTransactions || 0} transactions{' '}
              <span style={{ color: spendingUp ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                {spendingUp ? (
                  <span style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} /> {fmt(spendingDiff)} more
                  </span>
                ) : (
                  <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingDown size={14} /> {fmt(Math.abs(spendingDiff))} less
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon yellow"><AlertTriangle size={20} color="var(--yellow)" /></div>
            <div className="stat-label">Exceeded Budgets</div>
            <div className="stat-value" style={{ color: exceeded.length > 0 ? 'var(--red)' : 'var(--text-primary)' }}>
              {exceeded.length}
            </div>
            <div className="stat-meta">{nearLimit.length} near limit</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><CalendarDays size={20} color="var(--green)" /></div>
            <div className="stat-label">This Year</div>
            <div className="stat-value">{fmt(currentYear.totalSpent || 0)}</div>
            <div className="stat-meta">{currentYear.year} total spending</div>
          </div>
        </div>

        <div className="charts-grid three" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Yearly Trend</div>
                <div className="card-subtitle">Monthly spending for {now.getFullYear()}</div>
              </div>
            </div>
            {yearlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={yearlyTrend} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C6FE0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C6FE0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip formatter={fmt} />} />
                  <Area type="monotone" dataKey="total" name="Spending" stroke="#7C6FE0" strokeWidth={2} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon"><Receipt size={28} color="var(--text-secondary)" /></div>
                <div className="empty-desc">No yearly data yet</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">This Month</div>
                <div className="card-subtitle">By category — {MONTHS[now.getMonth()]}</div>
              </div>
            </div>
            {monthlyBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={monthlyBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={0} dataKey="value">
                      {monthlyBreakdown.map((entry: any, i: number) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#7C6FE0'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={fmt} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                  {monthlyBreakdown.slice(0, 5).map((entry: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: CATEGORY_COLORS[entry.name] || '#7C6FE0', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {fmt(entry.value)}
                      </span>
                    </div>
                  ))}
                  {monthlyBreakdown.length > 5 && (
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 4, alignSelf: 'flex-start' }} onClick={() => router.push('/reports')}>
                      +{monthlyBreakdown.length - 5} more →
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon"><Receipt size={28} /></div>
                <div className="empty-desc">No data this month</div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Transactions</div>
              <div className="card-subtitle">Your latest {recentExpenses.length} expenses</div>
            </div>
            <button onClick={() => router.push('/expenses')} className="btn btn-secondary btn-sm">View all</button>
          </div>
          {recentExpenses.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Note</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((exp: any) => (
                  <tr key={exp.id}>
                    <td><strong>{exp.note || '—'}</strong></td>
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
                    <td style={{ textAlign: 'right' }}>
                      <span className="amount negative">{fmt(parseFloat(exp.amount))}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><Receipt size={28} color="var(--text-secondary)" /></div>
              <div className="empty-title">No expenses yet</div>
              <div className="empty-desc">Start adding your expenses to see them here</div>
            </div>
          )}
        </div>

      </div>
    </ProtectedLayout>
  );
}