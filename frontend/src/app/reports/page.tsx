'use client';
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { reportsApi, CATEGORY_COLORS } from '@/lib/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { CustomTooltip } from '@/components/charts/CustomTooltip';
import { Calendar, CalendarRange, LayoutGrid } from 'lucide-react';
const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'breakdown'>('monthly');

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [yearlyYear, setYearlyYear] = useState(now.getFullYear());
  const [startDate, setStartDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(now.toISOString().split('T')[0]);

  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [highestSpend, setHighestSpend] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMonthly = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.monthly(month, year);
      setMonthlyData(res.data.categories);
    } finally { setLoading(false); }
  };

  const loadYearly = async () => {
  setLoading(true);
  try {
    const res = await reportsApi.yearly(yearlyYear);
    setHighestSpend(res.data?.highestSpendingMonth?.monthName);

    const data = res.data ;

    const arr = (data?.monthly || []).map((item:any) => ({
      month: item.monthName, 
      total: item.totalSpent,
      transactions: item.totalTransactions
    }));

    setYearlyData(arr);
  } finally {
    setLoading(false);
  }
};

  const loadBreakdown = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await reportsApi.categoryBreakdown(startDate, endDate);
      const data = res.data.categories;
      const arr = Array.isArray(data) ? data.map((i: any) => ({ name: i.category, value: i.totalSpent })) :
        Object.entries(data || {}).map(([name, value]) => ({ name, value }));
      setBreakdownData(arr);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'monthly') loadMonthly();
    else if (activeTab === 'yearly') loadYearly();
    else loadBreakdown();
  }, [activeTab, month, year, yearlyYear, startDate, endDate]);

  const monthlyCategories = monthlyData
    ? Array.isArray(monthlyData)
      ? monthlyData.map((i: any) => ({ name: i.category, value: i.totalSpent }))
      : Object.entries(monthlyData?.categoryBreakdown || monthlyData || {}).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <ProtectedLayout>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Deep dive into your spending patterns</p>
      </div>

      <div className="page-body animate-in">
      
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
  {(['monthly', 'yearly', 'breakdown'] as const).map(tab => {
    const isActive = activeTab === tab;

    const icon =
      tab === 'monthly' ? <Calendar size={16} /> :
      tab === 'yearly' ? <CalendarRange size={16} /> :
      <LayoutGrid size={16} />;

    const label =
      tab === 'monthly' ? 'Monthly' :
      tab === 'yearly' ? 'Yearly' :
      'Category Breakdown';

    return (
      <button
        key={tab}
        className={`chip ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab(tab)}
        style={{
          padding: '8px 20px',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        {icon}
        {label}
      </button>
    );
  })}
</div>

        {activeTab === 'monthly' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <select
                className="filter-select"
                value={month}
                onChange={e => setMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <input
                type="number"
                className="filter-input"
                value={year}
                style={{ width: 100 }}
                onChange={e => setYear(parseInt(e.target.value))}
              />
            </div>

            {loading ? (
              <div className="loading-center"><div className="loading-spinner" /></div>
            ) : (
              <div className="charts-grid three">
                <div className="card">
                <div className="card-header">
                  <div className="card-title">Spending by Category</div>
                  <div className="card-subtitle">{MONTHS[month - 1]} {year}</div>
                </div>

                <div className="card-body">
                  {monthlyCategories.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyCategories}
                    
                        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                        <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />

                        <Tooltip content={<CustomTooltip formatter={fmt} />} />

                        <Bar dataKey="value" name="Spending" radius={[0, 4, 4, 0]}>
                          {monthlyCategories.map((entry: any, i: number) => (
                            <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#7C6FE0'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <div className="empty-desc">No data for this period</div>
                    </div>
                  )}
                </div>
              </div>

                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Category Split</div>
                  </div>
                  {monthlyCategories.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={monthlyCategories} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={0} dataKey="value">
                            {monthlyCategories.map((entry: any, i: number) => (
                              <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#7C6FE0'} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip formatter={fmt} />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                        {monthlyCategories.map((entry: any, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[entry.name] || '#7C6FE0' }} />
                              <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>{fmt(entry.value as number)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="empty-state"><div className="empty-icon">🍩</div><div className="empty-desc">No data this month</div></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'yearly' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <input
                type="number"
                className="filter-input"
                value={yearlyYear}
                style={{ width: 100 }}
                onChange={e => setYearlyYear(parseInt(e.target.value))}
              />
            </div>

            {loading ? (
              <div className="loading-center"><div className="loading-spinner" /></div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Monthly Spending — {yearlyYear}</div>
                  <div className="card-subtitle">Total: {fmt(yearlyData.reduce((s, d) => s + (d.total || 0), 0))}</div>
                </div>
                {yearlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={yearlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C6FE0" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#7C6FE0" stopOpacity={0.6}/>
                        </linearGradient>

                        <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#B91C1C" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip formatter={fmt} />} />
                      <Bar dataKey="total" name="Spending" radius={[4, 4, 0, 0]}>
                        {yearlyData.map((entry, i) => {
                          const isHighest =
                            entry.month === highestSpend;
                          return (
                            <Cell
                              key={i}
                              fill={isHighest ? "url(#dangerGrad)" : "url(#normalGrad)"} 
                              stroke={isHighest ?  "#DC2626" : "none"}
                              strokeWidth={isHighest ? 2 : 0}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state"><div className="empty-icon">📆</div><div className="empty-desc">No data for {yearlyYear}</div></div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>From</div>
                <input type="date" className="filter-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>To</div>
                <input type="date" className="filter-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <div className="loading-center"><div className="loading-spinner" /></div>
            ) : (
              <div className="charts-grid three">
                <div className="card">
                <div className="card-header">
                  <div className="card-title">Category Breakdown</div>
                  <div className="card-subtitle">{startDate} → {endDate}</div>
                </div>

                <div className="card-body">
                  {breakdownData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={breakdownData}
                        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                        <YAxis
                          tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 11 }}
                        />

                        <Tooltip content={<CustomTooltip formatter={fmt} />} />

                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {breakdownData.map((entry: any, i: number) => (
                            <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#7C6FE0'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <div className="empty-desc">No data for this date range</div>
                    </div>
                  )}
                </div>
              </div>

                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Distribution</div>
                  </div>
                  {breakdownData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={breakdownData} cx="50%" cy="50%" outerRadius={85} paddingAngle={0} dataKey="value">
                            {breakdownData.map((entry: any, i: number) => (
                              <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#7C6FE0'} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip formatter={fmt} />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                        {breakdownData.map((entry: any, i: number) => {
                          const total = breakdownData.reduce((s, d) => s + (d.value as number), 0);
                          const pct = total > 0 ? ((entry.value as number) / total * 100).toFixed(1) : '0';
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[entry.name] || '#7C6FE0' }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 12 }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{pct}%</span>
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>{fmt(entry.value as number)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="empty-state"><div className="empty-icon">🍩</div><div className="empty-desc">No data</div></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
