// src/modules/crm/pages/ClientsListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Client } from '../types';
import './ClientsListPage.css';

const ClientsListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorieFilter, setCategorieFilter] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadClients();
  }, [categorieFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      let data: Client[];
      
      if (categorieFilter === 'tous') {
        data = await crmApi.getClients();
      } else {
        data = await crmApi.getClientsByCategorie(categorieFilter);
      }
      
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getCategorieColor = (categorie?: string) => {
    switch (categorie) {
      case 'client': return 'ms-crm-categorie-client';
      case 'fournisseur': return 'ms-crm-categorie-fournisseur';
      case 'prospect': return 'ms-crm-categorie-prospect';
      case 'partenaire': return 'ms-crm-categorie-partenaire';
      default: return 'ms-crm-categorie-default';
    }
  };

  const getCategorieIcon = (categorie?: string) => {
    switch (categorie) {
      case 'client': return '💼';
      case 'fournisseur': return '🚚';
      case 'prospect': return '🔍';
      case 'partenaire': return '🤝';
      default: return '🏢';
    }
  };

  const filteredClients = clients.filter(client =>
    client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.responsable_commercial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="ms-crm-loading">
        <div className="ms-crm-spinner"></div>
        <span>Chargement des clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ms-crm-error-state">
        <div className="ms-crm-error-icon">⚠</div>
        <h2>Erreur</h2>
        <p>{error}</p>
        <button 
          onClick={loadClients}
          className="ms-crm-btn ms-crm-btn-primary"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="ms-crm-container">
      {/* Header Microsoft Style */}
      <div className="ms-crm-header">
        <div className="ms-crm-header-left">
          <div className="ms-crm-title-section">
            <h1 className="ms-crm-page-title">👥 Clients</h1>
            <p className="ms-crm-subtitle">Gestion de votre portefeuille clients et partenaires</p>
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <Link 
            to="/crm/clients/nouveau"
            className="ms-crm-btn ms-crm-btn-primary"
          >
            <span className="ms-crm-icon">➕</span>
            Nouveau client
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ms-crm-content">
        
        {/* Filters and Search Bar */}
        <div className="ms-crm-filters-bar">
          <div className="ms-crm-search-box">
            <span className="ms-crm-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un client, email, responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ms-crm-search-input"
            />
          </div>
          
          <div className="ms-crm-filters">
            <select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              className="ms-crm-filter-select"
            >
              <option value="tous">📋 Tous les clients</option>
              <option value="client">💼 Clients</option>
              <option value="fournisseur">🚚 Fournisseurs</option>
              <option value="prospect">🔍 Prospects</option>
              <option value="partenaire">🤝 Partenaires</option>
            </select>
            
            <div className="ms-crm-stats">
              <span className="ms-crm-stat-badge">
                📊 {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="ms-crm-card">
          <div className="ms-crm-table-container">
            <table className="ms-crm-table">
              <thead>
                <tr>
                  <th className="ms-crm-table-header">Client</th>
                  <th className="ms-crm-table-header">Catégorie</th>
                  <th className="ms-crm-table-header">📞 Contact</th>
                  <th className="ms-crm-table-header">👤 Responsable</th>
                  <th className="ms-crm-table-header ms-crm-text-right">💰 CA Annuel</th>
                  <th className="ms-crm-table-header ms-crm-text-center">⚡ Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id_tiers} className="ms-crm-table-row">
                    <td className="ms-crm-table-cell">
                      <div className="ms-crm-client-info">
                        <div className="ms-crm-client-avatar">
                          {client.nom ? client.nom.charAt(0).toUpperCase() : '🏢'}
                        </div>
                        <div className="ms-crm-client-details">
                          <h3 className="ms-crm-client-name">{client.nom}</h3>
                          <div className="ms-crm-client-meta">
                            {client.siret && (
                              <span className="ms-crm-client-siret">🏷️ {client.siret}</span>
                            )}
                            {client.forme_juridique && (
                              <span className="ms-crm-client-legal">📝 {client.forme_juridique}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="ms-crm-table-cell">
                      <div className="ms-crm-categorie-info">
                        <span className="ms-crm-categorie-icon">
                          {getCategorieIcon(client.categorie)}
                        </span>
                        <span className={`ms-crm-categorie-badge ${getCategorieColor(client.categorie)}`}>
                          {client.categorie || 'Non défini'}
                        </span>
                      </div>
                    </td>
                    <td className="ms-crm-table-cell">
                      <div className="ms-crm-contact-info">
                        {client.email && (
                          <a 
                            href={`mailto:${client.email}`}
                            className="ms-crm-contact-email"
                          >
                            📧 {client.email}
                          </a>
                        )}
                        {client.telephone && (
                          <a 
                            href={`tel:${client.telephone}`}
                            className="ms-crm-contact-phone"
                          >
                            📞 {client.telephone}
                          </a>
                        )}
                        {!client.email && !client.telephone && (
                          <span className="ms-crm-no-contact">📭 Non renseigné</span>
                        )}
                      </div>
                    </td>
                    <td className="ms-crm-table-cell">
                      <div className="ms-crm-responsable-info">
                        {client.responsable_commercial ? (
                          <>
                            <span className="ms-crm-responsable-avatar">
                              {client.responsable_commercial.charAt(0).toUpperCase()}
                            </span>
                            <span className="ms-crm-responsable-name">
                              {client.responsable_commercial}
                            </span>
                          </>
                        ) : (
                          <span className="ms-crm-no-responsable">👤 Non assigné</span>
                        )}
                      </div>
                    </td>
                    <td className="ms-crm-table-cell ms-crm-text-right">
                      <div className="ms-crm-financial-info">
                        {client.chiffre_affaires_annuel ? (
                          <>
                            <div className="ms-crm-ca-amount">
                              {new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(client.chiffre_affaires_annuel)}
                            </div>
                            {client.effectif && (
                              <div className="ms-crm-effectif">
                                👥 {client.effectif} personne{client.effectif > 1 ? 's' : ''}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="ms-crm-no-ca">💰 Non renseigné</span>
                        )}
                      </div>
                    </td>
                    <td className="ms-crm-table-cell ms-crm-text-center">
                      <div className="ms-crm-actions-container">
                        <Link
                          to={`/crm/clients/${client.id_tiers}`}
                          className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-view"
                          title="Voir la fiche client"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/crm/clients/${client.id_tiers}/modifier`}
                          className="ms-crm-btn ms-crm-btn-icon ms-crm-btn-edit"
                          title="Modifier le client"
                        >
                          ✏️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredClients.length === 0 && (
              <div className="ms-crm-empty-state">
                <div className="ms-crm-empty-icon">👥</div>
                <h3>Aucun client trouvé</h3>
                <p>
                  {searchTerm || categorieFilter !== 'tous' 
                    ? 'Aucun client ne correspond à vos critères de recherche.'
                    : 'Commencez par ajouter vos premiers clients à votre portefeuille.'
                  }
                </p>
                {!searchTerm && categorieFilter === 'tous' && (
                  <Link 
                    to="/crm/clients/nouveau"
                    className="ms-crm-btn ms-crm-btn-primary"
                  >
                    <span className="ms-crm-icon">➕</span>
                    Ajouter votre premier client
                  </Link>
                )}
                {(searchTerm || categorieFilter !== 'tous') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setCategorieFilter('tous');
                    }}
                    className="ms-crm-btn ms-crm-btn-secondary"
                  >
                    🔄 Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {filteredClients.length > 0 && (
          <div className="ms-crm-stats-grid">
            <div className="ms-crm-stat-card">
              <div className="ms-crm-stat-icon">💼</div>
              <div className="ms-crm-stat-content">
                <div className="ms-crm-stat-value">
                  {clients.filter(c => c.categorie === 'client').length}
                </div>
                <div className="ms-crm-stat-label">Clients</div>
              </div>
            </div>
            <div className="ms-crm-stat-card">
              <div className="ms-crm-stat-icon">🔍</div>
              <div className="ms-crm-stat-content">
                <div className="ms-crm-stat-value">
                  {clients.filter(c => c.categorie === 'prospect').length}
                </div>
                <div className="ms-crm-stat-label">Prospects</div>
              </div>
            </div>
            <div className="ms-crm-stat-card">
              <div className="ms-crm-stat-icon">🚚</div>
              <div className="ms-crm-stat-content">
                <div className="ms-crm-stat-value">
                  {clients.filter(c => c.categorie === 'fournisseur').length}
                </div>
                <div className="ms-crm-stat-label">Fournisseurs</div>
              </div>
            </div>
            <div className="ms-crm-stat-card">
              <div className="ms-crm-stat-icon">🤝</div>
              <div className="ms-crm-stat-content">
                <div className="ms-crm-stat-value">
                  {clients.filter(c => c.categorie === 'partenaire').length}
                </div>
                <div className="ms-crm-stat-label">Partenaires</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsListPage;