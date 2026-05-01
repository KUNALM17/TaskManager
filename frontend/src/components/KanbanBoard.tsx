import React from 'react';
import type { Task, TaskStatus } from '../types';
import { CalendarDays, MoreVertical, Paperclip, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onStatusChange: (taskId: number, status: TaskStatus) => void;
}

const statusColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'TODO', label: 'To Do', color: 'bg-slate-200' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-400' },
    { id: 'DONE', label: 'Done', color: 'bg-emerald-400' },
];

const priorityColors = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-emerald-500',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskClick, onStatusChange }) => {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {statusColumns.map((column) => (
                <div key={column.id} className="flex flex-col rounded-xl bg-slate-100/50 p-4 min-h-[500px]">
                    <div className="mb-4 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${column.color}`} />
                            <h3 className="font-bold text-slate-700">{column.label}</h3>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-500">
                                {tasks.filter((t) => t.status === column.id).length}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                            {tasks
                                .filter((t) => t.status === column.id)
                                .map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        onClick={() => onTaskClick(task)}
                                        className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="mb-3 flex items-start justify-between">
                                            <span className={`h-1.5 w-10 rounded-full ${priorityColors[task.priority]}`} />
                                            <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <h4 className="mb-2 font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {task.title}
                                        </h4>
                                        <p className="mb-4 text-sm text-slate-500 line-clamp-3">
                                            {task.description || 'No description provided.'}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                            <div className="flex -space-x-2">
                                                {task.assignees.map((assignee) => (
                                                    <div
                                                        key={assignee.id}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white"
                                                        title={assignee.name}
                                                    >
                                                        {assignee.name.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-3 text-slate-400">
                                                {task.checklist.length > 0 && (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <CheckSquare className="h-3.5 w-3.5" />
                                                        <span>
                                                            {task.checklist.filter((c) => c.completed).length}/{task.checklist.length}
                                                        </span>
                                                    </div>
                                                )}
                                                {task.attachments?.length > 0 && (
                                                    <Paperclip className="h-3.5 w-3.5" />
                                                )}
                                            </div>
                                        </div>

                                        {task.dueDate && (
                                            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                                <CalendarDays className="h-3 w-3" />
                                                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100">
                                            {statusColumns.map(col => (
                                                col.id !== column.id && (
                                                    <button 
                                                        key={col.id}
                                                        onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, col.id); }}
                                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${col.color} text-slate-700 hover:brightness-95 transition-all`}
                                                    >
                                                        {col.label}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
