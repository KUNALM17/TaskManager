
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Briefcase, CheckSquare, Users } from 'lucide-react';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">TaskFlow</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <a href="#" className="flex items-center px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
                        <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                    </a>
                    <a href="#" className="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                        <Briefcase className="w-5 h-5 mr-3" /> Projects
                    </a>
                    <a href="#" className="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                        <CheckSquare className="w-5 h-5 mr-3" /> Tasks
                    </a>
                    {isAdmin && (
                        <a href="#" className="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                            <Users className="w-5 h-5 mr-3" /> Team Management <span className="ml-auto bg-indigo-100 text-indigo-700 py-1 px-2 rounded-md text-xs font-bold">Admin</span>
                        </a>
                    )}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 flex flex-col">
                                <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
                                <span className="text-xs text-slate-500">{isAdmin ? 'Administrator' : 'Member'}</span>
                            </div>
                        </div>
                        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content (Placeholder for next steps) */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header placeholder */}
                <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">TaskFlow</span>
                    <button onClick={logout} className="p-2 text-slate-600">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}! 👋</h1>
                            <p className="mt-2 text-slate-600">Here's what's happening with your projects today.</p>
                        </div>

                        {/* Stubs for stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-medium text-slate-500">Total Projects</h3>
                                <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full blur-xl opacity-50"></div>
                                <h3 className="text-sm font-medium text-slate-500">Tasks In Progress</h3>
                                <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm bg-emerald-50/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200 rounded-bl-full blur-2xl opacity-60"></div>
                                <h3 className="text-sm font-medium text-emerald-800">Tasks Completed</h3>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">--</p>
                            </div>
                        </div>
                        
                        {/* More Dashboard UI comes in the NEXT step */}
                        <div className="bg-white rounded-2xl border border-slate-200 h-96 flex items-center justify-center border-dashed">
                             <p className="text-slate-400 font-medium">Dashboard features are under construction</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;