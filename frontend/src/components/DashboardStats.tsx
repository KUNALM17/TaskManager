import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Task } from '../types';

interface DashboardStatsProps {
    tasks: Task[];
    isAdmin: boolean;
}

const COLORS = ['#94a3b8', '#60a5fa', '#34d399']; // To Do, In Progress, Done

const DashboardStats: React.FC<DashboardStatsProps> = ({ tasks, isAdmin }) => {
    const data = [
        { name: 'To Do', value: tasks.filter((t) => t.status === 'TODO').length },
        { name: 'In Progress', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
        { name: 'Done', value: tasks.filter((t) => t.status === 'DONE').length },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">{isAdmin ? 'Company Progress' : 'My Progress'}</h2>
                <p className="mt-2 text-slate-600">Visual summary of task statuses across the board.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-800">Status Distribution</h3>
                    <div className="h-64 w-full">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                No tasks to display
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
                    <StatBox label="Total Tasks" value={tasks.length} color="bg-slate-100" textColor="text-slate-700" />
                    <StatBox label="Active Work" value={tasks.filter(t => t.status === 'IN_PROGRESS').length} color="bg-blue-50" textColor="text-blue-700" />
                    <StatBox label="Completed" value={tasks.filter(t => t.status === 'DONE').length} color="bg-emerald-50" textColor="text-emerald-700" />
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color, textColor }: { label: string; value: number; color: string; textColor: string }) => (
    <div className={`rounded-2xl p-6 ${color} border border-transparent hover:border-slate-200 transition-all shadow-sm`}>
        <p className={`text-sm font-bold uppercase tracking-wider ${textColor} opacity-70`}>{label}</p>
        <p className={`mt-4 text-4xl font-black ${textColor}`}>{value}</p>
    </div>
);

export default DashboardStats;
