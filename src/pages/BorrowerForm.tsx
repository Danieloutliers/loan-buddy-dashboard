
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoanContext } from '../context/LoanContext';
import { ArrowLeft } from 'lucide-react';
import { Borrower } from '../types';

const BorrowerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addBorrower, updateBorrower, getBorrowerById } = useLoanContext();
  
  const isEditMode = !!id;
  const borrower = id ? getBorrowerById(id) : null;
  
  // Estado para os campos do formulário
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({
    name: '',
    email: '',
    phone: ''
  });
  
  // Carregar dados do mutuário se estiver no modo de edição
  useEffect(() => {
    if (isEditMode && borrower) {
      setFormData({
        name: borrower.name,
        email: borrower.email || '',
        phone: borrower.phone || ''
      });
    }
  }, [isEditMode, borrower]);
  
  // Atualizar formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar o nome (obrigatório)
      if (!formData.name.trim()) {
        alert('O nome do mutuário é obrigatório.');
        return;
      }
      
      // Preparar dados do mutuário
      const borrowerData: Omit<Borrower, 'id'> = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined
      };
      
      // Criar ou atualizar o mutuário
      if (isEditMode && borrower) {
        updateBorrower({ ...borrowerData, id: borrower.id });
      } else {
        addBorrower(borrowerData);
      }
      
      // Redirecionar para a lista de mutuários
      navigate('/borrowers');
    } catch (error) {
      console.error('Erro ao salvar mutuário:', error);
      alert('Ocorreu um erro ao salvar o mutuário. Verifique os dados e tente novamente.');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/borrowers')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Voltar para Mutuários</span>
        </button>
        
        <h1 className="text-3xl font-bold mt-2">
          {isEditMode ? 'Editar Mutuário' : 'Novo Mutuário'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode 
            ? `Editando dados de ${borrower?.name}` 
            : 'Registre um novo mutuário'}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/borrowers')}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isEditMode ? 'Atualizar Mutuário' : 'Salvar Mutuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowerForm;
