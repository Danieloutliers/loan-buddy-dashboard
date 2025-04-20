
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Borrower, Loan, Payment } from '../types';
import { mockBorrowers, mockLoans, mockPayments, generateId } from '../data/mockData';
import { calculateRemainingBalance, determineNewLoanStatus } from '../utils/loanCalculations';

interface LoanContextType {
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  addBorrower: (borrower: Omit<Borrower, 'id'>) => Borrower;
  updateBorrower: (borrower: Borrower) => void;
  deleteBorrower: (id: string) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => Loan;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => Payment;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getBorrowerById: (id: string) => Borrower | undefined;
  getLoanById: (id: string) => Loan | undefined;
  getLoansByBorrowerId: (borrowerId: string) => Loan[];
  getPaymentsByLoanId: (loanId: string) => Payment[];
  calculateLoanMetrics: () => {
    totalPrincipalOutstanding: number;
    totalInterestAccrued: number;
    totalOverdue: number;
    monthlyIncome: number;
  };
  getOverdueLoans: () => Loan[];
  getUpcomingDueLoans: (days: number) => Loan[];
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider = ({ children }: { children: ReactNode }) => {
  const [borrowers, setBorrowers] = useState<Borrower[]>(mockBorrowers);
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  // Funções para gerenciar mutuários
  const addBorrower = (borrowerData: Omit<Borrower, 'id'>) => {
    const newBorrower: Borrower = {
      ...borrowerData,
      id: generateId()
    };
    setBorrowers([...borrowers, newBorrower]);
    return newBorrower;
  };

  const updateBorrower = (updatedBorrower: Borrower) => {
    setBorrowers(
      borrowers.map(borrower => 
        borrower.id === updatedBorrower.id ? updatedBorrower : borrower
      )
    );
    
    // Atualizar os nomes dos mutuários nos empréstimos relacionados
    setLoans(
      loans.map(loan => 
        loan.borrowerId === updatedBorrower.id
          ? { ...loan, borrowerName: updatedBorrower.name }
          : loan
      )
    );
  };

  const deleteBorrower = (id: string) => {
    // Verificar se existem empréstimos vinculados ao mutuário
    const hasLoans = loans.some(loan => loan.borrowerId === id);
    
    if (hasLoans) {
      alert('Não é possível excluir um mutuário que possui empréstimos.');
      return;
    }
    
    setBorrowers(borrowers.filter(borrower => borrower.id !== id));
  };

  // Funções para gerenciar empréstimos
  const addLoan = (loanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: generateId()
    };
    setLoans([...loans, newLoan]);
    return newLoan;
  };

  const updateLoan = (updatedLoan: Loan) => {
    setLoans(
      loans.map(loan => 
        loan.id === updatedLoan.id ? updatedLoan : loan
      )
    );
  };

  const deleteLoan = (id: string) => {
    // Verificar se existem pagamentos vinculados ao empréstimo
    const hasPayments = payments.some(payment => payment.loanId === id);
    
    if (hasPayments) {
      // Perguntar ao usuário se deseja excluir os pagamentos também
      const confirmDelete = window.confirm(
        'Este empréstimo possui pagamentos registrados. Deseja excluir o empréstimo e todos os seus pagamentos?'
      );
      
      if (!confirmDelete) {
        return;
      }
      
      // Excluir os pagamentos relacionados
      setPayments(payments.filter(payment => payment.loanId !== id));
    }
    
    setLoans(loans.filter(loan => loan.id !== id));
  };

  // Funções para gerenciar pagamentos
  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: generateId()
    };
    
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    
    // Atualizar o status do empréstimo após o pagamento
    const loan = loans.find(loan => loan.id === paymentData.loanId);
    
    if (loan) {
      const newStatus = determineNewLoanStatus(loan, updatedPayments);
      
      // Atualizar o empréstimo se o status mudou
      if (newStatus !== loan.status) {
        updateLoan({
          ...loan,
          status: newStatus
        });
      }
    }
    
    return newPayment;
  };

  const updatePayment = (updatedPayment: Payment) => {
    const updatedPayments = payments.map(payment => 
      payment.id === updatedPayment.id ? updatedPayment : payment
    );
    
    setPayments(updatedPayments);
    
    // Atualizar o status do empréstimo após a atualização do pagamento
    const loan = loans.find(loan => loan.id === updatedPayment.loanId);
    
    if (loan) {
      const newStatus = determineNewLoanStatus(loan, updatedPayments);
      
      // Atualizar o empréstimo se o status mudou
      if (newStatus !== loan.status) {
        updateLoan({
          ...loan,
          status: newStatus
        });
      }
    }
  };

  const deletePayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    
    if (!payment) {
      return;
    }
    
    const updatedPayments = payments.filter(payment => payment.id !== id);
    setPayments(updatedPayments);
    
    // Atualizar o status do empréstimo após a exclusão do pagamento
    const loan = loans.find(loan => loan.id === payment.loanId);
    
    if (loan) {
      const newStatus = determineNewLoanStatus(loan, updatedPayments);
      
      // Atualizar o empréstimo se o status mudou
      if (newStatus !== loan.status) {
        updateLoan({
          ...loan,
          status: newStatus
        });
      }
    }
  };

  // Funções de consulta
  const getBorrowerById = (id: string) => {
    return borrowers.find(borrower => borrower.id === id);
  };

  const getLoanById = (id: string) => {
    return loans.find(loan => loan.id === id);
  };

  const getLoansByBorrowerId = (borrowerId: string) => {
    return loans.filter(loan => loan.borrowerId === borrowerId);
  };

  const getPaymentsByLoanId = (loanId: string) => {
    return payments.filter(payment => payment.loanId === loanId);
  };

  // Funções para cálculos e métricas
  const calculateLoanMetrics = () => {
    const now = new Date();
    
    let totalPrincipalOutstanding = 0;
    let totalInterestAccrued = 0;
    let totalOverdue = 0;
    
    // Calcular o total de principal pendente e juros acumulados
    loans.forEach(loan => {
      if (loan.status !== 'paid') {
        const loanPayments = getPaymentsByLoanId(loan.id);
        const remainingBalance = calculateRemainingBalance(loan, loanPayments, now);
        
        // Adicionar ao principal pendente
        totalPrincipalOutstanding += remainingBalance;
        
        // Calcular juros acumulados (já pagos)
        const interestPaid = loanPayments.reduce((sum, payment) => sum + payment.interest, 0);
        totalInterestAccrued += interestPaid;
        
        // Se estiver vencido, adicionar ao total em atraso
        if (loan.status === 'overdue' || loan.status === 'defaulted') {
          totalOverdue += remainingBalance;
        }
      }
    });
    
    // Calcular a entrada de caixa mensal (pagamentos recebidos no mês atual)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyIncome = payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalPrincipalOutstanding,
      totalInterestAccrued,
      totalOverdue,
      monthlyIncome
    };
  };

  // Obter empréstimos em atraso
  const getOverdueLoans = () => {
    return loans.filter(loan => 
      loan.status === 'overdue' || loan.status === 'defaulted'
    );
  };

  // Obter empréstimos com vencimento próximo
  const getUpcomingDueLoans = (days: number) => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);
    
    return loans.filter(loan => {
      if (loan.status === 'paid') {
        return false;
      }
      
      const dueDate = new Date(loan.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    });
  };

  const value = {
    borrowers,
    loans,
    payments,
    addBorrower,
    updateBorrower,
    deleteBorrower,
    addLoan,
    updateLoan,
    deleteLoan,
    addPayment,
    updatePayment,
    deletePayment,
    getBorrowerById,
    getLoanById,
    getLoansByBorrowerId,
    getPaymentsByLoanId,
    calculateLoanMetrics,
    getOverdueLoans,
    getUpcomingDueLoans
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  
  if (context === undefined) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  
  return context;
};
