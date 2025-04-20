
import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultInterestRate: '2.5',
    defaultPaymentFrequency: 'monthly',
    defaultInstallments: '12',
    currency: 'BRL',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode implementar a lógica para salvar as configurações
    localStorage.setItem('loanSettings', JSON.stringify(settings));
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-gray-500">Gerencie suas preferências do sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Configurações Padrão de Empréstimos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Juros Padrão (% ao mês)
                </label>
                <input
                  type="number"
                  name="defaultInterestRate"
                  value={settings.defaultInterestRate}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência de Pagamento Padrão
                </label>
                <select
                  name="defaultPaymentFrequency"
                  value={settings.defaultPaymentFrequency}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Parcelas Padrão
                </label>
                <input
                  type="number"
                  name="defaultInstallments"
                  value={settings.defaultInstallments}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moeda
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <SettingsIcon className="mr-2 h-5 w-5" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
