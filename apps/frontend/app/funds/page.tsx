'use client'
import { useEffect, useState } from 'react'

type Row = { fundId: number; fundName: string; balance: number; count: number }
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function FundsPage() {
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().slice(0, 7) + '-01')
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  async function search() {
    setLoading(true)
    const qs = new URLSearchParams({ date_from: dateFrom, date_to: dateTo }).toString()
    const r = await fetch(`${API}/api/entries/fund-summary?${qs}`).then(r => r.json())
    setRows(Array.isArray(r) ? r : [])
    setLoading(false)
  }

  useEffect(() => { search() }, [])

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>資金源結餘</h1>
        <div className="section">
          <div className="field">
            <label>日期自</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>日期至</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" onClick={search} disabled={loading}>查詢</button>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>結餘表</h2>
          <table>
            <thead>
              <tr>
                <th>資金源/去向</th>
                <th>筆數</th>
                <th>結餘</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.fundId}>
                  <td>{r.fundName}</td>
                  <td>{r.count}</td>
                  <td style={{ color: r.balance >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                    ${new Intl.NumberFormat('zh-HK',{maximumFractionDigits:2}).format(r.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
