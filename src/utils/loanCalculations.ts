
import { addDays, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import { Loan, Payment } from '../types';

/**
 * Calcula o valor total devido (principal + juros acumulados) para um empréstimo
 */
export const calculateTotalDue = (loan: Loan, currentDate: Date = new Date()): number => {
  const principal = loan.principal;
  const interestRate = loan.interestRate / 100; // Converter porcentagem para decimal
  const issueDate = parseISO(loan.issueDate);
  const dueDate = parseISO(loan.dueDate);
  
  // Se o empréstimo estiver pago, retorna 0
  if (loan.status === 'paid') {
    return 0;
  }

  // Calcula meses desde a emissão até a data atual ou data de vencimento (o que for menor)
  const endDate = isBefore(currentDate, dueDate) ? currentDate : dueDate;
  const daysElapsed = differenceInDays(endDate, issueDate);
  
  // Convertendo dias para meses (aproximadamente)
  const monthsElapsed = daysElapsed / 30;
  
  // Juros simples: Principal * Taxa * Meses
  const interest = principal * interestRate * monthsElapsed;
  
  return principal + interest;
};

/**
 * Calcula o saldo restante do empréstimo após contabilizar os pagamentos
 */
export const calculateRemainingBalance = (
  loan: Loan, 
  payments: Payment[],
  currentDate: Date = new Date()
): number => {
  const totalDue = calculateTotalDue(loan, currentDate);
  const totalPaid = payments
    .filter(payment => payment.loanId === loan.id)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  return Math.max(0, totalDue - totalPaid);
};

/**
 * Determina se um empréstimo está em atraso
 */
export const isLoanOverdue = (loan: Loan, currentDate: Date = new Date()): boolean => {
  if (loan.status === 'paid') {
    return false;
  }
  
  const dueDate = parseISO(loan.dueDate);
  return isAfter(currentDate, dueDate);
};

/**
 * Calcula dias em atraso para um empréstimo
 */
export const getDaysOverdue = (loan: Loan, currentDate: Date = new Date()): number => {
  if (!isLoanOverdue(loan, currentDate)) {
    return 0;
  }
  
  const dueDate = parseISO(loan.dueDate);
  return differenceInDays(currentDate, dueDate);
};

/**
 * Calcula a distribuição do pagamento entre principal e juros
 */
export const calculatePaymentDistribution = (
  loan: Loan,
  paymentAmount: number,
  paymentDate: Date = new Date()
): { principal: number; interest: number } => {
  const totalDue = calculateTotalDue(loan, paymentDate);
  const principal = loan.principal;
  
  const interestAccrued = totalDue - principal;
  
  // Se o pagamento for menor que os juros acumulados, tudo vai para juros
  if (paymentAmount <= interestAccrued) {
    return {
      principal: 0,
      interest: paymentAmount
    };
  }
  
  // Caso contrário, paga os juros primeiro e o restante vai para o principal
  return {
    interest: interestAccrued,
    principal: paymentAmount - interestAccrued
  };
};

/**
 * Atualiza o status do empréstimo com base nos pagamentos e datas
 */
export const determineNewLoanStatus = (
  loan: Loan,
  payments: Payment[],
  currentDate: Date = new Date()
): 'active' | 'paid' | 'overdue' | 'defaulted' => {
  const remainingBalance = calculateRemainingBalance(loan, payments, currentDate);
  
  // Se o saldo for zero, o empréstimo está pago
  if (remainingBalance <= 0) {
    return 'paid';
  }
  
  const dueDate = parseISO(loan.dueDate);
  
  // Se a data atual for após a data de vencimento
  if (isAfter(currentDate, dueDate)) {
    const daysOverdue = getDaysOverdue(loan, currentDate);
    
    // Se estiver mais de 90 dias em atraso, considera-se inadimplente
    if (daysOverdue > 90) {
      return 'defaulted';
    }
    
    return 'overdue';
  }
  
  return 'active';
};
