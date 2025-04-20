
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, CreditCard, BarChart2, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="bg-sidebar w-64 h-screen fixed left-0 top-0 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-primary">LoanBuddy</h1>
        <p className="text-sm text-gray-500">Sistema de Gestão de Empréstimos</p>
      </div>
      
      <nav className="p-4 space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/loans" 
          className={({ isActive }) => 
            `flex items-center p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <FileText className="mr-3 h-5 w-5" />
          <span>Empréstimos</span>
        </NavLink>
        
        <NavLink 
          to="/borrowers" 
          className={({ isActive }) => 
            `flex items-center p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Users className="mr-3 h-5 w-5" />
          <span>Mutuários</span>
        </NavLink>
        
        <NavLink 
          to="/payments" 
          className={({ isActive }) => 
            `flex items-center p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <CreditCard className="mr-3 h-5 w-5" />
          <span>Pagamentos</span>
        </NavLink>
        
        <NavLink 
          to="/reports" 
          className={({ isActive }) => 
            `flex items-center p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <BarChart2 className="mr-3 h-5 w-5" />
          <span>Relatórios</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `flex items-center p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          <span>Configurações</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
