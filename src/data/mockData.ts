
import { addDays, addMonths, format, subDays, subMonths } from 'date-fns';
import { Borrower, Loan, Payment } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Dados de exemplo para mutuários
export const mockBorrowers: Borrower[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321'
  },
  {
    id: '2',
    name: 'Maria Souza',
    email: 'maria.souza@email.com',
    phone: '(11) 91234-5678'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    phone: '(21) 98765-4321'
  },
  {
    id: '4',
    name: 'Ana Santos',
    email: 'ana.santos@email.com',
    phone: '(21) 91234-5678'
  },
  {
    id: '5',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    phone: '(31) 98765-4321'
  }
];

// Função para criar datas ISO
const toISODate = (date: Date) => format(date, 'yyyy-MM-dd');

// Data atual
const now = new Date();

// Dados de exemplo para empréstimos
export const mockLoans: Loan[] = [
  {
    id: '1',
    borrowerId: '1',
    borrowerName: 'João Silva',
    principal: 5000,
    interestRate: 12, // 12% ao ano
    issueDate: toISODate(subMonths(now, 2)),
    dueDate: toISODate(addMonths(now, 10)),
    status: 'active',
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: toISODate(addDays(now, 10)),
      installments: 12,
      installmentAmount: 441.67
    }
  },
  {
    id: '2',
    borrowerId: '2',
    borrowerName: 'Maria Souza',
    principal: 3000,
    interestRate: 10, // 10% ao ano
    issueDate: toISODate(subMonths(now, 3)),
    dueDate: toISODate(subDays(now, 15)),
    status: 'overdue',
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: toISODate(subDays(now, 15)),
      installments: 6,
      installmentAmount: 525
    }
  },
  {
    id: '3',
    borrowerId: '3',
    borrowerName: 'Carlos Oliveira',
    principal: 10000,
    interestRate: 15, // 15% ao ano
    issueDate: toISODate(subMonths(now, 6)),
    dueDate: toISODate(addMonths(now, 6)),
    status: 'active',
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: toISODate(addDays(now, 5)),
      installments: 12,
      installmentAmount: 898.33
    }
  },
  {
    id: '4',
    borrowerId: '4',
    borrowerName: 'Ana Santos',
    principal: 2000,
    interestRate: 8, // 8% ao ano
    issueDate: toISODate(subMonths(now, 1)),
    dueDate: toISODate(addMonths(now, 2)),
    status: 'active',
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: toISODate(addDays(now, 15)),
      installments: 3,
      installmentAmount: 680
    }
  },
  {
    id: '5',
    borrowerId: '5',
    borrowerName: 'Pedro Costa',
    principal: 7500,
    interestRate: 14, // 14% ao ano
    issueDate: toISODate(subMonths(now, 4)),
    dueDate: toISODate(subDays(now, 45)),
    status: 'defaulted',
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: toISODate(subDays(now, 45)),
      installments: 8,
      installmentAmount: 1003.13
    }
  }
];

// Dados de exemplo para pagamentos
export const mockPayments: Payment[] = [
  {
    id: '1',
    loanId: '1',
    date: toISODate(subDays(now, 20)),
    amount: 441.67,
    principal: 391.67,
    interest: 50
  },
  {
    id: '2',
    loanId: '1',
    date: toISODate(subDays(now, 50)),
    amount: 441.67,
    principal: 391.67,
    interest: 50
  },
  {
    id: '3',
    loanId: '2',
    date: toISODate(subDays(now, 45)),
    amount: 525,
    principal: 475,
    interest: 50
  },
  {
    id: '4',
    loanId: '3',
    date: toISODate(subDays(now, 5)),
    amount: 898.33,
    principal: 773.33,
    interest: 125
  },
  {
    id: '5',
    loanId: '3',
    date: toISODate(subDays(now, 35)),
    amount: 898.33,
    principal: 773.33,
    interest: 125
  },
  {
    id: '6',
    loanId: '3',
    date: toISODate(subDays(now, 65)),
    amount: 898.33,
    principal: 773.33,
    interest: 125
  },
  {
    id: '7',
    loanId: '4',
    date: toISODate(subDays(now, 15)),
    amount: 680,
    principal: 653.33,
    interest: 26.67
  }
];

// Função para gerar um novo ID
export const generateId = (): string => uuidv4();
