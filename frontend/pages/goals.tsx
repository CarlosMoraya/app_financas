import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useAuthProtection } from '../hooks/useAuthProtection'

interface Goal {
    id: number
    name: string
    target_amount: number
    current_amount: number
    deadline: string | null
    icon: string
    color: string
}

export default function Goals() {
    const { session, loading: authLoading } = useAuthProtection()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const [goals, setGoals] = useState<Goal[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

    const [newGoal, setNewGoal] = useState({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
        icon: '🎯',
        color: 'bg-indigo-500'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const colors = ['bg-indigo-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500']
    const icons = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏖️', '💰']

    const loadData = useCallback(async () => {
        const isPreview = localStorage.getItem('preview_mode') === 'true'

        if (session) {
            const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false })
            if (data) {
                const formatted = data.map((g: any, i: number) => ({
                    ...g,
                    icon: g.icon || icons[i % icons.length],
                    color: g.color || colors[i % colors.length]
                }))
                setGoals(formatted)
            }
        } else if (isPreview) {
            setGoals([
                { id: 1, name: 'Viagem Europa', target_amount: 15000, current_amount: 8500, deadline: '2026-06-01', icon: '✈️', color: 'bg-blue-500' },
                { id: 2, name: 'Novo Notebook', target_amount: 5000, current_amount: 3200, deadline: '2026-03-01', icon: '💻', color: 'bg-purple-500' },
            ])
        }
    }, [session, supabase])

    useEffect(() => {
        if (!authLoading) {
            loadData()
        }
    }, [authLoading, loadData])

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal)
        setNewGoal({
            name: goal.name,
            target_amount: goal.target_amount.toString(),
            current_amount: goal.current_amount.toString(),
            deadline: goal.deadline || '',
            icon: goal.icon,
            color: goal.color
        })
        setShowModal(true)
    }

    const handleSaveGoal = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!session || !newGoal.name || !newGoal.target_amount) {
            alert('Preencha o nome e o valor da meta')
            return
        }

        setIsSubmitting(true)
        const targetVal = parseFloat(newGoal.target_amount.replace(',', '.'))
        const currentVal = parseFloat(newGoal.current_amount.replace(',', '.')) || 0

        try {
            if (editingGoal) {
                // Update
                const { error } = await supabase
                    .from('goals')
                    .update({
                        name: newGoal.name,
                        target_amount: targetVal,
                        current_amount: currentVal,
                        deadline: newGoal.deadline || null,
                        icon: newGoal.icon,
                        color: newGoal.color
                    })
                    .eq('id', editingGoal.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase.from('goals').insert({
                    user_id: session.user.id,
                    name: newGoal.name,
                    target_amount: targetVal,
                    current_amount: currentVal,
                    deadline: newGoal.deadline || null,
                    icon: newGoal.icon,
                    color: newGoal.color
                })

                if (error) throw error
            }

            setNewGoal({ name: '', target_amount: '', current_amount: '0', deadline: '', icon: '🎯', color: 'bg-indigo-500' })
            setEditingGoal(null)
            setShowModal(false)
            loadData()

        } catch (error: any) {
            console.error('Error saving goal:', error)
            alert('Erro ao salvar meta: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteGoal = async (id: number) => {
        if (!confirm('Excluir esta meta?')) return
        const { error } = await supabase.from('goals').delete().eq('id', id)
        if (error) alert('Erro: ' + error.message)
        else loadData()
    }

    const handleAddMoney = async (goal: Goal) => {
        const input = prompt(`Quanto deseja adicionar a "${goal.name}"?`, '100')
        if (!input) return
        const addAmount = parseFloat(input.replace(',', '.'))
        if (isNaN(addAmount) || addAmount <= 0) return

        const newAmount = goal.current_amount + addAmount
        const { error } = await supabase.from('goals').update({ current_amount: newAmount }).eq('id', goal.id)
        if (error) alert('Erro: ' + error.message)
        else loadData()
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0)
    const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0)

    return (
        <Layout>
            <div className="space-y-6 fade-in">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium mb-1">Total das Metas</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalTarget)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">🎯</div>
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium mb-1">Total Guardado</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalSaved)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">💰</div>
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium mb-1">Falta Guardar</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(totalTarget - totalSaved)}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">📈</div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Minhas Metas</h2>
                        <p className="text-gray-500">Acompanhe seus objetivos financeiros</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingGoal(null)
                            setNewGoal({ name: '', target_amount: '', current_amount: '0', deadline: '', icon: '🎯', color: 'bg-indigo-500' })
                            setShowModal(true)
                        }}
                        className="btn btn-primary"
                    >
                        + Nova Meta
                    </button>
                </div>

                {/* Goals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-8">Nenhuma meta criada</p>
                    ) : goals.map((goal) => {
                        const percentage = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
                        const daysRemaining = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                        return (
                            <div key={goal.id} className="card group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 ${goal.color} rounded-xl flex items-center justify-center text-3xl text-white shadow-lg`}>
                                            {goal.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{goal.name}</h3>
                                            {daysRemaining !== null && (
                                                <p className={`text-sm ${daysRemaining < 30 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo vencido'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditGoal(goal)}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition-all text-gray-400 hover:text-blue-600"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg transition-all text-gray-400 hover:text-red-600"
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-gray-800">{formatCurrency(goal.current_amount)}</span>
                                        <span className="text-gray-500">de {formatCurrency(goal.target_amount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full ${goal.color} transition-all duration-500`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-600">{percentage}% concluído</span>
                                        <button
                                            onClick={() => handleAddMoney(goal)}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            + Adicionar valor
                                        </button>
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
                                {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                            </h2>
                            <form onSubmit={handleSaveGoal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Meta *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ex: Viagem para Europa"
                                        value={newGoal.name}
                                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Valor Total *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="0.00"
                                            value={newGoal.target_amount}
                                            onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Já Guardado</label>
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="0.00"
                                            value={newGoal.current_amount}
                                            onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Prazo (opcional)</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newGoal.deadline}
                                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                                    <div className="flex flex-wrap gap-2">
                                        {icons.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setNewGoal({ ...newGoal, icon })}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl ${newGoal.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                                            >{icon}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                                    <div className="flex gap-2">
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewGoal({ ...newGoal, color: c })}
                                                className={`w-8 h-8 rounded-full ${c} ${newGoal.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1" disabled={isSubmitting}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : (editingGoal ? 'Salvar' : 'Criar Meta')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

