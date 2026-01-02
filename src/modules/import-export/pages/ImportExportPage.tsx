import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Commande } from '../types';
import DashboardStats from '../components/DashboardStats';

const ImportExportPage: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadCommandes = async () => {
    try {
      const data = await importExportApi.getCommandes();
      setCommandes(data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const isHomePage = location.pathname === '/import-export';

  return (
    <div className="import-export-content">
      {isHomePage && (
        <div className="dashboard-wrapper">
          <DashboardStats commandes={commandes} loading={loading} />
        </div>
      )}
      
      <Outlet />
    </div>
  );
};

export default ImportExportPage;