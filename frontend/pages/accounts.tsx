import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useAuthProtection } from '../hooks/useAuthProtection'

interface Account {
    id: number
    name: string
    type: string
    balance: number
    currency: string
    icon: string
    initial_balance?: number
    current_balance?: number
}

export default function Accounts() {
    const { session, loading: authLoading } = useAuthProtection()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [newAccount, setNewAccount] = useState({
        name: '',
        type: 'checking',
        balance: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loadData = useCallback(async () => {
        const isPreview = localStorage.getItem('preview_mode') === 'true'

        if (session) {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('name')

            if (data) {
                const getIconForType = (type: string) => {
                    switch (type) {
                        case 'checking': return '💳'
                        case 'savings': return '💰'
                        case 'investment': return '📈'
                        case 'cash': return '💵'
                        case 'credit': return '💳'
                        default: return '🏦'
                    }
                }

                const accountsWithIcons = data.map((acc: any) => ({
                    ...acc,
                    icon: getIconForType(acc.type),
                    current_balance: acc.current_balance || acc.balance,
                    initial_balance: acc.initial_balance || acc.balance,
                    balance: acc.current_balance || acc.balance
                }))
                setAccounts(accountsWithIcons)
            }
        } else if (isPreview) {
            setAccounts([
                { id: 1, name: 'Banco Digital', type: 'checking', balance: 2500.00, currency: 'BRL', icon: '💳' },
                { id: 2, name: 'Carteira', type: 'cash', balance: 150.00, currency: 'BRL', icon: '💵' },
                { id: 3, name: 'Poupança', type: 'savings', balance: 10000.00, currency: 'BRL', icon: '💰' },
                { id: 4, name: 'Investimentos', type: 'investment', balance: 45000.00, currency: 'BRL', icon: '📈' },
            ])
        }
    }, [session, supabase])

    useEffect(() => {
        if (!authLoading) {
            loadData()
        }
    }, [authLoading, loadData])

    const handleEditAccount = (account: Account) => {
        setEditingAccount(account)
        setNewAccount({
            name: account.name,
            type: account.type,
            balance: account.balance.toString()
        })
        setShowModal(true)
    }

    const handleSaveAccount = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!session || !newAccount.name || !newAccount.balance) return

        setIsSubmitting(true)
        const balanceVal = parseFloat(newAccount.balance.replace(',', '.'))

        try {
            if (editingAccount) {
                // Update existing account
                // Note: Changing balance here updates current_balance directly (manual adjustment)
                const { error } = await supabase
                    .from('accounts')
                    .update({
                        name: newAccount.name,
                        type: newAccount.type,
                        current_balance: balanceVal // Allow manual balance adjustment
                    })
                    .eq('id', editingAccount.id)

                if (error) throw error
            } else {
                // Create new account
                const { error } = await supabase.from('accounts').insert({
                    user_id: session.user.id,
                    name: newAccount.name,
                    type: newAccount.type,
                    initial_balance: balanceVal,
                    current_balance: balanceVal,
                    currency: 'BRL'
                })

                if (error) throw error
            }

            setNewAccount({ name: '', type: 'checking', balance: '' })
            setEditingAccount(null)
            setShowModal(false)
            loadData()

        } catch (error: any) {
            console.error('Error saving account:', error)
            alert(`Erro: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAccount = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta conta? Transações associadas serão excluídas.')) return
        const { error } = await supabase.from('accounts').delete().eq('id', id)
        if (error) alert('Erro ao excluir: ' + error.message)
        else loadData()
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)

    return (
        <Layout>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Minhas Contas</h2>
                        <p className="text-gray-500">Gerencie seus saldos e cartões</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAccount(null)
                            setNewAccount({ name: '', type: 'checking', balance: '' })
                            setShowModal(true)
                        }}
                        className="btn btn-primary shadow-lg hover:shadow-xl transition-all"
                    >
                        + Nova Conta
                    </button>
                </div>

                {/* Total Balance Card */}
                <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <h3 className="text-white/80 font-medium mb-2">Saldo Total Consolidado</h3>
                    <div className="text-4xl font-bold">{formatCurrency(totalBalance)}</div>
                </div>

                {/* Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                        <div key={account.id} className="card hover:shadow-lg transition-shadow border border-gray-100 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                                        {account.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{account.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{account.type}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditAccount(account)}
                                        className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAccount(account.id)}
                                        className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                        title="Excluir"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Saldo Atual</p>
                                <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                    {formatCurrency(account.balance)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 fade-in">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
                            </h2>
                            <form onSubmit={handleSaveAccount} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Conta</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ex: Nubank, Carteira..."
                                        value={newAccount.name}
                                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                                    <select
                                        className="input"
                                        value={newAccount.type}
                                        onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                                    >
                                        <option value="checking">Conta Corrente</option>
                                        <option value="savings">Poupança</option>
                                        <option value="credit">Cartão de Crédito</option>
                                        <option value="investment">Investimento</option>
                                        <option value="cash">Dinheiro Físico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {editingAccount ? 'Saldo Atual (Ajuste Manual)' : 'Saldo Inicial'}
                                    </label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="0.00"
                                        value={newAccount.balance}
                                        onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                                        step="0.01"
                                        required
                                    />
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
                                        {isSubmitting ? 'Salvando...' : (editingAccount ? 'Salvar Alterações' : 'Criar Conta')}
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
