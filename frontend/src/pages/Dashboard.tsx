import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import {
    AlertCircle,
    CheckSquare,
    ClipboardList,
    LayoutDashboard,
    Loader2,
    LogOut,
    Plus,
    Trash2,
    X,
    Layout,
    Download,
    ShieldCheck,
    ExternalLink,
    Paperclip
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskService, userService } from '../api/services';
import type { ChecklistItem, Task, TaskRequest, UserSummary, Attachment } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import DashboardStats from '../components/DashboardStats';
import AdminPanel from './AdminPanel';

type View = 'dashboard' | 'board' | 'manage' | 'create' | 'team' | 'admin';
type Priority = Task['priority'];
type Status = Task['status'];

const emptyTaskForm = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as Priority,
    assigneeIds: [] as string[],
    checklist: [] as ChecklistItem[],
    attachments: [] as Attachment[],
};

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskForm, setTaskForm] = useState(emptyTaskForm);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });

    const visibleTasks = useMemo(() => {
        return isAdmin ? tasks : tasks.filter((task) => 
            task.assignees.some((assignee) => assignee.id === user?.id) || 
            (task.project.owner.id === user?.id) // Fallback for own tasks
        );
    }, [isAdmin, tasks, user?.id]);

    const loadWorkspace = async () => {
        setLoading(true);
        setError('');
        try {
            const [taskData, userData] = await Promise.all([
                taskService.getAll(),
                userService.getAll(),
            ]);
            setTasks(taskData);
            setUsers(userData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Could not load task workspace.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkspace();
    }, []);

    const startCreate = () => {
        setEditingTask(null);
        setTaskForm(emptyTaskForm);
        setNewChecklistItem('');
        setNewAttachment({ name: '', url: '' });
        setActiveView('create');
    };

    const startEdit = (task: Task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
            priority: task.priority,
            assigneeIds: task.assignees.map((assignee) => assignee.id),
            checklist: task.checklist.map((item) => ({ ...item })),
            attachments: task.attachments ? task.attachments.map(a => ({ ...a })) : [],
        });
        setNewChecklistItem('');
        setNewAttachment({ name: '', url: '' });
        setActiveView('create');
    };

    const saveTask = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!taskForm.title.trim()) return;

        setSaving(true);
        setError('');

        const payload: TaskRequest = {
            title: taskForm.title.trim(),
            description: taskForm.description.trim(),
            dueDate: taskForm.dueDate,
            priority: taskForm.priority,
            projectId: editingTask?.project.id,
            assigneeIds: taskForm.assigneeIds,
            checklist: taskForm.checklist.filter((item) => item.title.trim()),
            attachments: taskForm.attachments.filter(a => a.url.trim()),
        };

        try {
            const savedTask = editingTask
                ? await taskService.update(editingTask.id, payload)
                : await taskService.createStandalone(payload);

            setTasks((current) => {
                if (!editingTask) return [savedTask, ...current];
                return current.map((task) => (task.id === savedTask.id ? savedTask : task));
            });
            setActiveView('board');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Could not save task.');
        } finally {
            setSaving(false);
        }
    };

    const deleteTask = async (taskId: number) => {
        if (!confirm('Delete this task?')) return;
        setSaving(true);
        try {
            await taskService.delete(taskId);
            setTasks((current) => current.filter((task) => task.id !== taskId));
            if (editingTask?.id === taskId) {
                setEditingTask(null);
                setTaskForm(emptyTaskForm);
            }
        } catch (err: any) {
            setError('Could not delete task.');
        } finally {
            setSaving(false);
        }
    };

    const updateTaskStatus = async (taskId: number, status: Status) => {
        try {
            const updatedTask = await taskService.updateStatus(taskId, status);
            setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
        } catch (err: any) {
            setError('Could not update status.');
        }
    };



    const handleExport = async () => {
        try {
            await taskService.exportCsv();
        } catch (err) {
            setError('Failed to export report.');
        }
    };

    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        setTaskForm(prev => ({
            ...prev,
            checklist: [...prev.checklist, { title: newChecklistItem.trim(), completed: false }]
        }));
        setNewChecklistItem('');
    };

    const addAttachment = () => {
        if (!newAttachment.url.trim()) return;
        setTaskForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, { id: Date.now(), name: newAttachment.name || 'Link', url: newAttachment.url }]
        }));
        setNewAttachment({ name: '', url: '' });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-6 lg:block">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                            <Layout className="h-6 w-6" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight">TASKFLOW</h1>
                    </div>

                    <nav className="space-y-1">
                        <SidebarButton active={activeView === 'dashboard'} icon={<LayoutDashboard />} label="Dashboard" onClick={() => setActiveView('dashboard')} />
                        <SidebarButton active={activeView === 'board'} icon={<Layout />} label="Board" onClick={() => setActiveView('board')} />
                        <SidebarButton active={activeView === 'manage'} icon={<ClipboardList />} label="List View" onClick={() => setActiveView('manage')} />
                        {isAdmin && <SidebarButton active={activeView === 'admin'} icon={<ShieldCheck />} label="Manage Team" onClick={() => setActiveView('admin')} />}
                    </nav>

                    <div className="mt-10 pt-10 border-t border-slate-100">
                        <div className="flex items-center gap-3 px-4 py-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white uppercase">
                                {user?.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">{user?.name}</p>
                                <p className="truncate text-xs text-slate-500">{isAdmin ? 'Administrator' : 'Team Member'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto">
                    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 py-4 sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={startCreate}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="h-4 w-4" /> New Task
                            </button>
                            <button 
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                            >
                                <Download className="h-4 w-4" /> Report
                            </button>
                        </div>
                    </header>

                    <div className="mx-auto max-w-7xl px-8 py-8">
                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                                <AlertCircle className="h-5 w-5" /> {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex h-96 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {activeView === 'dashboard' && <DashboardStats tasks={visibleTasks} isAdmin={isAdmin} />}
                                {activeView === 'board' && <KanbanBoard tasks={visibleTasks} onTaskClick={startEdit} onStatusChange={updateTaskStatus} />}
                                {activeView === 'manage' && <ManageTasks tasks={visibleTasks} onEdit={startEdit} onDelete={deleteTask} />}
                                {activeView === 'admin' && <AdminPanel />}
                                {activeView === 'create' && (
                                    <TaskEditor 
                                        editingTask={editingTask}
                                        taskForm={taskForm}
                                        setTaskForm={setTaskForm}
                                        users={users}
                                        saving={saving}
                                        newChecklistItem={newChecklistItem}
                                        setNewChecklistItem={setNewChecklistItem}
                                        newAttachment={newAttachment}
                                        setNewAttachment={setNewAttachment}
                                        onAddChecklist={addChecklistItem}
                                        onAddAttachment={addAttachment}
                                        onSubmit={saveTask}
                                        onCancel={() => setActiveView('board')}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const SidebarButton = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
            active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ManageTasks = ({ tasks, onEdit, onDelete }: { tasks: Task[]; onEdit: (t: Task) => void; onDelete: (id: number) => void }) => (
    <div className="space-y-4">
        {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${task.status === 'DONE' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    <div>
                        <h4 className="font-bold text-slate-900">{task.title}</h4>
                        <p className="text-xs text-slate-500">Created on {new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(task)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600"><ClipboardList className="h-5 w-5" /></button>
                    <button onClick={() => onDelete(task.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                </div>
            </div>
        ))}
    </div>
);

const TaskEditor = ({ editingTask, taskForm, setTaskForm, users, saving, newChecklistItem, setNewChecklistItem, newAttachment, setNewAttachment, onAddChecklist, onAddAttachment, onSubmit, onCancel }: any) => (
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button disabled={saving} className="rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all">
                    {saving ? 'Saving...' : 'Save Task'}
                </button>
            </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Task Information</label>
                    <input 
                        value={taskForm.title}
                        onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                        className="mt-4 w-full text-xl font-bold outline-none placeholder:text-slate-200"
                        placeholder="Task Title..."
                        required
                    />
                    <textarea 
                        value={taskForm.description}
                        onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                        className="mt-4 w-full h-32 resize-none text-slate-600 outline-none placeholder:text-slate-200"
                        placeholder="Add a detailed description..."
                    />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Sub-Checklist</label>
                    <div className="mt-4 space-y-2">
                        {taskForm.checklist.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                                <CheckSquare className="h-4 w-4 text-slate-400" />
                                <span className="flex-1 text-sm font-semibold">{item.title}</span>
                                <button type="button" onClick={() => setTaskForm({...taskForm, checklist: taskForm.checklist.filter((_:any, i:any) => i !== idx)})} className="text-red-400 hover:text-red-600"><X className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <div className="flex gap-2 mt-4">
                            <input 
                                value={newChecklistItem}
                                onChange={e => setNewChecklistItem(e.target.value)}
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500"
                                placeholder="New checklist item..."
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), onAddChecklist())}
                            />
                            <button type="button" onClick={onAddChecklist} className="rounded-xl bg-slate-900 p-2 text-white"><Plus className="h-5 w-5"/></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Settings</label>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-600">Priority</span>
                            <select 
                                value={taskForm.priority}
                                onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                                className="rounded-lg border-none bg-slate-100 px-3 py-1 text-sm font-bold outline-none"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-600">Due Date</span>
                            <input 
                                type="date"
                                value={taskForm.dueDate}
                                onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                                className="rounded-lg border-none bg-slate-100 px-3 py-1 text-sm font-bold outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Assign To (Asking for Help)</label>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {users.map((u: any) => {
                            const isSelected = taskForm.assigneeIds.includes(u.id);
                            return (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => setTaskForm({
                                        ...taskForm,
                                        assigneeIds: isSelected 
                                            ? taskForm.assigneeIds.filter((id: any) => id !== u.id)
                                            : [...taskForm.assigneeIds, u.id]
                                    })}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                                        isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                    }`}
                                >
                                    {u.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Attachments</label>
                    <div className="mt-4 space-y-2">
                        {taskForm.attachments.map((a: any, idx: number) => (
                            <a 
                                key={idx} 
                                href={a.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
                            >
                                <ExternalLink className="h-3 w-3" /> {a.name}
                            </a>
                        ))}
                        <div className="grid gap-2 mt-4">
                            <input 
                                value={newAttachment.name}
                                onChange={e => setNewAttachment({...newAttachment, name: e.target.value})}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
                                placeholder="Link Name (e.g. Doc)"
                            />
                            <div className="flex gap-2">
                                <input 
                                    value={newAttachment.url}
                                    onChange={e => setNewAttachment({...newAttachment, url: e.target.value})}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
                                    placeholder="URL (e.g. google.com)"
                                />
                                <button type="button" onClick={onAddAttachment} className="rounded-xl bg-blue-600 p-2 text-white"><Paperclip className="h-5 w-5"/></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
);

export default Dashboard;
