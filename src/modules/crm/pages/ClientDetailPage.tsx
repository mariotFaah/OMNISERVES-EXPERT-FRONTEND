// src/modules/crm/pages/ClientDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Client } from '../types';
import './ClientDetailPage.css';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'infos' | 'contacts' | 'devis' | 'activites'>('infos');

  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await crmApi.getClient(parseInt(id!));
      setClient(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ms-crm-loading">
        <div className="ms-crm-spinner"></div>
        <span>Chargement du client...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ms-crm-error-state">
        <div className="ms-crm-error-icon">⚠</div>
        <h2>Erreur</h2>
        <p>{error}</p>
        <Link to="/crm/clients" className="ms-crm-btn ms-crm-btn-primary">
          Retour aux clients
        </Link>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="ms-crm-error-state">
        <div className="ms-crm-error-icon">❌</div>
        <h2>Client non trouvé</h2>
        <p>Le client demandé n'existe pas ou a été supprimé.</p>
        <Link to="/crm/clients" className="ms-crm-btn ms-crm-btn-primary">
          Retour aux clients
        </Link>
      </div>
    );
  }

  return (
    <div className="ms-crm-container">
      {/* Header Microsoft Style */}
      <div className="ms-crm-header">
        <div className="ms-crm-header-left">
          <Link to="/crm/clients" className="ms-crm-back-button">
            <span className="ms-crm-back-icon">←</span>
            Retour aux clients
          </Link>
          <div className="ms-crm-title-section">
            <h1 className="ms-crm-page-title">{client.nom}</h1>
            <div className="ms-crm-client-subtitle">
              <span className="ms-crm-client-email">{client.email}</span>
              <span className="ms-crm-separator">•</span>
              <span className="ms-crm-client-phone">{client.telephone}</span>
              {client.adresse && (
                <>
                  <span className="ms-crm-separator">•</span>
                  <span className="ms-crm-client-address">{client.adresse}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="ms-crm-header-actions">
          <Link 
            to={`/crm/clients/${client.id_tiers}/modifier`}
            className="ms-crm-btn ms-crm-btn-secondary"
          >
            Modifier
          </Link>
          <button className="ms-crm-btn ms-crm-btn-primary">
            <span className="ms-crm-icon">➕</span>
            Nouvelle activité
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ms-crm-content">
        <div className="ms-crm-detail-layout">
          
          {/* Left Column - Main Content */}
          <div className="ms-crm-detail-main">
            
            {/* Client Summary Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h2 className="ms-crm-card-title">Aperçu du client</h2>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-client-summary">
                  <div className="ms-crm-summary-item">
                    <span className="ms-crm-summary-label">Responsable commercial</span>
                    <span className="ms-crm-summary-value">
                      {client.responsable_commercial || 'Non assigné'}
                    </span>
                  </div>
                  <div className="ms-crm-summary-item">
                    <span className="ms-crm-summary-label">Catégorie</span>
                    <span className={`ms-crm-summary-value ms-crm-category-${client.categorie}`}>
                      {client.categorie || 'Non définie'}
                    </span>
                  </div>
                  <div className="ms-crm-summary-item">
                    <span className="ms-crm-summary-label">Date premier contact</span>
                    <span className="ms-crm-summary-value">
                      {client.date_premier_contact 
                        ? new Date(client.date_premier_contact).toLocaleDateString('fr-FR')
                        : 'Non renseignée'
                      }
                    </span>
                  </div>
                  <div className="ms-crm-summary-item">
                    <span className="ms-crm-summary-label">Dernière activité</span>
                    <span className="ms-crm-summary-value">
                      {client.date_derniere_activite 
                        ? new Date(client.date_derniere_activite).toLocaleDateString('fr-FR')
                        : 'Aucune activité'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="ms-crm-card">
              <div className="ms-crm-tab-navigation">
                {[
                  { id: 'infos', label: 'Informations', count: null },
                  { id: 'contacts', label: 'Contacts', count: client.contacts?.length || 0 },
                  { id: 'devis', label: 'Devis', count: client.devis?.length || 0 },
                  { id: 'activites', label: 'Activités', count: client.activites?.length || 0 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`ms-crm-tab ${activeTab === tab.id ? 'ms-crm-tab-active' : ''}`}
                  >
                    <span className="ms-crm-tab-label">{tab.label}</span>
                    {tab.count !== null && (
                      <span className="ms-crm-tab-count">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="ms-crm-tab-content">
                
                {/* Informations Tab */}
                {activeTab === 'infos' && (
                  <div className="ms-crm-info-grid">
                    <div className="ms-crm-info-section">
                      <h3 className="ms-crm-section-title">Informations générales</h3>
                      <div className="ms-crm-info-list">
                        <div className="ms-crm-info-item">
                          <label className="ms-crm-info-label">SIRET</label>
                          <span className="ms-crm-info-value">{client.siret || 'Non renseigné'}</span>
                        </div>
                        <div className="ms-crm-info-item">
                          <label className="ms-crm-info-label">Forme juridique</label>
                          <span className="ms-crm-info-value">{client.forme_juridique || 'Non renseigné'}</span>
                        </div>
                        <div className="ms-crm-info-item">
                          <label className="ms-crm-info-label">Secteur d'activité</label>
                          <span className="ms-crm-info-value">{client.secteur_activite || 'Non renseigné'}</span>
                        </div>
                        <div className="ms-crm-info-item">
                          <label className="ms-crm-info-label">Site web</label>
                          <span className="ms-crm-info-value">
                            {client.site_web ? (
                              <a href={client.site_web} target="_blank" rel="noopener noreferrer" className="ms-crm-link">
                                {client.site_web}
                              </a>
                            ) : 'Non renseigné'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ms-crm-info-section">
                      <h3 className="ms-crm-section-title">Données commerciales</h3>
                      <div className="ms-crm-info-list">
                        <div className="ms-crm-info-item">
                          <label className="ms-crm-info-label">Chiffre d'affaires annuel</label>
                          <span className="ms-crm-info-value ms-crm-amount">
                            {client.chiffre_affaires_annuel ? 
                              new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(client.chiffre_affaires_annuel)
                              : 'Non renseigné'
                            }
                          </span>
                        </div>
                        <div className="ms-crm-info-item">
                          <label className="ms-crm-info-label">Effectif</label>
                          <span className="ms-crm-info-value">
                            {client.effectif ? `${client.effectif} personnes` : 'Non renseigné'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {client.notes && (
                      <div className="ms-crm-info-section">
                        <h3 className="ms-crm-section-title">Notes</h3>
                        <div className="ms-crm-notes">
                          {client.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                  <div className="ms-crm-tab-panel">
                    <div className="ms-crm-panel-header">
                      <h3 className="ms-crm-panel-title">Contacts</h3>
                      <button className="ms-crm-btn ms-crm-btn-primary ms-crm-btn-small">
                        <span className="ms-crm-icon">👤</span>
                        Ajouter un contact
                      </button>
                    </div>
                    
                    <div className="ms-crm-list">
                      {client.contacts?.map((contact) => (
                        <div key={contact.id_contact} className="ms-crm-list-item">
                          <div className="ms-crm-list-item-content">
                            <div className="ms-crm-contact-header">
                              <h4 className="ms-crm-contact-name">
                                {contact.prenom} {contact.nom}
                                {contact.principal && (
                                  <span className="ms-crm-badge ms-crm-badge-primary">Principal</span>
                                )}
                              </h4>
                              <div className="ms-crm-contact-actions">
                                <button className="ms-crm-btn ms-crm-btn-text">Modifier</button>
                                <button className="ms-crm-btn ms-crm-btn-text ms-crm-btn-danger">Supprimer</button>
                              </div>
                            </div>
                            <div className="ms-crm-contact-details">
                              {contact.fonction && (
                                <span className="ms-crm-contact-function">{contact.fonction}</span>
                              )}
                              {contact.email && (
                                <a href={`mailto:${contact.email}`} className="ms-crm-contact-email">
                                  {contact.email}
                                </a>
                              )}
                              {contact.telephone && (
                                <a href={`tel:${contact.telephone}`} className="ms-crm-contact-phone">
                                  {contact.telephone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!client.contacts || client.contacts.length === 0) && (
                        <div className="ms-crm-empty-state">
                          <div className="ms-crm-empty-icon">👤</div>
                          <h4>Aucun contact</h4>
                          <p>Commencez par ajouter des contacts à ce client.</p>
                          <button className="ms-crm-btn ms-crm-btn-primary">
                            Ajouter un contact
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Devis Tab */}
                {activeTab === 'devis' && (
                  <div className="ms-crm-tab-panel">
                    <div className="ms-crm-panel-header">
                      <h3 className="ms-crm-panel-title">Devis</h3>
                      <Link 
                        to={`/crm/devis/nouveau?client=${client.id_tiers}`}
                        className="ms-crm-btn ms-crm-btn-primary ms-crm-btn-small"
                      >
                        <span className="ms-crm-icon">📄</span>
                        Créer un devis
                      </Link>
                    </div>
                    
                    <div className="ms-crm-list">
                      {client.devis?.map((devis) => (
                        <div key={devis.id_devis} className="ms-crm-list-item">
                          <div className="ms-crm-list-item-content">
                            <div className="ms-crm-devis-header">
                              <div className="ms-crm-devis-info">
                                <h4 className="ms-crm-devis-number">{devis.numero_devis}</h4>
                                <p className="ms-crm-devis-object">{devis.objet}</p>
                                <div className="ms-crm-devis-meta">
                                  <span>Émis le {new Date(devis.date_devis).toLocaleDateString('fr-FR')}</span>
                                  <span className="ms-crm-separator">•</span>
                                  <span className="ms-crm-amount">
                                    {new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(devis.montant_ht)}
                                  </span>
                                </div>
                              </div>
                              <div className="ms-crm-devis-actions">
                                <span className={`ms-crm-status-badge ms-crm-status-${devis.statut}`}>
                                  {devis.statut}
                                </span>
                                <Link
                                  to={`/crm/devis/${devis.id_devis}`}
                                  className="ms-crm-btn ms-crm-btn-text"
                                >
                                  Voir
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!client.devis || client.devis.length === 0) && (
                        <div className="ms-crm-empty-state">
                          <div className="ms-crm-empty-icon">📄</div>
                          <h4>Aucun devis</h4>
                          <p>Créez le premier devis pour ce client.</p>
                          <Link 
                            to={`/crm/devis/nouveau?client=${client.id_tiers}`}
                            className="ms-crm-btn ms-crm-btn-primary"
                          >
                            Créer un devis
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Activités Tab */}
                {activeTab === 'activites' && (
                  <div className="ms-crm-tab-panel">
                    <div className="ms-crm-panel-header">
                      <h3 className="ms-crm-panel-title">Activités</h3>
                      <Link 
                        to={`/crm/activites/nouveau?client=${client.id_tiers}`}
                        className="ms-crm-btn ms-crm-btn-primary ms-crm-btn-small"
                      >
                        <span className="ms-crm-icon">📝</span>
                        Ajouter une activité
                      </Link>
                    </div>
                    
                    <div className="ms-crm-list">
                      {client.activites?.map((activite) => (
                        <div key={activite.id_activite} className="ms-crm-list-item">
                          <div className="ms-crm-list-item-content">
                            <div className="ms-crm-activity-header">
                              <div className="ms-crm-activity-info">
                                <h4 className="ms-crm-activity-subject">{activite.sujet}</h4>
                                <p className="ms-crm-activity-type">{activite.type_activite}</p>
                                <div className="ms-crm-activity-meta">
                                  <span>{new Date(activite.date_activite).toLocaleString('fr-FR')}</span>
                                  {activite.description && (
                                    <>
                                      <span className="ms-crm-separator">•</span>
                                      <span className="ms-crm-activity-description">
                                        {activite.description}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="ms-crm-activity-badges">
                                <span className={`ms-crm-priority-badge ms-crm-priority-${activite.priorite}`}>
                                  {activite.priorite}
                                </span>
                                <span className={`ms-crm-status-badge ms-crm-status-${activite.statut}`}>
                                  {activite.statut}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!client.activites || client.activites.length === 0) && (
                        <div className="ms-crm-empty-state">
                          <div className="ms-crm-empty-icon">📝</div>
                          <h4>Aucune activité</h4>
                          <p>Enregistrez la première activité avec ce client.</p>
                          <Link 
                            to={`/crm/activites/nouveau?client=${client.id_tiers}`}
                            className="ms-crm-btn ms-crm-btn-primary"
                          >
                            Ajouter une activité
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="ms-crm-detail-sidebar">
            
            {/* Quick Actions Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h3 className="ms-crm-card-title">Actions rapides</h3>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-quick-actions">
                  <Link 
                    to={`/crm/devis/nouveau?client=${client.id_tiers}`}
                    className="ms-crm-quick-action"
                  >
                    <span className="ms-crm-quick-action-icon">📄</span>
                    <span className="ms-crm-quick-action-text">Nouveau devis</span>
                  </Link>
                  <Link 
                    to={`/crm/activites/nouveau?client=${client.id_tiers}`}
                    className="ms-crm-quick-action"
                  >
                    <span className="ms-crm-quick-action-icon">📝</span>
                    <span className="ms-crm-quick-action-text">Nouvelle activité</span>
                  </Link>
                  <button className="ms-crm-quick-action">
                    <span className="ms-crm-quick-action-icon">👤</span>
                    <span className="ms-crm-quick-action-text">Ajouter contact</span>
                  </button>
                  <button className="ms-crm-quick-action">
                    <span className="ms-crm-quick-action-icon">📧</span>
                    <span className="ms-crm-quick-action-text">Envoyer email</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Business Metrics Card */}
            <div className="ms-crm-card">
              <div className="ms-crm-card-header">
                <h3 className="ms-crm-card-title">Indicateurs</h3>
              </div>
              <div className="ms-crm-card-content">
                <div className="ms-crm-metrics">
                  <div className="ms-crm-metric">
                    <span className="ms-crm-metric-value">{client.devis?.length || 0}</span>
                    <span className="ms-crm-metric-label">Devis</span>
                  </div>
                  <div className="ms-crm-metric">
                    <span className="ms-crm-metric-value">{client.contacts?.length || 0}</span>
                    <span className="ms-crm-metric-label">Contacts</span>
                  </div>
                  <div className="ms-crm-metric">
                    <span className="ms-crm-metric-value">{client.activites?.length || 0}</span>
                    <span className="ms-crm-metric-label">Activités</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;