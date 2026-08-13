import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Plus, Users, Eye, Edit2, Activity } from 'lucide-react';
import { AddStudentModal } from './AddStudentModal.tsx';
import { EditStudentModal } from './EditStudentModal.tsx';
import { DEFAULT_PLANS } from '../lib/constants.ts';

interface StudentsViewProps {
  onPreviewStudent?: (student: any) => void;
  onViewWorkouts?: (student: any) => void;
}

export function StudentsView({ onPreviewStudent, onViewWorkouts }: StudentsViewProps = {}) {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const fetchStudents = async () => {
    try {
      if (!user) return;
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden transition-colors">
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 dark:border-blue-500/50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alunos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie seus alunos e matrículas</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Aluno
        </button>
      </div>
      
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Users className="w-16 h-16 text-slate-200 dark:text-slate-700" />
            <p className="text-center">Nenhum aluno cadastrado.<br/>Adicione seu primeiro aluno.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(student => (
              <div key={student.id} className="border border-slate-200 dark:border-slate-700 p-5 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all bg-slate-50 dark:bg-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-lg shrink-0">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-slate-900 dark:text-white dark:text-slate-100 truncate">{student.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{student.email}</p>
                  {student.planId && (
                    <span className="inline-block mt-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {DEFAULT_PLANS.find(p => p.id === student.planId)?.frequency || 'Plano Personalizado'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <button 
                    onClick={() => setEditingStudent(student)}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Editar aluno"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {onViewWorkouts && (
                    <button 
                      onClick={() => onViewWorkouts(student)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                      title="Ver treinos do aluno"
                    >
                      <Activity className="w-5 h-5" />
                    </button>
                  )}
                  {onPreviewStudent && (
                    <button 
                      onClick={() => onPreviewStudent(student)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Ver painel do aluno"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchStudents}
      />

      <EditStudentModal 
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={fetchStudents}
        student={editingStudent}
      />
    </div>
  );
}
