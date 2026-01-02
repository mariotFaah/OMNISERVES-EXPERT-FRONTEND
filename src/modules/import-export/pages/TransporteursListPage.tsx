import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Transporteur } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './TransporteursListPage.css';

const TransporteursListPage: React.FC = () => {
  const [transporteurs, setTransporteurs] = useState<Transporteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    loadTransporteurs();
  }, []);

  const loadTransporteurs = async () => {
    try {
      setLoading(true);
      const data = await importExportApi.getTransporteurs();
      setTransporteurs(data);
    } catch (error) {
      console.error('Erreur chargement transporteurs:', error);
      alert('Erreur lors du chargement des transporteurs', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let data: Transporteur[];
      
      if (searchTerm.trim()) {
        data = await importExportApi.searchTransporteurs(searchTerm);
      } else if (filterType) {
        data = await importExportApi.getTransporteursByType(filterType);
      } else {
        data = await importExportApi.getTransporteurs();
      }
      
      setTransporteurs(data);
    } catch (error) {
      console.error('Erreur recherche transporteurs:', error);
      alert('Erreur lors de la recherche', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transporteur: Transporteur) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le transporteur "${transporteur.nom}" ?`)) {
      return;
    }

    try {
      await importExportApi.deleteTransporteur(transporteur.id);
      alert('Transporteur supprimé avec succès', {
        type: 'success',
        title: 'Succès'
      });
      loadTransporteurs();
    } catch (error) {
      console.error('Erreur suppression transporteur:', error);
      alert('Erreur lors de la suppression du transporteur', {
        type: 'error',
        title: 'Erreur'
      });
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'maritime': return 'type-badge maritime';
      case 'aerien': return 'type-badge aerien';
      case 'terrestre': return 'type-badge terrestre';
      default: return 'type-badge default';
    }
  };

  const filteredTransporteurs = transporteurs.filter(transporteur => {
    const matchesSearch = transporteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transporteur.code_transporteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transporteur.contact && transporteur.contact.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !filterType || transporteur.type_transport === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="transporteurs-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="transporteurs-container">
      <div className="transporteurs-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Gestion des Transporteurs</h1>
            <p>Liste et gestion de tous les transporteurs partenaires</p>
          </div>
          <div className="header-actions">
            <Link to="/import-export/transporteurs/nouveau" className="btn-primary">
              ➕ Nouveau Transporteur
            </Link>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un transporteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              🔍
            </button>
          </div>

          <div className="filter-group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les types</option>
              <option value="maritime">Maritime</option>
              <option value="aerien">Aérien</option>
              <option value="terrestre">Terrestre</option>
              <option value="multimodal">Multimodal</option>
            </select>
            <button onClick={handleSearch} className="filter-btn">
              Filtrer
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-number">{transporteurs.length}</div>
            <div className="stat-label">Total Transporteurs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {transporteurs.filter(t => t.type_transport === 'maritime').length}
            </div>
            <div className="stat-label">Maritimes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {transporteurs.filter(t => t.type_transport === 'aerien').length}
            </div>
            <div className="stat-label">Aériens</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {transporteurs.filter(t => t.type_transport === 'terrestre').length}
            </div>
            <div className="stat-label">Terrestres</div>
          </div>
        </div>

        {/* Liste des transporteurs */}
        <div className="transporteurs-list">
          {filteredTransporteurs.length === 0 ? (
            <div className="empty-state">
              <h3>Aucun transporteur trouvé</h3>
              <p>Aucun transporteur ne correspond à vos critères de recherche.</p>
              <Link to="/import-export/transporteurs/nouveau" className="btn-primary">
                Créer le premier transporteur
              </Link>
            </div>
          ) : (
            <div className="transporteurs-grid">
              {filteredTransporteurs.map(transporteur => (
                <div key={transporteur.id} className="transporteur-card">
                  <div className="transporteur-header">
                    <h3 className="transporteur-nom">{transporteur.nom}</h3>
                    <span className={getTypeBadgeClass(transporteur.type_transport)}>
                      {transporteur.type_transport}
                    </span>
                  </div>
                  
                  <div className="transporteur-code">
                    Code: <strong>{transporteur.code_transporteur}</strong>
                  </div>

                  <div className="transporteur-info">
                    {transporteur.contact && (
                      <div className="info-item">
                        <span className="info-label">Contact:</span>
                        <span className="info-value">{transporteur.contact}</span>
                      </div>
                    )}
                    
                    {transporteur.email && (
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{transporteur.email}</span>
                      </div>
                    )}
                    
                    {transporteur.telephone && (
                      <div className="info-item">
                        <span className="info-label">Téléphone:</span>
                        <span className="info-value">{transporteur.telephone}</span>
                      </div>
                    )}
                  </div>

                  {transporteur.adresse && (
                    <div className="transporteur-adresse">
                      <span className="info-label">Adresse:</span>
                      <span className="info-value">{transporteur.adresse}</span>
                    </div>
                  )}

                  <div className="transporteur-actions">
                    <Link 
                      to={`/import-export/transporteurs/${transporteur.id}/modifier`}
                      className="btn-edit"
                    >
                      ✏️ Modifier
                    </Link>
                    <button 
                      onClick={() => handleDelete(transporteur)}
                      className="btn-delete"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        isOpen={isOpen}
        title={title}
        message={message}
        type={type}
        onClose={close}
      />
    </div>
  );
};

export default TransporteursListPage;