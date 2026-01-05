import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Transporteur } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import {
  FiTruck,
  FiGlobe,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiCode,
  FiActivity
} from 'react-icons/fi';
import {  MdOutlineFlight } from 'react-icons/md';
import { HiOutlineTruck } from 'react-icons/hi';
import { FaShip } from 'react-icons/fa';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maritime': return <FaShip className="type-icon" />;
      case 'aerien': return <MdOutlineFlight className="type-icon" />;
      case 'terrestre': return <HiOutlineTruck className="type-icon" />;
      case 'multimodal': return <FiGlobe className="type-icon" />;
      default: return <FiTruck className="type-icon" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'maritime': return 'type-badge maritime';
      case 'aerien': return 'type-badge aerien';
      case 'terrestre': return 'type-badge terrestre';
      case 'multimodal': return 'type-badge multimodal';
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
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des transporteurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transporteurs-container">
      <div className="transporteurs-content">
        {/* Header avec navigation */}
        <div className="page-header sage-header">
          <div className="header-left">
            <h1 className="page-title">
              <FiTruck className="title-icon" />
              Gestion des Transporteurs
            </h1>
            <p className="page-subtitle">Liste et gestion de tous les transporteurs partenaires</p>
          </div>
          <div className="header-actions">
            <Link to="/import-export/transporteurs/nouveau" className="btn-primary sage-btn-primary">
              <FiPlus className="btn-icon" />
              Nouveau Transporteur
            </Link>
          </div>
        </div>

        {/* Filtres et recherche - Style Microsoft Sage */}
        <div className="filters-section sage-filters">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un transporteur par nom, code ou contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="sage-search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    loadTransporteurs();
                  }} 
                  className="clear-search-btn"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="filter-container">
            <div className="filter-wrapper">
              <FiFilter className="filter-icon" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="sage-filter-select"
              >
                <option value="">Tous les types de transport</option>
                <option value="maritime">Transport maritime</option>
                <option value="aerien">Transport aérien</option>
                <option value="terrestre">Transport terrestre</option>
                <option value="multimodal">Transport multimodal</option>
              </select>
            </div>
            <button onClick={handleSearch} className="sage-filter-btn">
              Appliquer les filtres
            </button>
          </div>
        </div>

        {/* Statistiques - Cards style Microsoft Sage */}
        <div className="stats-container sage-stats">
          <div className="stats-grid">
            <div className="sage-stat-card total">
              <div className="stat-icon-container">
                <FiTruck className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">{transporteurs.length}</div>
                <div className="stat-label">Total Transporteurs</div>
              </div>
            </div>
            
            <div className="sage-stat-card maritime">
              <div className="stat-icon-container">
                <FaShip className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {transporteurs.filter(t => t.type_transport === 'maritime').length}
                </div>
                <div className="stat-label">Maritimes</div>
              </div>
            </div>
            
            <div className="sage-stat-card aerien">
              <div className="stat-icon-container">
                <MdOutlineFlight className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {transporteurs.filter(t => t.type_transport === 'aerien').length}
                </div>
                <div className="stat-label">Aériens</div>
              </div>
            </div>
            
            <div className="sage-stat-card terrestre">
              <div className="stat-icon-container">
                <HiOutlineTruck className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {transporteurs.filter(t => t.type_transport === 'terrestre').length}
                </div>
                <div className="stat-label">Terrestres</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des transporteurs - Tableau style Microsoft Sage */}
        <div className="transporteurs-table-container">
          <div className="table-header sage-table-header">
            <div className="table-title">
              <h3>
                <FiActivity className="table-title-icon" />
                Liste des Transporteurs ({filteredTransporteurs.length})
              </h3>
            </div>
            <div className="table-actions">
              <span className="results-count">
                Affichage de {filteredTransporteurs.length} sur {transporteurs.length} transporteurs
              </span>
            </div>
          </div>

          {filteredTransporteurs.length === 0 ? (
            <div className="sage-empty-state">
              <div className="empty-icon">
                <FiTruck />
              </div>
              <h3>Aucun transporteur trouvé</h3>
              <p>Aucun transporteur ne correspond à vos critères de recherche.</p>
              <Link to="/import-export/transporteurs/nouveau" className="btn-primary sage-btn-primary">
                <FiPlus className="btn-icon" />
                Créer un nouveau transporteur
              </Link>
            </div>
          ) : (
            <div className="sage-table-wrapper">
              <table className="sage-table">
                <thead>
                  <tr>
                    <th className="col-nom">
                      <FiUser className="th-icon" />
                      Nom du Transporteur
                    </th>
                    <th className="col-code">
                      <FiCode className="th-icon" />
                      Code
                    </th>
                    <th className="col-type">
                      <FiGlobe className="th-icon" />
                      Type
                    </th>
                    <th className="col-contact">
                      <FiUser className="th-icon" />
                      Contact
                    </th>
                    <th className="col-coordonnees">
                      <FiMail className="th-icon" />
                      Coordonnées
                    </th>
                    <th className="col-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransporteurs.map(transporteur => (
                    <tr key={transporteur.id} className="sage-table-row">
                      <td className="col-nom">
                        <div className="transporteur-info-cell">
                          <div className="transporteur-avatar">
                            {getTypeIcon(transporteur.type_transport)}
                          </div>
                          <div className="transporteur-details">
                            <div className="transporteur-nom">{transporteur.nom}</div>
                            {transporteur.adresse && (
                              <div className="transporteur-adresse-small">
                                <FiMapPin className="small-icon" />
                                {transporteur.adresse.length > 50 
                                  ? `${transporteur.adresse.substring(0, 50)}...` 
                                  : transporteur.adresse}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="col-code">
                        <span className="code-badge">
                          {transporteur.code_transporteur}
                        </span>
                      </td>
                      <td className="col-type">
                        <span className={getTypeBadgeClass(transporteur.type_transport)}>
                          {getTypeIcon(transporteur.type_transport)}
                          {transporteur.type_transport}
                        </span>
                      </td>
                      <td className="col-contact">
                        {transporteur.contact ? (
                          <div className="contact-info">
                            <FiUser className="contact-icon" />
                            <span>{transporteur.contact}</span>
                          </div>
                        ) : (
                          <span className="empty-field">Non renseigné</span>
                        )}
                      </td>
                      <td className="col-coordonnees">
                        <div className="coordonnees-grid">
                          {transporteur.email && (
                            <div className="coordonnee-item">
                              <FiMail className="coordonnee-icon" />
                              <span className="coordonnee-value">{transporteur.email}</span>
                            </div>
                          )}
                          {transporteur.telephone && (
                            <div className="coordonnee-item">
                              <FiPhone className="coordonnee-icon" />
                              <span className="coordonnee-value">{transporteur.telephone}</span>
                            </div>
                          )}
                          {!transporteur.email && !transporteur.telephone && (
                            <span className="empty-field">Aucune coordonnée</span>
                          )}
                        </div>
                      </td>
                      <td className="col-actions">
                        <div className="action-buttons">
                          <Link 
                            to={`/import-export/transporteurs/${transporteur.id}/modifier`}
                            className="btn-action btn-edit"
                            title="Modifier"
                          >
                            <FiEdit />
                          </Link>
                          <button 
                            onClick={() => handleDelete(transporteur)}
                            className="btn-action btn-delete"
                            title="Supprimer"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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