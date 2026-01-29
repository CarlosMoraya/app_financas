import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useAuthProtection } from '../hooks/useAuthProtection'

export default function Reports() {
    const { session, loading: authLoading } = useAuthProtection()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const [period, setPeriod] = useState('month')

    // State for dynamic data
    const [categoryData, setCategoryData] = useState<any[]>([])
    const [monthlyData, setMonthlyData] = useState<any[]>([])
    const [totalIncome, setTotalIncome] = useState(0)
    const [totalExpense, setTotalExpense] = useState(0)

    useEffect(() => {
        if (authLoading) return

        const loadData = async () => {
            const isPreview = localStorage.getItem('preview_mode') === 'true'

            if (session) {
                // Calculate date range based on period
                const now = new Date()
                let startDate = new Date()

                if (period === 'week') {
                    startDate.setDate(now.getDate() - 7)
                } else if (period === 'month') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                } else if (period === 'year') {
                    startDate = new Date(now.getFullYear(), 0, 1)
                }

                // Fetch Real Data with Filter
                const { data } = await supabase
                    .from('transactions')
                    .select('*, categories(name, color)')
                    .gte('date', startDate.toISOString())
                    .lte('date', now.toISOString())
                    .order('date', { ascending: true })

                if (data) {
                    processRealData(data)
                }
            } else if (isPreview) {
                // Mock Data (Simplified for preview)
                setCategoryData([
                    { name: 'Alimentação', value: 850, color: 'bg-orange-500', percentage: 28 },
                    { name: 'Transporte', value: 320, color: 'bg-yellow-500', percentage: 11 },
                    { name: 'Contas', value: 680, color: 'bg-red-500', percentage: 22 },
                    { name: 'Entretenimento', value: 245, color: 'bg-purple-500', percentage: 8 },
                    { name: 'Saúde', value: 420, color: 'bg-pink-500', percentage: 14 },
                    { name: 'Educação', value: 350, color: 'bg-indigo-500', percentage: 12 },
                    { name: 'Outros', value: 150, color: 'bg-gray-500', percentage: 5 },
                ])
                setMonthlyData([
                    { month: 'Jan', income: 6200, expense: 3015 },
                    { month: 'Fev', income: 5800, expense: 2850 },
                    { month: 'Mar', income: 6500, expense: 3200 },
                    { month: 'Abr', income: 6000, expense: 2900 },
                    { month: 'Mai', income: 6300, expense: 3100 },
                    { month: 'Jun', income: 6100, expense: 2950 },
                ])
                setTotalIncome(6200)
                setTotalExpense(3015)
            }
        }
        loadData()
    }, [authLoading, session, supabase, period])

    const processRealData = (transactions: any[]) => {
        // Calculate Totals
        const income = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0)
        const expense = Math.abs(transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0))
        setTotalIncome(income)
        setTotalExpense(expense)

        // Process Category Data (Expense Only)
        const expenses = transactions.filter((t: any) => t.type === 'expense')
        const categoryMap = new Map()

        expenses.forEach((t: any) => {
            const catName = t.categories?.name || 'Sem Categoria'
            const catColor = t.categories?.color || 'bg-gray-500'
            const amount = Math.abs(t.amount)

            if (categoryMap.has(catName)) {
                const existing = categoryMap.get(catName)
                categoryMap.set(catName, { ...existing, value: existing.value + amount })
            } else {
                categoryMap.set(catName, { name: catName, value: amount, color: catColor })
            }
        })

        const processedCategories = Array.from(categoryMap.values()).map((c: any) => ({
            ...c,
            percentage: expense > 0 ? Math.round((c.value / expense) * 100) : 0
        })).sort((a: any, b: any) => b.value - a.value).slice(0, 6)

        setCategoryData(processedCategories)

        // Process Monthly Data
        const monthMap = new Map()
        transactions.forEach((t: any) => {
            const date = new Date(t.date)
            const monthKey = t.date.substring(0, 7) // 2023-01
            const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' })

            if (!monthMap.has(monthKey)) {
                monthMap.set(monthKey, { month: monthLabel, income: 0, expense: 0, sortKey: monthKey })
            }

            const entry = monthMap.get(monthKey)
            if (t.type === 'income') {
                entry.income += t.amount
            } else {
                entry.expense += Math.abs(t.amount)
            }
        })

        const processedMonths = Array.from(monthMap.values())
            .sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey))
            .slice(-6) // Last 6 months

        setMonthlyData(processedMonths)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const handleExportPDF = () => {
        window.print()
    }

    return (
        <Layout>
            <div className="space-y-6 fade-in print:space-y-4">
                {/* Period Selector - Hidden on Print */}
                <div className="card print:hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Relatórios Financeiros</h2>
                            <p className="text-gray-500 mt-1">Análise detalhada das suas finanças</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPeriod('week')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setPeriod('month')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Mês
                            </button>
                            <button
                                onClick={() => setPeriod('year')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Ano
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white print:text-black print:bg-white print:border print:border-gray-200">
                        <p className="text-green-100 text-sm font-medium mb-1 print:text-gray-600">Total Receitas</p>
                        <h3 className="text-3xl font-bold">{formatCurrency(totalIncome)}</h3>
                        <p className="text-green-100 text-xs mt-2 print:hidden">+12% vs mês anterior</p>
                    </div>

                    <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white print:text-black print:bg-white print:border print:border-gray-200">
                        <p className="text-red-100 text-sm font-medium mb-1 print:text-gray-600">Total Despesas</p>
                        <h3 className="text-3xl font-bold">{formatCurrency(totalExpense)}</h3>
                        <p className="text-red-100 text-xs mt-2 print:hidden">-5% vs mês anterior</p>
                    </div>

                    <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white print:text-black print:bg-white print:border print:border-gray-200">
                        <p className="text-indigo-100 text-sm font-medium mb-1 print:text-gray-600">Saldo</p>
                        <h3 className="text-3xl font-bold">{formatCurrency(totalIncome - totalExpense)}</h3>
                        <p className="text-indigo-100 text-xs mt-2 print:hidden">51% da receita</p>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white print:text-black print:bg-white print:border print:border-gray-200">
                        <p className="text-purple-100 text-sm font-medium mb-1 print:text-gray-600">Média Diária</p>
                        <h3 className="text-3xl font-bold">{formatCurrency((totalExpense / 30) || 0)}</h3>
                        <p className="text-purple-100 text-xs mt-2 print:hidden">Gastos por dia</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
                    {/* Monthly Trend Chart */}
                    <div className="card print:shadow-none print:border print:border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Evolução Mensal</h3>
                        <div className="space-y-4">
                            {monthlyData.map((data) => {
                                const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense))) || 1000
                                return (
                                    <div key={data.month}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">{data.month}</span>
                                            <div className="flex gap-4">
                                                <span className="text-green-600">+{formatCurrency(data.income)}</span>
                                                <span className="text-red-600">-{formatCurrency(data.expense)}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 h-8">
                                            <div
                                                className="bg-green-500 rounded transition-all duration-500 print:print-color-adjust-exact"
                                                style={{ width: `${Math.min((data.income / maxVal) * 100, 100)}%` }}
                                                title={`Receita: ${formatCurrency(data.income)}`}
                                            />
                                            <div
                                                className="bg-red-500 rounded transition-all duration-500 print:print-color-adjust-exact"
                                                style={{ width: `${Math.min((data.expense / maxVal) * 100, 100)}%` }}
                                                title={`Despesa: ${formatCurrency(data.expense)}`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="card print:shadow-none print:border print:border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Despesas por Categoria</h3>
                        <div className="space-y-4">
                            {categoryData.length > 0 ? categoryData.map((category) => (
                                <div key={category.name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700">{category.name}</span>
                                        <span className="text-gray-600">{formatCurrency(category.value)} ({category.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full ${category.color} transition-all duration-500 print:print-color-adjust-exact`}
                                            style={{ width: `${category.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )) : <p className="text-gray-500">Nenhum dado disponível</p>}
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="card print:shadow-none print:border print:border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Resumo Detalhado</h3>
                        <button
                            className="btn btn-primary print:hidden"
                            onClick={handleExportPDF}
                        >
                            📥 Exportar PDF
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">% do Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryData.map((category) => (
                                    <tr key={category.name} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${category.color} print:print-color-adjust-exact`} />
                                                <span className="font-medium text-gray-800">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4 font-semibold text-gray-800">
                                            {formatCurrency(category.value)}
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium print:bg-gray-200 print:text-black">
                                                {category.percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
