
import React from 'react';
import { useLoanContext } from '../context/LoanContext';
import MetricCard from '../components/dashboard/MetricCard';
import LoanStatusCard from '../components/dashboard/LoanStatusCard';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import { CreditCard, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { 
    loans, 
    payments, 
    calculateLoanMetrics, 
    getOverdueLoans, 
    getUpcomingDueLoans 
  } = useLoanContext();
  
  const metrics = calculateLoanMetrics();
  const overdueLoans = getOverdueLoans();
  const upcomingDueLoans = getUpcomingDueLoans(30);
  
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral dos seus empréstimos</p>
      </div>
      
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Emprestado Pendente" 
          value={formatCurrency(metrics.totalPrincipalOutstanding)}
          icon={<CreditCard className="h-6 w-6 text-blue-500" />}
        />
        
        <MetricCard 
          title="Juros Acumulados" 
          value={formatCurrency(metrics.totalInterestAccrued)}
          icon={<TrendingUp className="h-6 w-6 text-green-500" />}
        />
        
        <MetricCard 
          title="Total em Atraso" 
          value={formatCurrency(metrics.totalOverdue)}
          icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
        />
        
        <MetricCard 
          title="Entrada de Caixa Mensal" 
          value={formatCurrency(metrics.monthlyIncome)}
          icon={<Calendar className="h-6 w-6 text-purple-500" />}
        />
      </div>
      
      {/* Seção de Status dos Empréstimos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoanStatusCard 
          title="Empréstimos em Atraso" 
          loans={overdueLoans}
          emptyMessage="Não há empréstimos em atraso."
          type="overdue"
        />
        
        <LoanStatusCard 
          title="Próximos Vencimentos (30 dias)" 
          loans={upcomingDueLoans}
          emptyMessage="Não há empréstimos com vencimento próximo."
          type="upcoming"
        />
      </div>
      
      {/* Gráfico de Fluxo de Caixa */}
      <div>
        <CashFlowChart 
          loans={loans} 
          payments={payments} 
          weeks={4}
        />
      </div>
    </div>
  );
};

export default Dashboard;
