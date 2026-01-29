import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from '@supabase/auth-helpers-react'

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const router = useRouter()
    const session = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Transações', path: '/transactions', icon: '💸' },
        { name: 'Contas', path: '/accounts', icon: '🏦' },
        { name: 'Categorias', path: '/categories', icon: '🏷️' },
        { name: 'Orçamentos', path: '/budgets', icon: '💰' },
        { name: 'Metas', path: '/goals', icon: '🎯' },
        { name: 'Relatórios', path: '/reports', icon: '📈' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('preview_mode')
        router.push('/login')
    }

    const isActive = (path: string) => router.pathname === path

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-gradient-to-b from-indigo-600 to-indigo-800 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl`}
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between border-b border-indigo-500/30">
                    {isSidebarOpen ? (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl">
                                💎
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Moraya&apos;s Finance</h1>
                                <p className="text-xs text-indigo-200">Controle Total</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl mx-auto">
                            💎
                        </div>
                    )}
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link key={item.path} href={item.path}>
                            <div
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive(item.path)
                                    ? 'bg-white text-indigo-600 shadow-lg'
                                    : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white'
                                    }`}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                {isSidebarOpen && (
                                    <span className="font-medium text-sm">{item.name}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-indigo-500/30">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full px-4 py-2 bg-indigo-700/50 hover:bg-indigo-700 rounded-lg transition-colors mb-2 text-sm font-medium"
                    >
                        {isSidebarOpen ? '◀ Recolher' : '▶'}
                    </button>
                    {isSidebarOpen && (
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500 rounded-lg transition-colors text-sm font-medium"
                        >
                            🚪 Sair
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {menuItems.find((item) => isActive(item.path))?.name || 'Dashboard'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Bem-vindo ao seu painel de controle financeiro
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {session ? (
                                <div className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                </div>
                            ) : (
                                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm border border-indigo-100">
                                    Modo Preview
                                </div>
                            )}
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                U
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
