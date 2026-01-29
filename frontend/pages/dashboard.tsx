import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useAuthProtection } from '../hooks/useAuthProtection'

interface Account {
  id: number
  name: string
  type: string
  currency: string
  current_balance: number // Updated to match DB schema
  initial_balance: number
}

interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  category_id: number // Updated to match DB schema
}

export default function Dashboard() {
  const { session, loading: authLoading } = useAuthProtection()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [monthlyData, setMonthlyData] = useState<{ day: number; income: number; expense: number }[]>([])

  useEffect(() => {
    if (authLoading) return

    const loadData = async () => {
      const isPreview = localStorage.getItem('preview_mode') === 'true'

      if (session) {
        try {
          // Fetch Accounts
          const { data: accountsData, error: accountsError } = await supabase
            .from('accounts')
            .select('*')
            .order('name')

          if (accountsError) throw accountsError
          setAccounts(accountsData || [])

          // Fetch Recent Transactions (Limit 5)
          const { data: recentTx, error: transactionError } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
            .limit(5)

          if (transactionError) throw transactionError
          setTransactions(recentTx || [])

          // Fetch Month Transactions for Chart
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

          const { data: monthTx, error: monthTxError } = await supabase
            .from('transactions')
            .select('date, amount, type')
            .gte('date', startOfMonth)
            .lte('date', endOfMonth)

          if (monthTxError) throw monthTxError

          if (monthTx) {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
            const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
              day: i + 1,
              income: 0,
              expense: 0
            }))

            monthTx.forEach((t: any) => {
              const day = new Date(t.date).getUTCDate()
              const idx = day - 1
              if (idx >= 0 && idx < daysInMonth) {
                if (t.type === 'income') chartData[idx].income += t.amount
                else if (t.type === 'expense') chartData[idx].expense += t.amount
              }
            })
            setMonthlyData(chartData)
          }

        } catch (error) {
          console.error('Error loading data:', error)
          // Fallback or alert?
        }
      } else if (isPreview) {
        // Mock data
        setAccounts([
          { id: 1, name: 'Carteira Principal', type: 'cash', currency: 'BRL', current_balance: 1500.00, initial_balance: 1500.00 },
          { id: 2, name: 'Banco Digital', type: 'checking', currency: 'BRL', current_balance: 5000.00, initial_balance: 5000.00 },
          { id: 3, name: 'Investimentos', type: 'investment', currency: 'BRL', current_balance: 12000.00, initial_balance: 12000.00 },
          { id: 4, name: 'Cartão de Crédito', type: 'credit', currency: 'BRL', current_balance: -850.00, initial_balance: -850.00 },
        ])
        setTransactions([
          { id: 1, description: 'Salário', amount: 5000, type: 'income', date: '2026-01-25', category_id: 1 },
          { id: 2, description: 'Supermercado', amount: 350, type: 'expense', date: '2026-01-24', category_id: 2 },
          { id: 3, description: 'Freelance', amount: 1200, type: 'income', date: '2026-01-23', category_id: 3 },
          { id: 4, description: 'Conta de Luz', amount: 180, type: 'expense', date: '2026-01-22', category_id: 4 },
          { id: 5, description: 'Netflix', amount: 45, type: 'expense', date: '2026-01-20', category_id: 5 },
        ])
        // Mock Chart Data
        const mockChart = Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          income: Math.random() > 0.8 ? Math.random() * 1000 : 0,
          expense: Math.random() > 0.6 ? Math.random() * 300 : 0
        }))
        setMonthlyData(mockChart)
      }
      setLoadingData(false)
    }

    loadData()
  }, [authLoading, session, supabase])

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0)
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getAccountIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      cash: '💵',
      checking: '🏦',
      investment: '📈',
      credit: '💳',
      savings: '🐷'
    }
    return icons[type] || '💰'
  }

  const maxChartValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 100)

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Saldo Total</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">💰</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Receitas</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalIncome)}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">📈</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Despesas</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalExpenses)}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">📉</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Economia</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalIncome - totalExpenses)}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">🎯</div>
            </div>
          </div>
        </div>

        {/* Accounts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accounts */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Minhas Contas</h2>
              <button
                onClick={() => router.push('/accounts')}
                className="btn btn-primary text-sm"
              >
                + Nova Conta
              </button>
            </div>
            <div className="space-y-3">
              {accounts.length === 0 ? <p className="text-gray-400 text-center py-4">Nenhuma conta cadastrada</p> : accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{acc.name}</h3>
                      <p className="text-xs text-gray-500 uppercase">{acc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${acc.current_balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                      {formatCurrency(acc.current_balance || 0)}
                    </p>
                    <p className="text-xs text-gray-400">{acc.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Transações Recentes</h2>
              <button onClick={() => router.push('/transactions')} className="btn btn-primary text-sm">Ver Todas</button>
            </div>
            <div className="space-y-3">
              {transactions.length === 0 ? <p className="text-gray-400 text-center py-4">Nenhuma transação recente</p> : transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {t.type === 'income' ? '⬆️' : '⬇️'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{t.description}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visão Geral Mensal Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Visão Geral Mensal</h2>
          <div className="h-64 w-full flex items-end justify-between gap-1">
            {monthlyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col justify-end items-center group h-full relative">
                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded z-10 whitespace-nowrap">
                  Dia {d.day}: +{formatCurrency(d.income)} / -{formatCurrency(d.expense)}
                </div>

                <div className="w-full flex gap-[1px] h-full items-end">
                  <div
                    className="w-1/2 bg-green-400 rounded-t-sm hover:bg-green-500 transition-all opacity-80 hover:opacity-100"
                    style={{ height: `${(d.income / maxChartValue) * 100}%` }}
                  ></div>
                  <div
                    className="w-1/2 bg-red-400 rounded-t-sm hover:bg-red-500 transition-all opacity-80 hover:opacity-100"
                    style={{ height: `${(d.expense / maxChartValue) * 100}%` }}
                  ></div>
                </div>
                {d.day % 5 === 0 && <span className="text-[10px] text-gray-400 mt-2">{d.day}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
