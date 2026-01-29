import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useAuthProtection } from '../hooks/useAuthProtection'

interface Transaction {
    id: number
    description: string
    amount: number
    type: 'income' | 'expense' | 'transfer'
    date: string
    category: string
    category_id: number | null
    account: string
    account_id: number
    status: 'completed' | 'pending'
}

interface Account {
    id: number
    name: string
}

interface Category {
    id: number
    name: string
    type: string
}

export default function Transactions() {
    const { session, loading: authLoading } = useAuthProtection()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [newTransaction, setNewTransaction] = useState({
        description: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        date: new Date().toISOString().split('T')[0],
        account_id: '',
        category_id: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loadData = useCallback(async () => {
        const isPreview = localStorage.getItem('preview_mode') === 'true'

        if (session) {
            // Fetch Transactions
            const { data: txData } = await supabase
                .from('transactions')
                .select('*, categories(name), accounts(name)')
                .order('date', { ascending: false })

            if (txData) {
                const formattedData = txData.map((t: any) => ({
                    ...t,
                    category: t.categories?.name || 'Sem Categoria',
                    account: t.accounts?.name || 'Conta Desconhecida'
                }))
                setTransactions(formattedData)
            }

            // Fetch Accounts for dropdown
            const { data: accData } = await supabase.from('accounts').select('id, name').order('name')
            if (accData) setAccounts(accData)

            // Fetch Categories for dropdown
            const { data: catData } = await supabase.from('categories').select('id, name, type').order('name')
            if (catData) setCategories(catData)

        } else if (isPreview) {
            setTransactions([
                { id: 1, description: 'Salário Janeiro', amount: 5000, type: 'income', date: '2026-01-25', category: 'Salário', category_id: 1, account: 'Banco Digital', account_id: 1, status: 'completed' },
                { id: 2, description: 'Supermercado Extra', amount: 350, type: 'expense', date: '2026-01-24', category: 'Alimentação', category_id: 2, account: 'Carteira', account_id: 2, status: 'completed' },
            ])
            setAccounts([{ id: 1, name: 'Banco Digital' }, { id: 2, name: 'Carteira' }])
            setCategories([{ id: 1, name: 'Salário', type: 'income' }, { id: 2, name: 'Alimentação', type: 'expense' }])
        }
    }, [session, supabase])

    useEffect(() => {
        if (!authLoading) {
            loadData()
        }
    }, [authLoading, loadData])

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setNewTransaction({
            description: transaction.description,
            amount: transaction.amount.toString(),
            type: transaction.type as 'income' | 'expense',
            date: transaction.date,
            account_id: transaction.account_id.toString(),
            category_id: transaction.category_id ? transaction.category_id.toString() : ''
        })
        setShowModal(true)
    }

    const handleSaveTransaction = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!session || !newTransaction.description || !newTransaction.amount || !newTransaction.account_id) {
            alert('Preencha todos os campos obrigatórios')
            return
        }

        setIsSubmitting(true)
        const amountVal = parseFloat(newTransaction.amount.replace(',', '.'))

        try {
            if (editingTransaction) {
                // Update
                const { error } = await supabase
                    .from('transactions')
                    .update({
                        description: newTransaction.description,
                        amount: amountVal,
                        type: newTransaction.type,
                        date: newTransaction.date,
                        account_id: parseInt(newTransaction.account_id),
                        category_id: newTransaction.category_id ? parseInt(newTransaction.category_id) : null,
                    })
                    .eq('id', editingTransaction.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase.from('transactions').insert({
                    user_id: session.user.id,
                    description: newTransaction.description,
                    amount: amountVal,
                    type: newTransaction.type,
                    date: newTransaction.date,
                    account_id: parseInt(newTransaction.account_id),
                    category_id: newTransaction.category_id ? parseInt(newTransaction.category_id) : null,
                    status: 'completed'
                })

                if (error) throw error
            }

            setNewTransaction({
                description: '',
                amount: '',
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                account_id: '',
                category_id: ''
            })
            setEditingTransaction(null)
            setShowModal(false)
            loadData()

        } catch (error: any) {
            console.error('Error saving transaction:', error)
            alert('Erro ao salvar transação: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteTransaction = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return

        const { error } = await supabase.from('transactions').delete().eq('id', id)
        if (error) {
            alert('Erro ao excluir: ' + error.message)
        } else {
            loadData()
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Math.abs(value))
    }

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true
        return t.type === filter
    })

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    const filteredCategories = categories.filter(c => c.type === newTransaction.type)

    return (
        <Layout>
            <div className="space-y-6 fade-in">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium mb-1">Total Receitas</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalIncome)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                                ⬆️
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium mb-1">Total Despesas</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalExpenses)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                                ⬇️
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium mb-1">Saldo</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalIncome - totalExpenses)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                                💰
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="card">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setFilter('income')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Receitas
                            </button>
                            <button
                                onClick={() => setFilter('expense')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Despesas
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditingTransaction(null)
                                    setNewTransaction({
                                        description: '',
                                        amount: '',
                                        type: 'expense',
                                        date: new Date().toISOString().split('T')[0],
                                        account_id: '',
                                        category_id: ''
                                    })
                                    setShowModal(true)
                                }}
                                className="btn btn-primary"
                            >
                                + Nova Transação
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Histórico de Transações</h2>
                    <div className="space-y-3">
                        {filteredTransactions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
                        ) : filteredTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {transaction.type === 'income' ? '⬆️' : '⬇️'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{transaction.description}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-sm text-gray-500">{transaction.category}</p>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-sm text-gray-500">{transaction.account}</p>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={`font-bold text-xl ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                    </p>
                                    <button
                                        onClick={() => handleEditTransaction(transaction)}
                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
                                        title="Excluir"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 fade-in">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                            </h2>
                            <form onSubmit={handleSaveTransaction} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ex: Supermercado"
                                        value={newTransaction.description}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="0.00"
                                            value={newTransaction.amount}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={newTransaction.date}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category_id: '' })}
                                            className={`flex-1 py-2 rounded-lg font-medium border ${newTransaction.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                        >
                                            Receita
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category_id: '' })}
                                            className={`flex-1 py-2 rounded-lg font-medium border ${newTransaction.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                        >
                                            Despesa
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Conta *</label>
                                    <select
                                        className="input"
                                        value={newTransaction.account_id}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, account_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                                    <select
                                        className="input"
                                        value={newTransaction.category_id}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, category_id: e.target.value })}
                                    >
                                        <option value="">Sem categoria</option>
                                        {filteredCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn btn-secondary flex-1"
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

