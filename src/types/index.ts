
// Tipos para o Sistema de Gestão de Empréstimos

export type LoanStatus = 'active' | 'paid' | 'overdue' | 'defaulted';

export interface Borrower {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principal: number;
  interestRate: number; // Taxa de juros mensal em porcentagem
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  status: LoanStatus;
  paymentSchedule?: PaymentSchedule;
  notes?: string;
}

export interface PaymentSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  nextPaymentDate: string;
  installments: number;
  installmentAmount: number;
}

export interface Payment {
  id: string;
  loanId: string;
  date: string; // ISO date string
  amount: number;
  principal: number;
  interest: number;
  notes?: string;
}

export interface DashboardMetrics {
  totalPrincipalOutstanding: number;
  totalInterestAccrued: number;
  totalOverdue: number;
  monthlyIncome: number;
}
