import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoanProvider } from "./context/LoanContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import LoansList from "./pages/LoansList";
import LoanForm from "./pages/LoanForm";
import LoanDetails from "./pages/LoanDetails";
import BorrowersList from "./pages/BorrowersList";
import BorrowerForm from "./pages/BorrowerForm";
import PaymentsList from "./pages/PaymentsList";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LoanProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            
            {/* Rotas de Empréstimos */}
            <Route path="/loans" element={<Layout><LoansList /></Layout>} />
            <Route path="/loans/new" element={<Layout><LoanForm /></Layout>} />
            <Route path="/loans/:id" element={<Layout><LoanDetails /></Layout>} />
            <Route path="/loans/:id/edit" element={<Layout><LoanForm /></Layout>} />
            
            {/* Rotas de Mutuários */}
            <Route path="/borrowers" element={<Layout><BorrowersList /></Layout>} />
            <Route path="/borrowers/new" element={<Layout><BorrowerForm /></Layout>} />
            <Route path="/borrowers/:id" element={<Layout><BorrowerForm /></Layout>} />
            
            {/* Rota de Pagamentos */}
            <Route path="/payments" element={<Layout><PaymentsList /></Layout>} />
            
            {/* Rota de Relatórios */}
            <Route path="/reports" element={<Layout><Reports /></Layout>} />
            
            {/* Rota de Configurações */}
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LoanProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
