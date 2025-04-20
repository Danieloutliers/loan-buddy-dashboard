import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar automaticamente para o dashboard
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">LoanBuddy</h1>
        <p className="text-xl text-gray-600">Sistema de Gestão de Empréstimos Pessoais</p>
        <div className="mt-8">
          <p className="text-gray-500">Redirecionando para o dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
