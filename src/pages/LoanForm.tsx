import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoanContext } from '../context/LoanContext';
import { format, addMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loan, PaymentSchedule } from '../types';

const LoanForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { borrowers, addLoan, updateLoan, getLoanById } = useLoanContext();
  
  const isEditMode = !!id;
  const loan = id ? getLoanById(id) : null;
  
  const [formData, setFormData] = useState<{
    borrowerId: string;
    principal: string;
    interestRate: string;
    issueDate: string;
    dueDate: string;
    notes: string;
    hasPaymentSchedule: boolean;
    paymentSchedule: {
      frequency: PaymentSchedule['frequency'];
      installments: string;
      installmentAmount: string;
    };
  }>({
    borrowerId: '',
    principal: '',
    interestRate: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
    notes: '',
    hasPaymentSchedule: false,
    paymentSchedule: {
      frequency: 'monthly',
      installments: '6',
      installmentAmount: ''
    }
  });
  
  useEffect(() => {
    if (isEditMode && loan) {
      setFormData({
        borrowerId: loan.borrowerId,
        principal: loan.principal.toString(),
        interestRate: loan.interestRate.toString(),
        issueDate: loan.issueDate,
        dueDate: loan.dueDate,
        notes: loan.notes || '',
        hasPaymentSchedule: !!loan.paymentSchedule,
        paymentSchedule: {
          frequency: loan.paymentSchedule?.frequency || 'monthly',
          installments: loan.paymentSchedule?.installments.toString() || '6',
          installmentAmount: loan.paymentSchedule?.installmentAmount.toString() || ''
        }
      });
    }
  }, [isEditMode, loan]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('paymentSchedule.')) {
      const scheduleField = name.split('.')[1];
      setFormData({
        ...formData,
        paymentSchedule: {
          ...formData.paymentSchedule,
          [scheduleField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handlePaymentScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      hasPaymentSchedule: e.target.checked
    });
  };
  
  const calculateInstallmentAmount = () => {
    const principal = parseFloat(formData.principal);
    const interestRate = parseFloat(formData.interestRate) / 100; // Converter para decimal
    const installments = parseInt(formData.paymentSchedule.installments);
    
    if (principal && !isNaN(principal) && installments && !isNaN(installments)) {
      const monthlyInterest = principal * interestRate;
      const installmentAmount = principal / installments + monthlyInterest;
      
      setFormData({
        ...formData,
        paymentSchedule: {
          ...formData.paymentSchedule,
          installmentAmount: installmentAmount.toFixed(2)
        }
      });
    }
  };
  
  useEffect(() => {
    if (formData.hasPaymentSchedule) {
      calculateInstallmentAmount();
    }
  }, [formData.principal, formData.interestRate, formData.paymentSchedule.installments, formData.hasPaymentSchedule]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.borrowerId || !formData.principal || !formData.interestRate || !formData.issueDate || !formData.dueDate) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      const borrower = borrowers.find(b => b.id === formData.borrowerId);
      
      if (!borrower) {
        alert('Mutuário não encontrado.');
        return;
      }
      
      const loanData: Omit<Loan, 'id'> = {
        borrowerId: formData.borrowerId,
        borrowerName: borrower.name,
        principal: parseFloat(formData.principal),
        interestRate: parseFloat(formData.interestRate),
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        status: 'active',
        notes: formData.notes
      };
      
      if (formData.hasPaymentSchedule) {
        loanData.paymentSchedule = {
          frequency: formData.paymentSchedule.frequency,
          installments: parseInt(formData.paymentSchedule.installments),
          installmentAmount: parseFloat(formData.paymentSchedule.installmentAmount),
          nextPaymentDate: calculateNextPaymentDate(formData.issueDate, formData.paymentSchedule.frequency)
        };
      }
      
      if (isEditMode && loan) {
        updateLoan({ ...loanData, id: loan.id, status: loan.status });
      } else {
        addLoan(loanData);
      }
      
      navigate('/loans');
    } catch (error) {
      console.error('Erro ao salvar empréstimo:', error);
      alert('Ocorreu um erro ao salvar o empréstimo. Verifique os dados e tente novamente.');
    }
  };
  
  const calculateNextPaymentDate = (issueDate: string, frequency: PaymentSchedule['frequency']): string => {
    const startDate = parseISO(issueDate);
    let nextDate: Date;
    
    switch (frequency) {
      case 'weekly':
        nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate = addMonths(startDate, 1);
        break;
      case 'quarterly':
        nextDate = addMonths(startDate, 3);
        break;
      case 'yearly':
        nextDate = addMonths(startDate, 12);
        break;
      default:
        nextDate = addMonths(startDate, 1);
    }
    
    return format(nextDate, 'yyyy-MM-dd');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Editar Empréstimo' : 'Novo Empréstimo'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode 
            ? `Editando empréstimo para ${loan?.borrowerName}` 
            : 'Registre um novo empréstimo'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mutuário *
              </label>
              <select
                name="borrowerId"
                value={formData.borrowerId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Selecione um mutuário</option>
                {borrowers.map(borrower => (
                  <option key={borrower.id} value={borrower.id}>
                    {borrower.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Principal (R$) *
              </label>
              <input
                type="number"
                name="principal"
                value={formData.principal}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Juros (% ao mês) *
              </label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Emissão *
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="hasPaymentSchedule"
              checked={formData.hasPaymentSchedule}
              onChange={handlePaymentScheduleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="hasPaymentSchedule" className="ml-2 block text-sm font-medium text-gray-700">
              Definir Cronograma de Pagamento
            </label>
          </div>
          
          {formData.hasPaymentSchedule && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência
                </label>
                <select
                  name="paymentSchedule.frequency"
                  value={formData.paymentSchedule.frequency}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Parcelas
                </label>
                <input
                  type="number"
                  name="paymentSchedule.installments"
                  value={formData.paymentSchedule.installments}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  min="1"
                  step="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Parcela (R$)
                </label>
                <input
                  type="number"
                  name="paymentSchedule.installmentAmount"
                  value={formData.paymentSchedule.installmentAmount}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
                  min="0"
                  step="0.01"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calculado automaticamente com base no valor principal, taxa de juros e número de parcelas.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            rows={3}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/loans')}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isEditMode ? 'Atualizar Empréstimo' : 'Criar Empréstimo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;
