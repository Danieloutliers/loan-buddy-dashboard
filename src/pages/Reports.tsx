
import React from 'react';
import { useLoanContext } from '../context/LoanContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download } from 'lucide-react';

const Reports = () => {
  const { loans, payments, calculateLoanMetrics } = useLoanContext();
  const metrics = calculateLoanMetrics();

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const exportToCSV = () => {
    // Preparar dados dos empréstimos
    const loanData = loans.map(loan => ({
      'ID do Empréstimo': loan.id,
      'Nome do Mutuário': loan.borrowerName,
      'Valor Principal': loan.principal,
      'Taxa de Juros': `${loan.interestRate}%`,
      'Data de Emissão': format(parseISO(loan.issueDate), 'dd/MM/yyyy'),
      'Data de Vencimento': format(parseISO(loan.dueDate), 'dd/MM/yyyy'),
      'Status': loan.status
    }));

    // Converter para CSV
    const headers = Object.keys(loanData[0]).join(',');
    const rows = loanData.map(obj => Object.values(obj).join(','));
    const csv = [headers, ...rows].join('\n');

    // Download do arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_emprestimos_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-gray-500">Visualize e exporte dados dos empréstimos</p>
        </div>
        
        <button
          onClick={exportToCSV}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Download className="mr-2 h-5 w-5" />
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Resumo Geral</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Empréstimos Ativos:</span>
              <span className="font-medium">{loans.filter(l => l.status === 'active').length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Principal Total Emprestado:</span>
              <span className="font-medium">{formatCurrency(metrics.totalPrincipalOutstanding)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Juros Acumulados:</span>
              <span className="font-medium">{formatCurrency(metrics.totalInterestAccrued)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total em Atraso:</span>
              <span className="font-medium text-red-600">{formatCurrency(metrics.totalOverdue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Métricas Mensais</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Entrada de Caixa (Mês Atual):</span>
              <span className="font-medium">{formatCurrency(metrics.monthlyIncome)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Pagamentos:</span>
              <span className="font-medium">{payments.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Histórico de Empréstimos</h2>
        </div>
        
        <div className="p-6">
          {loans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Nenhum empréstimo registrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mutuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Emissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loan.borrowerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(loan.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(parseISO(loan.issueDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${loan.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          ${loan.status === 'paid' ? 'bg-blue-100 text-blue-800' : ''}
                          ${loan.status === 'overdue' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${loan.status === 'defaulted' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {loan.status === 'active' && 'Ativo'}
                          {loan.status === 'paid' && 'Pago'}
                          {loan.status === 'overdue' && 'Vencido'}
                          {loan.status === 'defaulted' && 'Inadimplente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
