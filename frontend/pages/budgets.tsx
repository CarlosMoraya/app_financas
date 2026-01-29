import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useAuthProtection } from '../hooks/useAuthProtection'

interface Budget {
    id: number
    category_id: number
    category: string
    icon: string
    color: string
    amount: number
    spent: number
    period_start: string
    period_end: string
}

interface Category {
    id: number
    name: string
    icon: string
    color: string
}

export default function Budgets() {
    const { session, loading: authLoading } = useAuthProtection()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
    const [newBudget, setNewBudget] = useState({
        category_id: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7)
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    const loadData = useCallback(async () => {
        const isPreview = localStorage.getItem('preview_mode') === 'true'

        if (session) {
            // Fetch Budgets with category info
            const { data: budgetData } = await supabase
                .from('budgets')
                .select('*, categories(name, icon, color)')
                .order('period_start', { ascending: false })

            if (budgetData) {
                const formatted = budgetData.map((b: any) => ({
                    ...b,
                    category: b.categories?.name || 'Categoria',
                    icon: b.categories?.icon || '📁',
                    color: b.categories?.color || 'bg-gray-500',
                    spent: 0 // TODO: Calculate from transactions
                }))
                setBudgets(formatted)
            }

            // Fetch categories for dropdown (expense only)
            const { data: catData } = await supabase.from('categories').select('*').eq('type', 'expense').order('name')
            if (catData) setCategories(catData)

        } else if (isPreview) {
            setBudgets([
                { id: 1, category_id: 1, category: 'Alimentação', icon: '🍔', color: 'bg-orange-500', amount: 1500, spent: 850, period_start: '2026-01-01', period_end: '2026-01-31' },
                { id: 2, category_id: 2, category: 'Transporte', icon: '🚗', color: 'bg-blue-500', amount: 500, spent: 320, period_start: '2026-01-01', period_end: '2026-01-31' },
            ])
            setCategories([{ id: 1, name: 'Alimentação', icon: '🍔', color: 'bg-orange-500' }])
        }
    }, [session, supabase])

    useEffect(() => {
        if (!authLoading) {
            loadData()
        }
    }, [authLoading, loadData])

    const handleEditBudget = (budget: Budget) => {
        setEditingBudget(budget)
        setNewBudget({
            category_id: budget.category_id.toString(),
            amount: budget.amount.toString(),
            month: budget.period_start.slice(0, 7)
        })
        setShowModal(true)
    }

    const handleSaveBudget = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!session || !newBudget.category_id || !newBudget.amount) {
            alert('Preencha todos os campos')
            return
        }

        setIsSubmitting(true)
        const amountVal = parseFloat(newBudget.amount.replace(',', '.'))
        const periodStart = newBudget.month + '-01'
        const endDate = new Date(newBudget.month + '-01')
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        const periodEnd = endDate.toISOString().split('T')[0]

        try {
            if (editingBudget) {
                // Update
                const { error } = await supabase
                    .from('budgets')
                    .update({
                        category_id: parseInt(newBudget.category_id),
                        amount: amountVal,
                        period_start: periodStart,
                        period_end: periodEnd
                    })
                    .eq('id', editingBudget.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase.from('budgets').insert({
                    user_id: session.user.id,
                    category_id: parseInt(newBudget.category_id),
                    amount: amountVal,
                    period_start: periodStart,
                    period_end: periodEnd
                })

                if (error) throw error
            }

            setNewBudget({ category_id: '', amount: '', month: new Date().toISOString().slice(0, 7) })
            setEditingBudget(null)
            setShowModal(false)
            loadData()

        } catch (error: any) {
            console.error('Error saving budget:', error)
            alert('Erro ao salvar orçamento: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteBudget = async (id: number) => {
        if (!confirm('Excluir este orçamento?')) return
        const { error } = await supabase.from('budgets').delete().eq('id', id)
        if (error) alert('Erro: ' + error.message)
        else loadData()
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

    return (
        <Layout>
            <div className="space-y-6 fade-in">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium mb-1">Orçamento Total</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalBudget)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">💰</div>
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium mb-1">Gasto Atual</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalSpent)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">📊</div>
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium mb-1">Disponível</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalBudget - totalSpent)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">✅</div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 capitalize">{currentMonth}</h2>
                        <p className="text-gray-500">Acompanhe seus orçamentos mensais</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingBudget(null)
                            setNewBudget({ category_id: '', amount: '', month: new Date().toISOString().slice(0, 7) })
                            setShowModal(true)
                        }}
                        className="btn btn-primary"
                    >
                        + Novo Orçamento
                    </button>
                </div>

                {/* Budgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-8">Nenhum orçamento criado</p>
                    ) : budgets.map((budget) => {
                        const percentage = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0
                        const isOverBudget = percentage > 100
                        return (
                            <div key={budget.id} className="card group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 ${budget.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                                            {budget.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{budget.category}</h3>
                                            <p className="text-sm text-gray-500">Limite: {formatCurrency(budget.amount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditBudget(budget)}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition-all text-gray-400 hover:text-blue-600"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBudget(budget.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg transition-all text-gray-400 hover:text-red-600"
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Gasto: {formatCurrency(budget.spent)}</span>
                                        <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 fade-in">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                            </h2>
                            <form onSubmit={handleSaveBudget} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                                    <select
                                        className="input"
                                        value={newBudget.category_id}
                                        onChange={(e) => setNewBudget({ ...newBudget, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Limite Mensal</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="0.00"
                                        value={newBudget.amount}
                                        onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                                    <input
                                        type="month"
                                        className="input"
                                        value={newBudget.month}
                                        onChange={(e) => setNewBudget({ ...newBudget, month: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1" disabled={isSubmitting}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : (editingBudget ? 'Salvar' : 'Criar')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}
