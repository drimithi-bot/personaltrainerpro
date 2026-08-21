import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Plus, Users, Eye, Edit2, Activity, AlertCircle, Trash2 } from 'lucide-react';
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
  const [schedules, setSchedules] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);


  const handleDelete = async (student: any) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${student.name}? Esta ação não pode ser desfeita e excluirá todos os treinos e agendamentos vinculados.`)) {
      try {
        const { auth } = await import('../lib/firebase.ts');
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/students/${student.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          fetchStudents();
        } else {
          const data = await res.json();
          alert('API Error: ' + JSON.stringify(data));
        }
      } catch (error) {
        console.error(error);
        alert('Network/Parse Error: ' + error.message);
      }
    }
  };

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
        
        const resSchedules = await fetch('/api/schedules', { headers: { Authorization: `Bearer ${token}` } });
        let schedData = [];
        if (resSchedules.ok) {
          schedData = await resSchedules.json();
          setSchedules(schedData);
        }
        
        setStudents(data.map((student: any) => ({ ...student, schedules: schedData.filter((s: any) => s.studentId === student.id) })));
      }
      const resPlans = await fetch('/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resPlans.ok) {
        const plansData = await resPlans.json();
        if (plansData.length > 0) setPlans(plansData);
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
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-slate-800 dark:border-blue-500/50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alunos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie seus alunos e matrículas</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Aluno</span>
        </button>
      </div>
      
      <div className="flex-1 p-5 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Users className="w-16 h-16 text-slate-200 dark:text-slate-700" />
            <p className="text-center">Nenhum aluno cadastrado.<br/>Adicione seu primeiro aluno.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-semibold">Aluno</th>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Plano</th>
                  <th className="p-4 font-semibold">Assiduidade</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map(student => {
                  const isOverdue = student.paymentDueDate && student.paymentDueDate < new Date().toISOString().split('T')[0];
                  
                  let badgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                  let badgeText = "N/A";
                  if (student.attendanceRate !== null && student.attendanceRate !== undefined) {
                    if (student.attendanceRate >= 80) {
                      badgeClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
                      badgeText = `Alta (${student.attendanceRate}%)`;
                    } else if (student.attendanceRate >= 50) {
                      badgeClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
                      badgeText = `Média (${student.attendanceRate}%)`;
                    } else {
                      badgeClass = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
                      badgeText = `Baixa (${student.attendanceRate}%)`;
                    }
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Atrasado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                        {student.email}
                      </td>
                      <td className="p-4">
                        {student.planId ? (
                          <span className="inline-block text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg whitespace-nowrap">
                            {plans.find(p => p.id === student.planId)?.frequency || 'Personalizado'}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-block text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap ${badgeClass}`}>
                            {badgeText}
                          </span>
                          {student.totalSessions > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                              {student.totalSessions} {student.totalSessions === 1 ? 'sessão' : 'sessões'} total
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleDelete(student)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Excluir aluno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingStudent(student)}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Editar aluno"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {onViewWorkouts && (
                            <button 
                              onClick={() => onViewWorkouts(student)}
                              className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                              title="Ver treinos do aluno"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                          )}
                          {onPreviewStudent && (
                            <button 
                              onClick={() => onPreviewStudent(student)}
                              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title="Ver painel do aluno"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchStudents}
      />
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          isOpen={true}
          onClose={() => setEditingStudent(null)}
          onSuccess={fetchStudents}
        />
      )}
    </div>
  );
}
