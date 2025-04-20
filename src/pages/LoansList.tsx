
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoanContext } from '../context/LoanContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Loan, LoanStatus } from '../types';
import { calculateRemainingBalance } from '../utils/loanCalculations';

const LoanStatusBadge: React.FC<{ status: LoanStatus }> = ({ status }) => {
  const statusConfig = {
    active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
    paid: { label: 'Pago', className: 'bg-blue-100 text-blue-800' },
    overdue: { label: 'Vencido', className: 'bg-yellow-100 text-yellow-800' },
    defaulted: { label: 'Inadimplente', className: 'bg-red-100 text-red-800' }
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

const LoansList = () => {
  const { loans, payments, deleteLoan } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all');
  
  // Filtrar empréstimos com base na pesquisa e filtro de status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Ordenar empréstimos por status e data de vencimento
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    // Primeiro, ordenar por status (vencidos primeiro)
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    
    // Depois, ordenar por data de vencimento (mais próximos primeiro)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Lidar com a exclusão de um empréstimo
  const handleDeleteLoan = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este empréstimo?')) {
      deleteLoan(id);
    }
  };
  
  // Formatar valores para exibição
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Calcular o saldo restante de um empréstimo
  const getRemainingBalance = (loan: Loan) => {
    const loanPayments = payments.filter(payment => payment.loanId === loan.id);
    return calculateRemainingBalance(loan, loanPayments);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus empréstimos</p>
        </div>
        
        <Link 
          to="/loans/new" 
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Empréstimo
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nome do mutuário..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LoanStatus | 'all')}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="overdue">Vencidos</option>
              <option value="defaulted">Inadimplentes</option>
              <option value="paid">Pagos</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista de Empréstimos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedLoans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum empréstimo encontrado.
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
                    Taxa de Juros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Restante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{loan.borrowerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(loan.principal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loan.interestRate}% ao ano
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(parseISO(loan.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(getRemainingBalance(loan))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/loans/${loan.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteLoan(loan.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansList;
