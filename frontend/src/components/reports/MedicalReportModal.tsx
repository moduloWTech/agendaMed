import { useState, useEffect, useRef } from 'react';
import { X, Printer, FileText, Calendar, AlertCircle, User } from 'lucide-react';
import { api } from '../../services/api';

interface MedicalReportModalProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

export function MedicalReportModal({ patientId, patientName, onClose }: MedicalReportModalProps) {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const reportRef = useRef<HTMLDivElement>(null);

  // Calcula datas padrão ao alterar o período rápido
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - periodDays);

    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
  }, [periodDays]);

  // Carrega os dados do relatório do backend
  const fetchReportData = async () => {
    if (!patientId || !startDate || !endDate) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/patients/${patientId}/report-data?startDate=${startDate}&endDate=${endDate}`);
      setReportData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao carregar dados do relatório.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, patientId]);

  // Dispara caixa de diálogo de impressão/salvar em PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:static print:bg-white">
      
      {/* Container Principal do Modal (Ocultado ao imprimir) */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none border border-gray-100 dark:border-slate-800">
        
        {/* Cabeçalho da Janela (Escondido no Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-primary)] text-white print:hidden">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">Relatório Médico de Adesão</h2>
              <p className="text-xs text-white/80">Gerado para {patientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filtros de Período e Ações (Escondido no Print) */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Período:
            </span>
            {[7, 15, 30, 60].map((days) => (
              <button
                key={days}
                onClick={() => setPeriodDays(days)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  periodDays === days
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-100'
                }`}
              >
                {days} dias
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white font-medium text-sm rounded-xl shadow-md hover:bg-[var(--color-accent)] active:scale-95 transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        {/* Área do Relatório (Conteúdo Impresso) */}
        <div className="flex-1 p-8 overflow-y-auto print:overflow-visible print:p-0" ref={reportRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Gerando relatório de saúde...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : reportData ? (
            <div className="max-w-3xl mx-auto bg-white text-gray-900 print:text-black">
              
              {/* Cabeçalho do Documento Médico */}
              <div className="flex items-center justify-between border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-[var(--color-primary)] tracking-tight print:text-black">AgendaMed</h1>
                  <p className="text-xs text-gray-500 font-medium">Relatório de Adesão à Medicação & Histórico Clínico</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Data de Emissão</span>
                  <span className="text-sm font-bold text-gray-800 print:text-black">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Ficha do Paciente */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6 print:border-gray-300">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Paciente</span>
                  <span className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[var(--color-primary)] print:text-black" /> {reportData.patient.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Período Analisado</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {new Date(reportData.period.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(reportData.period.endDate + 'T00:00:00').toLocaleDateString('pt-BR')} ({reportData.period.daysCount} dias)
                  </span>
                </div>
              </div>

              {/* Cards de Métricas de Adesão */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Métricas de Adesão ao Tratamento</h3>
                <div className="grid grid-cols-3 gap-4">
                  
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-center">
                    <span className="text-xs font-bold text-teal-800 uppercase block">Adesão Geral</span>
                    <span className="text-3xl font-extrabold text-teal-700">{reportData.metrics.adherencePercentage}%</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                    <span className="text-xs font-bold text-blue-800 uppercase block">Doses Programadas</span>
                    <span className="text-3xl font-extrabold text-blue-700">{reportData.metrics.totalScheduledDoses}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-center">
                    <span className="text-xs font-bold text-green-800 uppercase block">Doses Confirmadas</span>
                    <span className="text-3xl font-extrabold text-green-700">{reportData.metrics.takenDoses}</span>
                  </div>

                </div>
              </div>

              {/* Lista de Medicamentos Ativos */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Medicamentos Cadastrados</h3>
                {reportData.medications.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Nenhum medicamento ativo cadastrado.</p>
                ) : (
                  <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                          <th className="p-3">Medicamento</th>
                          <th className="p-3">Dosagem</th>
                          <th className="p-3">Frequência</th>
                          <th className="p-3">Horários</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportData.medications.map((med: any) => (
                          <tr key={med.id}>
                            <td className="p-3 font-bold text-gray-800">{med.name}</td>
                            <td className="p-3 text-gray-600">{med.dosage}</td>
                            <td className="p-3 text-gray-600">{med.frequency}</td>
                            <td className="p-3 font-semibold text-gray-700">{med.times?.join(', ') || '-'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${med.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {med.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Histórico Diário de Check-ins */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Registro de Tomadas no Período</h3>
                {reportData.historyLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Nenhum registro de tomada encontrado no período selecionado.</p>
                ) : (
                  <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                          <th className="p-3">Data</th>
                          <th className="p-3">Hora</th>
                          <th className="p-3">Medicamento</th>
                          <th className="p-3">Dosagem</th>
                          <th className="p-3">Registrado por</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportData.historyLogs.slice(0, 30).map((log: any) => (
                          <tr key={log.id}>
                            <td className="p-3 font-medium text-gray-700">
                              {new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-3 font-bold text-gray-800">{log.time}</td>
                            <td className="p-3 font-semibold text-[var(--color-primary)] print:text-black">{log.medicationName}</td>
                            <td className="p-3 text-gray-600">{log.dosage}</td>
                            <td className="p-3 text-gray-500">{log.registeredBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Campo para Anotações Médicas */}
              <div className="border-t-2 border-gray-200 pt-6 mt-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Anotações e Prescrição Médica (Uso Exclusivo do Médico):</h4>
                <div className="h-24 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-3 text-xs text-gray-400">
                  Espaço reservado para carimbo, assinatura ou observações adicionais na consulta.
                </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
