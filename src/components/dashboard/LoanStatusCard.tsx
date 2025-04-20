
import React from 'react';
import { Loan } from '../../types';
import { getDaysOverdue } from '../../utils/loanCalculations';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LoanStatusCardProps {
  title: string;
  loans: Loan[];
  emptyMessage: string;
  type: 'overdue' | 'upcoming';
}

const LoanStatusCard: React.FC<LoanStatusCardProps> = ({ 
  title, 
  loans, 
  emptyMessage,
  type
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      <div className="p-6">
        {loans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="space-y-4">
            {loans.map(loan => (
              <div key={loan.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{loan.borrowerName}</h4>
                    <p className="text-sm text-gray-500">
                      {type === 'overdue' 
                        ? `Vencido há ${getDaysOverdue(loan)} dias` 
                        : `Vence em ${formatDistanceToNow(parseISO(loan.dueDate), { locale: ptBR })}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {loan.principal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(loan.dueDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanStatusCard;
