
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoanContext } from '../context/LoanContext';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';

const BorrowersList = () => {
  const { borrowers, deleteBorrower, getLoansByBorrowerId } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar mutuários com base na pesquisa
  const filteredBorrowers = borrowers.filter(borrower => 
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (borrower.email && borrower.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (borrower.phone && borrower.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Lidar com a exclusão de um mutuário
  const handleDeleteBorrower = (id: string) => {
    const loans = getLoansByBorrowerId(id);
    
    if (loans.length > 0) {
      alert('Não é possível excluir um mutuário que possui empréstimos ativos.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este mutuário?')) {
      deleteBorrower(id);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mutuários</h1>
          <p className="text-gray-500 mt-1">Gerencie seus mutuários</p>
        </div>
        
        <Link 
          to="/borrowers/new" 
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Mutuário
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar mutuários..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Lista de Mutuários */}
      <div className="bg-white rounded-lg shadow">
        {filteredBorrowers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum mutuário encontrado</h3>
            <p>Comece adicionando um novo mutuário.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empréstimos Ativos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBorrowers.map((borrower) => {
                  const borrowerLoans = getLoansByBorrowerId(borrower.id);
                  const activeLoans = borrowerLoans.filter(
                    loan => loan.status !== 'paid'
                  );
                  
                  return (
                    <tr key={borrower.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{borrower.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {borrower.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {borrower.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activeLoans.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Link 
                            to={`/borrowers/${borrower.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteBorrower(borrower.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={activeLoans.length > 0}
                          >
                            <Trash2 className={`h-5 w-5 ${activeLoans.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                          </button>
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
    </div>
  );
};

export default BorrowersList;
