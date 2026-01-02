import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { importExportApi } from '../services/api';
import type { Commande, ExpeditionFormData, Transporteur } from '../types';
import { useAlertDialog } from '../../../core/hooks/useAlertDialog';
import AlertDialog from '../../../core/components/AlertDialog/AlertDialog';
import './ExpeditionFormPage.css';

const ExpeditionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [transporteurs, setTransporteurs] = useState<Transporteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nextNumbers, setNextNumbers] = useState({
    bl: 1,
    con: 1,
    pl: 1
  });

  const [formData, setFormData] = useState<ExpeditionFormData>({
    commande_id: parseInt(id!),
    numero_bl: '',
    numero_connaissement: '',
    numero_packing_list: '',
    date_expedition: '',
    date_arrivee_prevue: '',
    transporteur: '',
    transporteur_id: undefined,
    mode_transport: '',
    instructions_speciales: '',
    statut: 'preparation'
  });

  const { isOpen, message, title, type, alert, close } = useAlertDialog();

  useEffect(() => {
    loadCommande();
    loadTransporteurs();
    generateNextNumbers();
  }, [id]);

  const loadCommande = async () => {
    try {
      const data = await importExportApi.getCommande(parseInt(id!));
      setCommande(data);
      
      if (data.expedition) {
        setFormData(prev => ({
          ...prev,
          numero_bl: data.expedition!.numero_bl || '',
          numero_connaissement: data.expedition!.numero_connaissement || '',
          numero_packing_list: data.expedition!.numero_packing_list || '',
          date_expedition: data.expedition!.date_expedition ? data.expedition!.date_expedition.split('T')[0] : '',
          date_arrivee_prevue: data.expedition!.date_arrivee_prevue ? data.expedition!.date_arrivee_prevue.split('T')[0] : '',
          transporteur: data.expedition!.transporteur || '',
          transporteur_id: data.expedition!.transporteur_id || undefined,
          mode_transport: data.expedition!.mode_transport || '',
          instructions_speciales: data.expedition!.instructions_speciales || '',
          statut: data.expedition!.statut
        }));
      } else {
        // Auto-générer les numéros seulement pour une nouvelle expédition
        generateDefaultNumbers();
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      alert('Erreur lors du chargement de la commande', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransporteurs = async () => {
    try {
      const transporteursData = await importExportApi.getTransporteurs();
      setTransporteurs(transporteursData);
    } catch (error) {
      console.error('Erreur chargement transporteurs:', error);
      alert('Erreur lors du chargement des transporteurs', {
        type: 'error',
        title: 'Erreur'
      });
    }
  };

  const generateNextNumbers = async () => {
    try {
      // Récupérer les dernières expéditions pour générer les numéros suivants
      const expeditions = await importExportApi.getExpeditions();
      
      let maxBL = 0;
      let maxCON = 0;
      let maxPL = 0;

      expeditions.forEach(exp => {
        // Extraire le numéro de BL
        if (exp.numero_bl && exp.numero_bl.startsWith('BL-')) {
          const num = parseInt(exp.numero_bl.replace('BL-', ''));
          if (num > maxBL) maxBL = num;
        }
        // Extraire le numéro de CON
        if (exp.numero_connaissement && exp.numero_connaissement.startsWith('CON-')) {
          const num = parseInt(exp.numero_connaissement.replace('CON-', ''));
          if (num > maxCON) maxCON = num;
        }
        // Extraire le numéro de PL
        if (exp.numero_packing_list && exp.numero_packing_list.startsWith('PL-')) {
          const num = parseInt(exp.numero_packing_list.replace('PL-', ''));
          if (num > maxPL) maxPL = num;
        }
      });

      setNextNumbers({
        bl: maxBL + 1,
        con: maxCON + 1,
        pl: maxPL + 1
      });

    } catch (error) {
      console.error('Erreur génération numéros:', error);
      // Utiliser des numéros par défaut basés sur l'ID de commande
      setNextNumbers({
        bl: parseInt(id!) * 100 + 1,
        con: parseInt(id!) * 100 + 1,
        pl: parseInt(id!) * 100 + 1
      });
    }
  };

  const generateDefaultNumbers = () => {
    setFormData(prev => ({
      ...prev,
      numero_bl: `BL-${nextNumbers.bl.toString().padStart(6, '0')}`,
      numero_connaissement: `CON-${nextNumbers.con.toString().padStart(6, '0')}`,
      numero_packing_list: `PL-${nextNumbers.pl.toString().padStart(6, '0')}`
    }));
  };

  const handleInputChange = (field: keyof ExpeditionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si on change le transporteur_id, mettre à jour aussi le nom du transporteur
    if (field === 'transporteur_id') {
      const selectedTransporteur = transporteurs.find(t => t.id === parseInt(value));
      if (selectedTransporteur) {
        setFormData(prev => ({
          ...prev,
          transporteur: selectedTransporteur.nom
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Préparer les données pour l'envoi
      const dataToSend = {
        ...formData,
        // S'assurer que transporteur_id est un nombre
        transporteur_id: formData.transporteur_id ? parseInt(formData.transporteur_id as any) : undefined
      };
      
      await importExportApi.updateExpedition(dataToSend);
      
      alert('Expédition enregistrée avec succès!', {
        type: 'success',
        title: 'Succès'
      });
      
      setTimeout(() => {
        navigate(`/import-export/commandes/${id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Erreur sauvegarde expédition:', error);
      alert('Erreur lors de la sauvegarde de l\'expédition', {
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="expedition-form-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="expedition-form-container">
        <div className="empty-state">
          <h2>Commande non trouvée</h2>
          <Link to="/import-export/commandes" className="btn-primary">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="expedition-form-container">
      <div className="expedition-form-content">
        <div className="page-header">
          <div className="header-left">
            <h1>Gestion de l'Expédition</h1>
            <div className="header-subtitle">
              <span className="commande-ref">{commande.numero_commande}</span>
              <span className="separator">•</span>
              <span className="commande-type">
                {commande.type === 'import' ? '📥 Import' : '📤 Export'}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <Link 
              to={`/import-export/commandes/${commande.id}`}
              className="btn-secondary"
            >
              ← Retour à la commande
            </Link>
          </div>
        </div>

        <div className="form-section">
          <div className="form-card">
            <h2>Informations d'Expédition</h2>
            
            <div className="form-grid">
              {/* Statut */}
              <div className="form-group">
                <label>Statut de l'expédition</label>
                <select
                  value={formData.statut}
                  onChange={(e) => handleInputChange('statut', e.target.value)}
                  className="form-input"
                >
                  <option value="preparation">En préparation</option>
                  <option value="expédiée">Expédiée</option>
                  <option value="transit">En transit</option>
                  <option value="arrivée">Arrivée</option>
                  <option value="livrée">Livrée</option>
                </select>
              </div>

              {/* Transporteur - NOUVELLE VERSION AVEC SELECT */}
              <div className="form-group">
                <label>Transporteur</label>
                <select
                  value={formData.transporteur_id || ''}
                  onChange={(e) => handleInputChange('transporteur_id', e.target.value)}
                  className="form-input"
                >
                  <option value="">Sélectionnez un transporteur</option>
                  {transporteurs.map(transporteur => (
                    <option key={transporteur.id} value={transporteur.id}>
                      {transporteur.nom} - {transporteur.type_transport} ({transporteur.code_transporteur})
                    </option>
                  ))}
                </select>
                <small className="field-help">
                  {formData.transporteur_id ? `Transporteur sélectionné: ${formData.transporteur}` : 'Choisissez un transporteur dans la liste'}
                </small>
              </div>

              {/* Mode de transport */}
              <div className="form-group">
                <label>Mode de transport</label>
                <select
                  value={formData.mode_transport}
                  onChange={(e) => handleInputChange('mode_transport', e.target.value)}
                  className="form-input"
                >
                  <option value="">Sélectionnez un mode</option>
                  <option value="maritime">Maritime</option>
                  <option value="aerien">Aérien</option>
                  <option value="terrestre">Terrestre</option>
                  <option value="multimodal">Multimodal</option>
                </select>
              </div>

              {/* Date d'expédition */}
              <div className="form-group">
                <label>Date d'expédition</label>
                <input
                  type="date"
                  value={formData.date_expedition}
                  onChange={(e) => handleInputChange('date_expedition', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Date d'arrivée prévue */}
              <div className="form-group">
                <label>Date d'arrivée prévue</label>
                <input
                  type="date"
                  value={formData.date_arrivee_prevue}
                  onChange={(e) => handleInputChange('date_arrivee_prevue', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Numéro BL */}
              <div className="form-group">
                <label>Numéro de Bon de Livraison</label>
                <input
                  type="text"
                  value={formData.numero_bl}
                  onChange={(e) => handleInputChange('numero_bl', e.target.value)}
                  className="form-input"
                  placeholder="BL-XXXXXX"
                />
                <small className="field-help">
                  Format: BL-000001
                </small>
              </div>

              {/* Numéro connaissement */}
              <div className="form-group">
                <label>Numéro de Connaissement</label>
                <input
                  type="text"
                  value={formData.numero_connaissement}
                  onChange={(e) => handleInputChange('numero_connaissement', e.target.value)}
                  className="form-input"
                  placeholder="CON-XXXXXX"
                />
                <small className="field-help">
                  Format: CON-000001
                </small>
              </div>

              {/* Numéro packing list */}
              <div className="form-group">
                <label>Numéro de Packing List</label>
                <input
                  type="text"
                  value={formData.numero_packing_list}
                  onChange={(e) => handleInputChange('numero_packing_list', e.target.value)}
                  className="form-input"
                  placeholder="PL-XXXXXX"
                />
                <small className="field-help">
                  Format: PL-000001
                </small>
              </div>

              {/* Instructions spéciales */}
              <div className="form-group full-width">
                <label>Instructions spéciales</label>
                <textarea
                  value={formData.instructions_speciales}
                  onChange={(e) => handleInputChange('instructions_speciales', e.target.value)}
                  className="form-textarea"
                  placeholder="Instructions particulières pour l'expédition..."
                  rows={4}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-save"
              >
                {saving ? '💾 Enregistrement...' : '💾 Enregistrer l\'expédition'}
              </button>
              <Link 
                to={`/import-export/commandes/${commande.id}`}
                className="btn-cancel"
              >
                Annuler
              </Link>
            </div>
          </div>
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

export default ExpeditionFormPage;