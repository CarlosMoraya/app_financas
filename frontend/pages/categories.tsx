import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useAuthProtection } from '../hooks/useAuthProtection'

interface Category {
    id: number
    name: string
    type: 'income' | 'expense'
    icon: string
    color: string
    transactionCount: number
    totalAmount: number
}

export default function Categories() {
    const { session, loading: authLoading } = useAuthProtection()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

    // Form State
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'expense' as 'income' | 'expense',
        icon: '🏷️',
        color: 'bg-gray-500'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loadData = useCallback(async () => {
        const isPreview = localStorage.getItem('preview_mode') === 'true'

        if (session) {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (data) {
                const formattedData = data.map((c: any) => ({
                    ...c,
                    transactionCount: 0,
                    totalAmount: 0
                }))
                setCategories(formattedData)
            }
        } else if (isPreview) {
            setCategories([
                { id: 1, name: 'Salário', type: 'income', icon: '💼', color: 'bg-green-500', transactionCount: 2, totalAmount: 5000 },
                { id: 2, name: 'Freelance', type: 'income', icon: '💻', color: 'bg-blue-500', transactionCount: 3, totalAmount: 1200 },
                { id: 3, name: 'Alimentação', type: 'expense', icon: '🍔', color: 'bg-orange-500', transactionCount: 12, totalAmount: -850 },
                { id: 4, name: 'Transporte', type: 'expense', icon: '🚗', color: 'bg-yellow-500', transactionCount: 8, totalAmount: -320 },
            ])
        }
    }, [session, supabase])

    useEffect(() => {
        if (!authLoading) {
            loadData()
        }
    }, [authLoading, loadData])

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category)
        setNewCategory({
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color
        })
        setShowModal(true)
    }

    const handleSaveCategory = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!session || !newCategory.name) return

        setIsSubmitting(true)

        try {
            if (editingCategory) {
                // Update
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: newCategory.name,
                        type: newCategory.type,
                        icon: newCategory.icon,
                        color: newCategory.color
                    })
                    .eq('id', editingCategory.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase.from('categories').insert({
                    user_id: session.user.id,
                    name: newCategory.name,
                    type: newCategory.type,
                    icon: newCategory.icon,
                    color: newCategory.color
                })

                if (error) throw error
            }

            setNewCategory({ name: '', type: 'expense', icon: '🏷️', color: 'bg-gray-500' })
            setEditingCategory(null)
            setShowModal(false)
            loadData()

        } catch (error: any) {
            console.error('Error saving category:', error)
            alert('Erro ao salvar categoria: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) alert('Erro ao excluir: ' + error.message)
        else loadData()
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const filteredCategories = categories.filter(c => filter === 'all' || c.type === filter)

    const availableIcons = ['🏷️', '🍔', '🚗', '💡', '🎮', '⚕️', '📚', '🛍️', '✈️', '🔧', '🏠', '💰', '💳', '🎓', '🎁', '🐶']
    const availableColors = [
        { class: 'bg-gray-500', name: 'Cinza' },
        { class: 'bg-red-500', name: 'Vermelho' },
        { class: 'bg-orange-500', name: 'Laranja' },
        { class: 'bg-yellow-500', name: 'Amarelo' },
        { class: 'bg-green-500', name: 'Verde' },
        { class: 'bg-teal-500', name: 'Turquesa' },
        { class: 'bg-blue-500', name: 'Azul' },
        { class: 'bg-indigo-500', name: 'Índigo' },
        { class: 'bg-purple-500', name: 'Roxo' },
        { class: 'bg-pink-500', name: 'Rosa' },
    ]

    return (
        <Layout>
            <div className="space-y-6 fade-in">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Categorias</h2>
                        <p className="text-gray-500">Organize suas transações</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCategory(null)
                            setNewCategory({ name: '', type: 'expense', icon: '🏷️', color: 'bg-gray-500' })
                            setShowModal(true)
                        }}
                        className="btn btn-primary"
                    >
                        + Nova Categoria
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('income')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'income' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Receitas
                    </button>
                    <button
                        onClick={() => setFilter('expense')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'expense' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Despesas
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="card hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    {category.icon}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="text-gray-300 hover:text-blue-500 transition-all text-xl px-1"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-gray-300 hover:text-red-500 transition-all text-xl px-1"
                                        title="Excluir"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-bold text-gray-800">{category.name}</h3>
                                <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${category.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {category.type === 'income' ? 'Receita' : 'Despesa'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 fade-in">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                            </h2>
                            <form onSubmit={handleSaveCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ex: Alimentação"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                                            className={`flex-1 py-2 rounded-lg font-medium border ${newCategory.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                        >
                                            Receita
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                                            className={`flex-1 py-2 rounded-lg font-medium border ${newCategory.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                        >
                                            Despesa
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                                    <div className="grid grid-cols-8 gap-2">
                                        {availableIcons.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setNewCategory({ ...newCategory, icon })}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl hover:bg-gray-100 transition-colors ${newCategory.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-50'}`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map(color => (
                                            <button
                                                key={color.class}
                                                type="button"
                                                onClick={() => setNewCategory({ ...newCategory, color: color.class })}
                                                className={`w-8 h-8 rounded-full ${color.class} hover:scale-110 transition-transform ${newCategory.color === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
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
                                        {isSubmitting ? 'Salvando...' : (editingCategory ? 'Salvar Alterações' : 'Salvar Categoria')}
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
