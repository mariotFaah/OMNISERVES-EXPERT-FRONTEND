// src/modules/crm/pages/RapportsPage.tsx
import React, { useState, useEffect } from 'react';
import { crmApi } from '../services/api';
import type { Client, Devis, Relance  } from '../types';
import './RapportsPage.css';

const RapportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);
  const [periode, setPeriode] = useState<'7j' | '30j' | '90j' | '1an'>('30j');

  useEffect(() => {
    loadRapportsData();
  }, [periode]);

  const loadRapportsData = async () => {
    try {
      setLoading(true);
      const [clientsData, devisData, relancesData] = await Promise.all([
        crmApi.getClients(),
        crmApi.getDevis(),
        crmApi.getRelances(),
      ]);

      setClients(clientsData);
      setDevis(devisData);
      setRelances(relancesData);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des métriques
  const clientsActifs = clients.filter(c => c.categorie === 'client').length;
  const tauxConversion = devis.filter(d => d.statut === 'accepte').length / Math.max(devis.length, 1) * 100;
  const relancesEnAttente = relances.filter(r => r.statut === 'en_attente').length;
  const caTotal = devis.reduce((sum, d) => sum + d.montant_ht, 0);

  if (loading) {
    return (
      <div className="rapports-container">
        <div className="loading">Chargement des rapports...</div>
      </div>
    );
  }

  return (
    <div className="rapports-container">
      <div className="rapports-header">
        <h1>Rapports CRM</h1>
        <div className="periode-selector">
          <label>Période :</label>
          <select value={periode} onChange={(e) => setPeriode(e.target.value as any)}>
            <option value="7j">7 derniers jours</option>
            <option value="30j">30 derniers jours</option>
            <option value="90j">90 derniers jours</option>
            <option value="1an">1 an</option>
          </select>
        </div>
      </div>

      <div className="rapports-grid">
        {/* Cartes de synthèse */}
        <div className="rapport-card summary">
          <h3>Synthèse Commerciale</h3>
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-value">{clientsActifs}</div>
              <div className="metric-label">Clients Actifs</div>
            </div>
            <div className="metric">
              <div className="metric-value">{devis.length}</div>
              <div className="metric-label">Devis Créés</div>
            </div>
            <div className="metric">
              <div className="metric-value">{tauxConversion.toFixed(1)}%</div>
              <div className="metric-label">Taux Conversion</div>
            </div>
            <div className="metric">
              <div className="metric-value">{(caTotal / 1000).toFixed(0)}K</div>
              <div className="metric-label">CA Total (k€)</div>
            </div>
          </div>
        </div>

        {/* Performance commerciale */}
        <div className="rapport-card">
          <h3>Performance Commerciale</h3>
          <div className="performance-stats">
            <div className="stat-item">
              <span className="stat-label">Devis Acceptés</span>
              <span className="stat-value">
                {devis.filter(d => d.statut === 'accepte').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Devis Envoyés</span>
              <span className="stat-value">
                {devis.filter(d => d.statut === 'envoye').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Devis Refusés</span>
              <span className="stat-value">
                {devis.filter(d => d.statut === 'refuse').length}
              </span>
            </div>
          </div>
        </div>

        {/* Activités de relance */}
        <div className="rapport-card">
          <h3>Activités de Relance</h3>
          <div className="relances-stats">
            <div className="stat-item">
              <span className="stat-label">Relances en Attente</span>
              <span className="stat-value warning">{relancesEnAttente}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Relances Envoyées</span>
              <span className="stat-value">
                {relances.filter(r => r.statut === 'envoyee').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Taux de Réponse</span>
              <span className="stat-value">65%</span>
            </div>
          </div>
        </div>

        {/* Top clients */}
        <div className="rapport-card">
          <h3>Top 5 Clients</h3>
          <div className="top-clients">
            {clients
              .filter(client => client.stats && client.stats.total_devis > 0)
              .sort((a, b) => (b.stats?.ca_devis || 0) - (a.stats?.ca_devis || 0))
              .slice(0, 5)
              .map((client, index) => (
                <div key={client.id_tiers} className="client-rank">
                  <span className="rank">#{index + 1}</span>
                  <span className="client-name">{client.nom}</span>
                  <span className="client-ca">{(client.stats?.ca_devis || 0).toLocaleString()} €</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="rapport-card detailed">
        <h3>Détail des Devis par Statut</h3>
        <div className="devis-detail">
          {['brouillon', 'envoye', 'accepte', 'refuse', 'expire'].map(statut => {
            const devisStatut = devis.filter(d => d.statut === statut);
            const montantTotal = devisStatut.reduce((sum, d) => sum + d.montant_ht, 0);
            
            return (
              <div key={statut} className="devis-statut-row">
                <span className="statut">{statut.toUpperCase()}</span>
                <span className="count">{devisStatut.length} devis</span>
                <span className="montant">{montantTotal.toLocaleString()} €</span>
                <span className="percentage">
                  {((devisStatut.length / Math.max(devis.length, 1)) * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RapportsPage;