'use client'
import { useEffect, useState } from 'react'

type Option = { id: number; name: string; direction?: string }
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function DictionaryPage() {
  const [categories, setCategories] = useState<Option[]>([])
  const [companies, setCompanies] = useState<Option[]>([])
  const [handlers, setHandlers] = useState<Option[]>([])
  const [funds, setFunds] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function fetchAll() {
    setLoading(true)
    try {
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  async function quickCreate(path: string, payload: any) {
    setMessage('')
    const r = await fetch(`${API}/api/${path}/quick-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json())
    await fetchAll()
    setMessage(`已新增：${r.name}`)
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>字典管理</h1>
        {loading && <div>載入中...</div>}
        <section className="section">
          <h2>分類</h2>
          <RowCreate placeholder="新增分類" onCreate={name => quickCreate('categories', { name })} />
          <List items={categories} />
        </section>
        <section className="section">
          <h2>公司名稱</h2>
          <RowCreate placeholder="新增公司" onCreate={name => quickCreate('companies', { name })} />
          <List items={companies} />
        </section>
        <section className="section">
          <h2>經手人</h2>
          <RowCreate placeholder="新增經手人" onCreate={name => quickCreate('handlers', { name })} />
          <List items={handlers} />
        </section>
        <section className="section">
          <h2>資金源/去向</h2>
          <FundCreate onCreate={(name, direction) => quickCreate('funds', { name, direction })} />
          <List items={funds} />
        </section>
        <div className="hint" style={{ color: '#a7f3d0' }}>{message}</div>
      </div>
    </div>
  )
}

function RowCreate({ placeholder, onCreate }: { placeholder: string; onCreate: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="field">
      <label>{placeholder}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={placeholder} />
        <button type="button" className="primary" onClick={() => name && onCreate(name)}>新增</button>
      </div>
    </div>
  )
}

function FundCreate({ onCreate }: { onCreate: (name: string, direction: string) => void }) {
  const [name, setName] = useState('')
  const [direction, setDirection] = useState('neutral')
  return (
    <div className="field">
      <label>新增資金源/去向</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="輸入名稱" />
        <select value={direction} onChange={e => setDirection(e.target.value)}>
          <option value="source">source</option>
          <option value="destination">destination</option>
          <option value="neutral">neutral</option>
        </select>
        <button type="button" className="primary" onClick={() => name && onCreate(name, direction)}>新增</button>
      </div>
    </div>
  )
}

function List({ items }: { items: Option[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>名稱</th>
          <th>方向</th>
        </tr>
      </thead>
      <tbody>
        {items.map(i => (
          <tr key={i.id}>
            <td>{i.name}</td>
            <td>{i.direction || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
