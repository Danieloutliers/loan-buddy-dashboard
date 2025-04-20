
import React, { useRef, useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/sonner';

const Reports = () => {
  const { loans, payments, borrowers, calculateLoanMetrics, importLoansData } = useLoanContext();
  const metrics = calculateLoanMetrics();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: UIToast } = useToast();
  const [importError, setImportError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const exportToCSV = () => {
    // Preparar dados detalhados dos empréstimos
    const loanData = loans.map(loan => {
      const borrower = borrowers.find(b => b.id === loan.borrowerId);
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      
      return {
        'ID do Empréstimo': loan.id,
        'ID do Mutuário': loan.borrowerId,
        'Nome do Mutuário': loan.borrowerName,
        'Email do Mutuário': borrower?.email || '',
        'Telefone do Mutuário': borrower?.phone || '',
        'Valor Principal': loan.principal,
        'Taxa de Juros': `${loan.interestRate}`,
        'Data de Emissão': loan.issueDate,
        'Data de Vencimento': loan.dueDate,
        'Status': loan.status,
        'Frequência de Pagamento': loan.paymentSchedule?.frequency || '',
        'Número de Parcelas': loan.paymentSchedule?.installments || '',
        'Valor da Parcela': loan.paymentSchedule?.installmentAmount || '',
        'Próxima Data de Pagamento': loan.paymentSchedule?.nextPaymentDate || '',
        'Notas': loan.notes || '',
        'Número de Pagamentos': loanPayments.length,
      };
    });

    // Converter para CSV
    const headers = Object.keys(loanData[0] || {}).join(',');
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
    
    toast({
      title: "Exportação concluída",
      description: `${loanData.length} empréstimos exportados com sucesso.`,
    });
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        
        // Verificar se o arquivo CSV tem o formato esperado
        const requiredFields = ['ID do Empréstimo', 'ID do Mutuário', 'Nome do Mutuário', 'Valor Principal', 'Taxa de Juros'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          setImportError(`O arquivo não contém os campos obrigatórios: ${missingFields.join(', ')}`);
          return;
        }
        
        // Processar os dados
        const loansData = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const loanData: any = {};
          
          headers.forEach((header, index) => {
            loanData[header] = values[index];
          });
          
          loansData.push(loanData);
        }
        
        const result = importLoansData(loansData);
        if (result.success) {
          UIToast({
            title: "Importação concluída",
            description: `${result.imported} empréstimos importados com sucesso.`,
          });
        } else {
          setImportError(result.message || "Erro ao importar dados");
        }
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        setImportError("Erro ao processar o arquivo. Verifique o formato e tente novamente.");
      }
      
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.onerror = () => {
      setImportError("Erro ao ler o arquivo.");
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-gray-500">Visualize e exporte dados dos empréstimos</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleFileUpload}
            variant="outline"
            className="flex items-center"
          >
            <Upload className="mr-2 h-5 w-5" />
            Importar CSV
          </Button>
          
          <Button
            onClick={exportToCSV}
            className="bg-primary hover:bg-primary/90 text-white flex items-center"
          >
            <Download className="mr-2 h-5 w-5" />
            Exportar CSV
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
        </div>
      </div>

      {importError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Erro na importação</h3>
            <p className="text-sm">{importError}</p>
          </div>
        </div>
      )}

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
