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
  importLoansData: (data: any[]) => { 
    success: boolean; 
    imported: number; 
    message?: string;
  };
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider = ({ children }: { children: ReactNode }) => {
  const [borrowers, setBorrowers] = useState<Borrower[]>(mockBorrowers);
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

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
    
    setLoans(
      loans.map(loan => 
        loan.borrowerId === updatedBorrower.id
          ? { ...loan, borrowerName: updatedBorrower.name }
          : loan
      )
    );
  };

  const deleteBorrower = (id: string) => {
    const hasLoans = loans.some(loan => loan.borrowerId === id);
    
    if (hasLoans) {
      alert('Não é possível excluir um mutuário que possui empréstimos.');
      return;
    }
    
    setBorrowers(borrowers.filter(borrower => borrower.id !== id));
  };

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
    const hasPayments = payments.some(payment => payment.loanId === id);
    
    if (hasPayments) {
      const confirmDelete = window.confirm(
        'Este empréstimo possui pagamentos registrados. Deseja excluir o empréstimo e todos os seus pagamentos?'
      );
      
      if (!confirmDelete) {
        return;
      }
      
      setPayments(payments.filter(payment => payment.loanId !== id));
    }
    
    setLoans(loans.filter(loan => loan.id !== id));
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: generateId()
    };
    
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    
    const loan = loans.find(loan => loan.id === paymentData.loanId);
    
    if (loan) {
      const newStatus = determineNewLoanStatus(loan, updatedPayments);
      
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
    
    const loan = loans.find(loan => loan.id === updatedPayment.loanId);
    
    if (loan) {
      const newStatus = determineNewLoanStatus(loan, updatedPayments);
      
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
    
    const loan = loans.find(loan => loan.id === payment.loanId);
    
    if (loan) {
      const newStatus = determineNewLoanStatus(loan, updatedPayments);
      
      if (newStatus !== loan.status) {
        updateLoan({
          ...loan,
          status: newStatus
        });
      }
    }
  };

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

  const calculateLoanMetrics = () => {
    const now = new Date();
    
    let totalPrincipalOutstanding = 0;
    let totalInterestAccrued = 0;
    let totalOverdue = 0;
    
    loans.forEach(loan => {
      if (loan.status !== 'paid') {
        const loanPayments = getPaymentsByLoanId(loan.id);
        const remainingBalance = calculateRemainingBalance(loan, loanPayments, now);
        
        totalPrincipalOutstanding += remainingBalance;
        
        const interestPaid = loanPayments.reduce((sum, payment) => sum + payment.interest, 0);
        totalInterestAccrued += interestPaid;
        
        if (loan.status === 'overdue' || loan.status === 'defaulted') {
          totalOverdue += remainingBalance;
        }
      }
    });
    
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

  const getOverdueLoans = () => {
    return loans.filter(loan => 
      loan.status === 'overdue' || loan.status === 'defaulted'
    );
  };

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

  const importLoansData = (data: any[]) => {
    if (!data || data.length === 0) {
      return { success: false, imported: 0, message: "Nenhum dado para importar" };
    }

    try {
      const importedBorrowers: Record<string, Borrower> = {};
      const importedLoans: Loan[] = [];
      
      data.forEach(item => {
        const borrowerId = item['ID do Mutuário'];
        let borrower = borrowers.find(b => b.id === borrowerId);
        
        if (!borrower && !importedBorrowers[borrowerId]) {
          importedBorrowers[borrowerId] = {
            id: borrowerId,
            name: item['Nome do Mutuário'],
            email: item['Email do Mutuário'] || '',
            phone: item['Telefone do Mutuário'] || ''
          };
        }
        
        if (!item['ID do Empréstimo'] || !item['Valor Principal'] || !item['Taxa de Juros']) {
          return;
        }
        
        const loan: Loan = {
          id: item['ID do Empréstimo'],
          borrowerId: borrowerId,
          borrowerName: item['Nome do Mutuário'],
          principal: parseFloat(item['Valor Principal']),
          interestRate: parseFloat(item['Taxa de Juros']),
          issueDate: item['Data de Emissão'],
          dueDate: item['Data de Vencimento'],
          status: item['Status'] as LoanStatus || 'active',
          notes: item['Notas'] || ''
        };
        
        if (item['Frequência de Pagamento'] && item['Número de Parcelas'] && item['Valor da Parcela']) {
          loan.paymentSchedule = {
            frequency: item['Frequência de Pagamento'] as any,
            installments: parseInt(item['Número de Parcelas']),
            installmentAmount: parseFloat(item['Valor da Parcela']),
            nextPaymentDate: item['Próxima Data de Pagamento'] || item['Data de Emissão']
          };
        }
        
        importedLoans.push(loan);
      });
      
      const newBorrowers = [...borrowers];
      Object.values(importedBorrowers).forEach(borrower => {
        if (!newBorrowers.some(b => b.id === borrower.id)) {
          newBorrowers.push(borrower);
        }
      });
      
      const newLoans = [...loans];
      importedLoans.forEach(loan => {
        const existingLoanIndex = newLoans.findIndex(l => l.id === loan.id);
        if (existingLoanIndex >= 0) {
          newLoans[existingLoanIndex] = loan;
        } else {
          newLoans.push(loan);
        }
      });
      
      setBorrowers(newBorrowers);
      setLoans(newLoans);
      
      return { 
        success: true, 
        imported: importedLoans.length,
        message: `${importedLoans.length} empréstimos importados com sucesso.`
      };
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      return { 
        success: false, 
        imported: 0, 
        message: "Erro ao processar os dados. Verifique o formato e tente novamente."
      };
    }
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
    getUpcomingDueLoans,
    importLoansData
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
