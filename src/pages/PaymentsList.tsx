
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Search, Trash2, CreditCard } from 'lucide-react';

const PaymentsList = () => {
  const { payments, loans, deletePayment } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar pagamentos com base na pesquisa
  const filteredPayments = payments.filter(payment => {
    const loan = loans.find(l => l.id === payment.loanId);
    
    if (!loan) return false;
    
    return (
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount.toString().includes(searchTerm) ||
      payment.date.includes(searchTerm)
    );
  });
  
  // Ordenar pagamentos por data (mais recentes primeiro)
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Lidar com a exclusão de um pagamento
  const handleDeletePayment = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      deletePayment(id);
    }
  };
  
  // Formatar valores para exibição
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-gray-500 mt-1">Histórico de todos os pagamentos recebidos</p>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar pagamentos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Lista de Pagamentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum pagamento encontrado</h3>
            <p>Registre pagamentos através da página de detalhes do empréstimo.</p>
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
                    Mutuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empréstimo
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
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPayments.map((payment) => {
                  const loan = loans.find(l => l.id === payment.loanId);
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(parseISO(payment.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loan ? loan.borrowerName : 'Desconhecido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loan ? (
                          <Link 
                            to={`/loans/${loan.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Empréstimo #{loan.id.substring(0, 8)}
                          </Link>
                        ) : (
                          'Empréstimo não encontrado'
                        )}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsList;
