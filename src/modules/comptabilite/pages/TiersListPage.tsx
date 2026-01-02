import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit } from 'react-icons/fi';
import './TiersListPage.css';
import { comptabiliteApi } from '../services/api';
import type { Tiers } from '../types';
import { TiersFormModal } from './TiersFormModal';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';

export const TiersListPage: React.FC = () => {
  const [tiers, setTiers] = useState<Tiers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTiers, setSelectedTiers] = useState<Tiers | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Utilisation du hook AlertDialog
  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      setLoading(true);
      const data = await comptabiliteApi.getTiers();
      console.log('📋 Tiers chargés:', data);
      setTiers(data);
    } catch (err) {
      console.error('Erreur lors du chargement des tiers:', err);
      setTiers([]);
      // Remplacement de l'alerte
      alert('Erreur lors du chargement des clients/fournisseurs', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tiers: Tiers) => {
    setSelectedTiers(tiers);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedTiers(null);
    setShowModal(true);
  };

  if (loading) {
    return <div className="tiers-loading">Chargement des données...</div>;
  }

  return (
    <div className="tiers-page">
      <div className="tiers-header">
        <div>
          <h1 className="tiers-title">Clients & Fournisseurs</h1>
          <p className="tiers-subtitle">Gérez vos contacts (clients et fournisseurs)</p>
        </div>
        <button className="tiers-add-btn" onClick={handleAdd}>
          <FiPlus className="btn-icon" />
          Nouveau
        </button>
      </div>

      <div className="tiers-table-container">
        <table className="tiers-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map(t => (
              <tr key={t.id_tiers}>
                <td>{t.nom}</td>
                <td>{t.type_tiers}</td>
                <td>{t.email}</td>
                <td>{t.telephone}</td>
                <td>{t.adresse}</td>
                <td className="tiers-actions">
                  <button 
                    className="tiers-edit-btn" 
                    onClick={() => handleEdit(t)}
                    title="Modifier"
                  >
                    <FiEdit className="btn-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tiers.length === 0 && <div className="tiers-empty">Aucun client ni fournisseur trouvé.</div>}
      </div>

      {showModal && (
        <TiersFormModal
          tiers={selectedTiers}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadTiers();
          }}
        />
      )}

      {/* Composant AlertDialog */}
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