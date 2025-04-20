
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loan } from '../../types';
import { calculateRemainingBalance } from '../../utils/loanCalculations';

interface CashFlowChartProps {
  loans: Loan[];
  payments: any[];
  weeks?: number;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ loans, payments, weeks = 4 }) => {
  // Preparar dados para o gráfico de fluxo de caixa semanal
  const prepareWeeklyCashFlowData = () => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Segunda-feira
    
    const weeklyCashFlow = [];
    
    for (let i = 0; i < weeks; i++) {
      const weekStart = addWeeks(startOfCurrentWeek, i);
      const weekEnd = addDays(weekStart, 6);
      
      // Calcular os pagamentos esperados para esta semana
      let expectedAmount = 0;
      
      loans.forEach(loan => {
        if (loan.status === 'paid') return;
        
        if (loan.paymentSchedule) {
          const nextPaymentDate = new Date(loan.paymentSchedule.nextPaymentDate);
          
          if (nextPaymentDate >= weekStart && nextPaymentDate <= weekEnd) {
            expectedAmount += loan.paymentSchedule.installmentAmount;
          }
        }
      });
      
      weeklyCashFlow.push({
        name: `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM', { locale: ptBR })}`,
        amount: expectedAmount
      });
    }
    
    return weeklyCashFlow;
  };

  const cashFlowData = prepareWeeklyCashFlowData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Previsão de Fluxo de Caixa</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={cashFlowData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} 
            />
            <Tooltip 
              formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, 'Valor Esperado']}
              labelFormatter={(label) => `Semana: ${label}`}
            />
            <Bar dataKey="amount" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;
