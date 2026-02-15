'use client'
import { useEffect, useMemo, useState } from 'react'

type Option = { id: number; name: string }
type Entry = {
  id: number
  date: string
  content: string
  amount: number
  category?: Option
  company?: Option
  handler?: Option
  fund?: Option
  attachments?: { id: number; storageKey: string; filename: string; size: number }[]
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().slice(0, 7) + '-01')
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().slice(0, 10))
  const [flow, setFlow] = useState<string>('all')
  const [hasReceipt, setHasReceipt] = useState<string>('any')
  const [keyword, setKeyword] = useState('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [companyId, setCompanyId] = useState<number | ''>('')
  const [handlerId, setHandlerId] = useState<number | ''>('')
  const [fundId, setFundId] = useState<number | ''>('')
  const [categories, setCategories] = useState<Option[]>([])
  const [companies, setCompanies] = useState<Option[]>([])
  const [handlers, setHandlers] = useState<Option[]>([])
  const [funds, setFunds] = useState<Option[]>([])
  const [items, setItems] = useState<Entry[]>([])
  const [summary, setSummary] = useState<{ income: number; expense: number; net: number; count_income: number; count_expense: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchOptions()
  }, [])

  async function fetchOptions() {
    const [cs, cos, hs, fs] = await Promise.all([
      fetch(`${API}/api/categories`).then(r => r.json()),
      fetch(`${API}/api/companies`).then(r => r.json()),
      fetch(`${API}/api/handlers`).then(r => r.json()),
      fetch(`${API}/api/funds`).then(r => r.json()),
    ])
    setCategories(cs)
    setCompanies(cos)
    setHandlers(hs)
    setFunds(fs)
  }

  function buildQuery() {
    const q: Record<string, string> = {}
    if (dateFrom) q.date_from = dateFrom
    if (dateTo) q.date_to = dateTo
    if (flow === 'income' || flow === 'expense') q.flow = flow
    if (hasReceipt === 'true' || hasReceipt === 'false') q.has_receipt = hasReceipt
    if (keyword) q.keyword = keyword
    if (minAmount) q.min_amount = minAmount
    if (maxAmount) q.max_amount = maxAmount
    if (categoryId) q.category = String(categoryId)
    if (companyId) q.company = String(companyId)
    if (handlerId) q.handler = String(handlerId)
    if (fundId) q.fund = String(fundId)
    const qs = new URLSearchParams(q).toString()
    return qs ? `?${qs}` : ''
  }

  async function search() {
    setLoading(true)
    const qs = buildQuery()
    const [list, sum] = await Promise.all([
      fetch(`${API}/api/entries${qs}`).then(r => r.json()),
      fetch(`${API}/api/entries/summary${qs}`).then(r => r.json()),
    ])
    setItems(Array.isArray(list) ? list.slice(0, 200) : [])
    setSummary(sum && typeof sum === 'object' ? sum : null)
    setLoading(false)
  }

  function resetFilters() {
    setDateFrom(new Date().toISOString().slice(0, 7) + '-01')
    setDateTo(new Date().toISOString().slice(0, 10))
    setFlow('all')
    setHasReceipt('any')
    setKeyword('')
    setMinAmount('')
    setMaxAmount('')
    setCategoryId('')
    setCompanyId('')
    setHandlerId('')
    setFundId('')
  }

  useEffect(() => {
    search()
  }, [])

  async function download(key: string) {
    const r = await fetch(`${API}/api/uploads/url?key=${encodeURIComponent(key)}`).then(r => r.json())
    if (r?.url) window.open(r.url, '_blank')
  }
  function toggleAttachments(id: number) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>月結與記錄查詢</h1>
        <div className="section">
          <div className="field">
            <label>日期自</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>日期至</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="field">
            <label>方向</label>
            <select value={flow} onChange={e => setFlow(e.target.value)}>
              <option value="all">全部</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
          <div className="field">
            <label>有單據</label>
            <select value={hasReceipt} onChange={e => setHasReceipt(e.target.value)}>
              <option value="any">不限</option>
              <option value="true">有</option>
              <option value="false">無</option>
            </select>
          </div>
          <div className="field">
            <label>關鍵字</label>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="內容或備註" />
          </div>
          <div className="field">
            <label>金額下限</label>
            <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
          </div>
          <div className="field">
            <label>金額上限</label>
            <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
          </div>
          <div className="field">
            <label>分類</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">不限</option>
              {categories.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>公司</label>
            <select value={companyId} onChange={e => setCompanyId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">不限</option>
              {companies.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>經手人</label>
            <select value={handlerId} onChange={e => setHandlerId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">不限</option>
              {handlers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>資金源/去向</label>
            <select value={fundId} onChange={e => setFundId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">不限</option>
              {funds.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" onClick={search} disabled={loading}>查詢</button>
            <button onClick={resetFilters} disabled={loading}>重設</button>
          </div>
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>摘要</h2>
          {summary ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="itemCard">
                <div>收入</div>
                <div className="amtPos">${new Intl.NumberFormat('zh-HK',{maximumFractionDigits:2}).format(summary.income)}</div>
              </div>
              <div className="itemCard">
                <div>支出</div>
                <div className="amtNeg">${new Intl.NumberFormat('zh-HK',{maximumFractionDigits:2}).format(Math.abs(summary.expense))}</div>
              </div>
              <div className="itemCard">
                <div>淨額</div>
                <div>${new Intl.NumberFormat('zh-HK',{maximumFractionDigits:2}).format(summary.net)}</div>
              </div>
            </div>
          ) : <div className="hint">尚無資料</div>}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>明細</h2>
          <div className="list">
            {items.map(i => (
              <div className="itemCard" key={i.id}>
                <div>
                  <div>{i.content}</div>
                  <div className="badge">{new Date(i.date).toLocaleDateString('zh-HK')} · {i.category?.name || '-'} · {i.company?.name || '-'}</div>
                  {i.attachments && i.attachments.length > 0 && (
                    <>
                      <div className="hint">
                        <button onClick={() => toggleAttachments(i.id)}>
                          附件：{i.attachments.length} 件{expanded[i.id] ? '（收合）' : '（展開）'}
                        </button>
                      </div>
                      {expanded[i.id] && (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {i.attachments.map(a => (
                            <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <span>{a.filename} · {Math.round(a.size / 1024)}KB</span>
                              <button className="primary" onClick={() => download(a.storageKey)}>下載</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
                <div className={Number(i.amount) >= 0 ? 'amtPos' : 'amtNeg'}>
                  ${new Intl.NumberFormat('zh-HK',{maximumFractionDigits:2}).format(Number(i.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
