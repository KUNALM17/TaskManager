import { useEffect, useState } from 'react';
import { userService } from '../api/services';
import type { UserSummary } from '../types';
import { Loader2, Shield, Trash2 } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (err: any) {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleUpgrade = async (userId: string) => {
        try {
            await userService.updateRole(userId, 'admin');
            loadUsers();
        } catch (err: any) {
            setError('Failed to upgrade user.');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await userService.delete(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err: any) {
            setError('Failed to delete user.');
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Manage Team</h2>
                <p className="mt-2 text-slate-600">Upgrade members to admin or remove them from the system.</p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">User</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">Role</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{user.name}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        user.role === 'ROLE_ADMIN' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.role !== 'ROLE_ADMIN' && (
                                            <button 
                                                onClick={() => handleUpgrade(user.id)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                title="Make Admin"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Upgrade
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(user.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                            title="Delete User"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
