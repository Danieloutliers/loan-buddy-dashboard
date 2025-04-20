import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoanContext } from '../context/LoanContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Plus, ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { Payment } from '../types';
import { calculatePaymentDistribution, calculateRemainingBalance, determineNewLoanStatus } from '../utils/loanCalculations';

const LoanStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
    paid: { label: 'Pago', className: 'bg-blue-100 text-blue-800' },
    overdue: { label: 'Vencido', className: 'bg-yellow-100 text-yellow-800' },
    defaulted: { label: 'Inadimplente', className: 'bg-red-100 text-red-800' }
  } as any;
  
  const config = statusConfig[status] || statusConfig.active;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

const LoanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getLoanById, 
    getPaymentsByLoanId, 
    addPayment, 
    deletePayment,
    updateLoan 
  } = useLoanContext();
  
  const loan = id ? getLoanById(id) : null;
  const payments = id ? getPaymentsByLoanId(id) : [];
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Empréstimo não encontrado</h2>
        <p className="mt-2 text-gray-600">O empréstimo que você está procurando não existe ou foi removido.</p>
        <button
          onClick={() => navigate('/loans')}
          className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Voltar para a Lista de Empréstimos
        </button>
      </div>
    );
  }
  
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  const remainingBalance = calculateRemainingBalance(loan, payments);
  
  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const amount = parseFloat(paymentForm.amount);
      
      if (isNaN(amount) || amount <= 0) {
        alert('Por favor, insira um valor válido para o pagamento.');
        return;
      }
      
      const distribution = calculatePaymentDistribution(loan, amount, new Date(paymentForm.date));
      
      const newPayment: Omit<Payment, 'id'> = {
        loanId: loan.id,
        date: paymentForm.date,
        amount,
        principal: distribution.principal,
        interest: distribution.interest,
        notes: paymentForm.notes
      };
      
      addPayment(newPayment);
      
      const updatedPayments = [...payments, { ...newPayment, id: 'temp' }];
      const newStatus = determineNewLoanStatus(loan, updatedPayments);
      
      if (newStatus !== loan.status) {
        updateLoan({
          ...loan,
          status: newStatus
        });
      }
      
      setPaymentForm({
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      });
      
      setShowPaymentForm(false);
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Ocorreu um erro ao registrar o pagamento. Verifique os dados e tente novamente.');
    }
  };
  
  const handleDeletePayment = (paymentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      deletePayment(paymentId);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/loans')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Voltar para Empréstimos</span>
          </button>
          
          <h1 className="text-3xl font-bold mt-2">Detalhes do Empréstimo</h1>
          <p className="text-gray-500">
            {loan.borrowerName}
            <span className="mx-2">•</span>
            <LoanStatusBadge status={loan.status} />
          </p>
        </div>
        
        <div>
          <button
            onClick={() => navigate(`/loans/${loan.id}/edit`)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Edit className="mr-2 h-5 w-5" />
            Editar Empréstimo
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informações do Empréstimo</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Valor Principal</p>
                <p className="font-medium">{formatCurrency(loan.principal)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Taxa de Juros</p>
                <p className="font-medium">{loan.interestRate}% ao mês</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Data de Emissão</p>
                <p className="font-medium">
                  {format(parseISO(loan.issueDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Data de Vencimento</p>
                <p className="font-medium">
                  {format(parseISO(loan.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            
            {loan.paymentSchedule && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="text-md font-medium mb-3">Cronograma de Pagamento</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Frequência</p>
                    <p className="font-medium capitalize">
                      {loan.paymentSchedule.frequency === 'weekly' && 'Semanal'}
                      {loan.paymentSchedule.frequency === 'biweekly' && 'Quinzenal'}
                      {loan.paymentSchedule.frequency === 'monthly' && 'Mensal'}
                      {loan.paymentSchedule.frequency === 'quarterly' && 'Trimestral'}
                      {loan.paymentSchedule.frequency === 'yearly' && 'Anual'}
                      {loan.paymentSchedule.frequency === 'custom' && 'Personalizada'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Parcelas</p>
                    <p className="font-medium">{loan.paymentSchedule.installments}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Valor da Parcela</p>
                    <p className="font-medium">
                      {formatCurrency(loan.paymentSchedule.installmentAmount)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Próximo Pagamento</p>
                  <p className="font-medium">
                    {format(parseISO(loan.paymentSchedule.nextPaymentDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
            
            {loan.notes && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="text-md font-medium mb-2">Observações</h3>
                <p className="text-gray-700">{loan.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Resumo Financeiro</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Valor Total Pago</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Saldo Restante</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Principal Pago</p>
                <p className="text-lg font-medium">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.principal, 0))}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Juros Pagos</p>
                <p className="text-lg font-medium">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.interest, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
          
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded-lg flex items-center text-sm"
          >
            {showPaymentForm ? (
              <>Cancelar</>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Registrar Pagamento
              </>
            )}
          </button>
        </div>
        
        {showPaymentForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor do Pagamento (R$) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentFormChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data do Pagamento *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={paymentForm.date}
                    onChange={handlePaymentFormChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentFormChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={2}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Registrar Pagamento
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="p-6">
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Não há pagamentos registrados para este empréstimo.</p>
              <p className="text-sm mt-1">
                Clique em "Registrar Pagamento" para adicionar um novo pagamento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Juros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...payments]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(parseISO(payment.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(payment.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(payment.interest)}
                      </td>
                      <td className="px-6 py-4">
                        {payment.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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

export default LoanDetails;
