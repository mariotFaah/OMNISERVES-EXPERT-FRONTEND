// src/modules/crm/components/forms/DevisForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import crmApi from '../../services/api';
import './DevisForm.css';
import type { Client, Devis } from '../../types';



interface DevisFormData {
  tiers_id: number;
  date_devis: string;
  date_validite: string;
  objet: string;
  description?: string;
  montant_ht: number;
  conditions: string;
}

interface LigneDevis {
  id?: number;
  description: string;
  quantite: number;
  prix_unitaire: number;
  tva: number;
  montant_ht: number;
  montant_ttc: number;
}

const DevisForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DevisFormData>({
    tiers_id: 0,
    date_devis: new Date().toISOString().split('T')[0],
    date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    objet: '',
    description: '',
    montant_ht: 0,
    conditions: 'Paiement à 30 jours fin de mois\nValidité 30 jours'
  });

  const [lignesDevis, setLignesDevis] = useState<LigneDevis[]>([
    {
      description: '',
      quantite: 1,
      prix_unitaire: 0,
      tva: 20,
      montant_ht: 0,
      montant_ttc: 0
    }
  ]);

  useEffect(() => {
    chargerDonnees();
    if (id) {
      chargerDevis(parseInt(id));
    }
  }, [id]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const clientsData = await crmApi.getClients();
      setClients(clientsData);
    } catch (err) {
      setError('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const chargerDevis = async (devisId: number) => {
    try {
      const devis: Devis = await crmApi.getDevisById(devisId);
      setFormData({
        tiers_id: devis.tiers_id,
        date_devis: devis.date_devis.split('T')[0],
        date_validite: devis.date_validite ? devis.date_validite.split('T')[0] : '',
        objet: devis.objet || '',
        description: devis.description || '',
        montant_ht: devis.montant_ht,
        conditions: devis.conditions || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement du devis');
    }
  };

  const calculerMontantsLigne = (ligne: LigneDevis): LigneDevis => {
    const montantHt = ligne.quantite * ligne.prix_unitaire;
    const montantTtc = montantHt * (1 + ligne.tva / 100);
    return {
      ...ligne,
      montant_ht: parseFloat(montantHt.toFixed(2)),
      montant_ttc: parseFloat(montantTtc.toFixed(2))
    };
  };

  const calculerTotalDevis = () => {
    const totalHt = lignesDevis.reduce((sum, ligne) => sum + ligne.montant_ht, 0);
    const totalTtc = lignesDevis.reduce((sum, ligne) => sum + ligne.montant_ttc, 0);
    const totalTva = totalTtc - totalHt;
    return { 
      totalHt: parseFloat(totalHt.toFixed(2)), 
      totalTtc: parseFloat(totalTtc.toFixed(2)),
      totalTva: parseFloat(totalTva.toFixed(2))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { totalHt, totalTtc } = calculerTotalDevis();

    try {
        const devisData: Partial<Devis> = {
          ...formData,
          montant_ht: totalHt,
          montant_ttc: totalTtc,
          statut: 'brouillon'
        };

      if (id) {
        await crmApi.updateDevis(parseInt(id), devisData);
      } else {
        await crmApi.createDevis(devisData);
      }
      navigate('/crm/devis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAndSend = async () => {
    setSaving(true);
    setError(null);

    const { totalHt, totalTtc } = calculerTotalDevis();

    try {
       const devisData: Partial<Devis> = {
    ...formData,
          montant_ht: totalHt,
          montant_ttc: totalTtc,
          statut: 'brouillon'
        };

      if (id) {
        await crmApi.updateDevis(parseInt(id), devisData);
      } else {
        await crmApi.createDevis(devisData);
      }
      navigate('/crm/devis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLigneChange = (index: number, field: string, value: string | number) => {
    const nouvellesLignes = [...lignesDevis];
    nouvellesLignes[index] = {
      ...nouvellesLignes[index],
      [field]: typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value
    };
    
    nouvellesLignes[index] = calculerMontantsLigne(nouvellesLignes[index]);
    setLignesDevis(nouvellesLignes);
  };

  const ajouterLigne = () => {
    setLignesDevis(prev => [
      ...prev,
      {
        description: '',
        quantite: 1,
        prix_unitaire: 0,
        tva: 20,
        montant_ht: 0,
        montant_ttc: 0
      }
    ]);
  };

  const supprimerLigne = (index: number) => {
    if (lignesDevis.length > 1) {
      setLignesDevis(prev => prev.filter((_, i) => i !== index));
    }
  };

  const tauxTVA = [0, 2.1, 5.5, 10, 20];

  const { totalHt, totalTtc, totalTva } = calculerTotalDevis();

  if (loading) {
    return (
      <div className="ms-form-container">
        <div className="ms-loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="ms-form-container">
      <div className="ms-form-header">
        <div className="ms-header-left">
          <h1 className="ms-form-title">
            {id ? 'Modifier le devis' : 'Nouveau devis'}
          </h1>
          {error && (
            <div className="ms-error-message">
              <span className="ms-error-icon">⚠</span>
              {error}
            </div>
          )}
        </div>
        <div className="ms-header-actions">
          <button 
            type="button" 
            onClick={() => navigate('/crm/devis')}
            className="ms-btn ms-btn-secondary"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="ms-btn ms-btn-secondary"
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer brouillon'}
          </button>
          <button
            type="button"
            onClick={handleSubmitAndSend}
            className="ms-btn ms-btn-primary"
            disabled={saving}
          >
            {saving ? 'Envoi...' : 'Envoyer le devis'}
          </button>
        </div>
      </div>

      <form className="ms-form">
        <div className="ms-form-sections">
          {/* Section Informations générales */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Informations générales</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-row">
                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="tiers_id">
                    Client <span className="ms-required">*</span>
                  </label>
                  <select
                    id="tiers_id"
                    name="tiers_id"
                    className="ms-field-input"
                    value={formData.tiers_id}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id_tiers} value={client.id_tiers}>
                        {client.raison_sociale || client.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ms-form-row">
                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="date_devis">
                    Date du devis <span className="ms-required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_devis"
                    name="date_devis"
                    className="ms-field-input"
                    value={formData.date_devis}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="date_validite">
                    Date de validité <span className="ms-required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_validite"
                    name="date_validite"
                    className="ms-field-input"
                    value={formData.date_validite}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="objet">
                  Objet du devis <span className="ms-required">*</span>
                </label>
                <input
                  type="text"
                  id="objet"
                  name="objet"
                  className="ms-field-input"
                  value={formData.objet}
                  onChange={handleChange}
                  placeholder="Description de la prestation..."
                  required
                />
              </div>

              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="description">
                  Description détaillée
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="ms-field-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description complète des prestations..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section Lignes de devis */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <div className="ms-section-title-row">
                <h2 className="ms-section-title">Prestations</h2>
                <button 
                  type="button" 
                  onClick={ajouterLigne}
                  className="ms-btn ms-btn-secondary ms-btn-sm"
                >
                  + Ajouter une ligne
                </button>
              </div>
            </div>
            <div className="ms-section-content">
              <div className="ms-lignes-container">
                <div className="ms-ligne-header">
                  <div className="ms-col-description">Description</div>
                  <div className="ms-col-quantite">Quantité</div>
                  <div className="ms-col-prix">Prix unitaire HT</div>
                  <div className="ms-col-tva">TVA</div>
                  <div className="ms-col-montant">Montant HT</div>
                  <div className="ms-col-actions"></div>
                </div>

                {lignesDevis.map((ligne, index) => (
                  <div key={index} className="ms-ligne-devis">
                    <div className="ms-col-description">
                      <input
                        type="text"
                        className="ms-field-input ms-field-sm"
                        value={ligne.description}
                        onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
                        placeholder="Description de la prestation"
                        required
                      />
                    </div>
                    
                    <div className="ms-col-quantite">
                      <input
                        type="number"
                        className="ms-field-input ms-field-sm ms-field-number"
                        value={ligne.quantite}
                        onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                        min="1"
                        step="1"
                        required
                      />
                    </div>
                    
                    <div className="ms-col-prix">
                      <div className="ms-currency-input">
                        <input
                          type="number"
                          className="ms-field-input ms-field-sm ms-field-number"
                          value={ligne.prix_unitaire}
                          onChange={(e) => handleLigneChange(index, 'prix_unitaire', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                        <span className="ms-currency-symbol">€</span>
                      </div>
                    </div>
                    
                    <div className="ms-col-tva">
                      <select
                        className="ms-field-input ms-field-sm"
                        value={ligne.tva}
                        onChange={(e) => handleLigneChange(index, 'tva', parseFloat(e.target.value))}
                      >
                        {tauxTVA.map(taux => (
                          <option key={taux} value={taux}>
                            {taux}%
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="ms-col-montant">
                      <span className="ms-montant-value">
                        {ligne.montant_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                    
                    <div className="ms-col-actions">
                      {lignesDevis.length > 1 && (
                        <button
                          type="button"
                          onClick={() => supprimerLigne(index)}
                          className="ms-btn-delete"
                          title="Supprimer cette ligne"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé financier */}
              <div className="ms-financial-summary">
                <div className="ms-financial-row">
                  <span className="ms-financial-label">Total HT</span>
                  <span className="ms-financial-value">
                    {totalHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                <div className="ms-financial-row">
                  <span className="ms-financial-label">Total TVA</span>
                  <span className="ms-financial-value">
                    {totalTva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                <div className="ms-financial-row ms-financial-total">
                  <span className="ms-financial-label">Total TTC</span>
                  <span className="ms-financial-value">
                    {totalTtc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Conditions */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Conditions générales</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="conditions">
                  Conditions
                </label>
                <textarea
                  id="conditions"
                  name="conditions"
                  className="ms-field-textarea"
                  value={formData.conditions}
                  onChange={handleChange}
                  placeholder="Conditions de paiement, délais, modalités..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DevisForm;