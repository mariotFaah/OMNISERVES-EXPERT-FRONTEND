// src/modules/crm/components/forms/ActiviteForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import crmApi from '../../services/api';
import './ActiviteForm.css';
import type { Client } from '../../types';

interface ActiviteFormData {
  tiers_id: number;
  type_activite: 'appel' | 'email' | 'reunion' | 'visite';
  sujet: string;
  description: string;
  date_activite: string;
  date_rappel?: string;
  priorite: 'basse' | 'normal' | 'haute';
  duree?: number;
  lieu?: string;
  participants?: string;
  resultat?: string;
}

const ActiviteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ActiviteFormData>({
    tiers_id: 0,
    type_activite: 'appel',
    sujet: '',
    description: '',
    date_activite: new Date().toISOString().slice(0, 16),
    date_rappel: '',
    priorite: 'normal',
    duree: 30,
    lieu: '',
    participants: '',
    resultat: ''
  });

  useEffect(() => {
    chargerDonnees();
    if (id) {
      chargerActivite(parseInt(id));
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

  const chargerActivite = async (activiteId: number) => {
    try {
      const activite = await crmApi.getActivite(activiteId);
      const mapPriorite = (p: string | undefined): ActiviteFormData['priorite'] => {
        switch (p) {
          case 'bas':
            return 'basse';
          case 'haut':
          case 'urgent':
            return 'haute';
          case 'normal':
          default:
            return 'normal';
        }
      };

      setFormData({
        tiers_id: activite.tiers_id,
        type_activite: activite.type_activite,
        sujet: activite.sujet || '',
        description: activite.description || '',
        date_activite: activite.date_activite.slice(0, 16),
        date_rappel: activite.date_rappel ? activite.date_rappel.slice(0, 16) : '',
        priorite: mapPriorite(activite.priorite),
        duree: (activite as any).duree ?? formData.duree ?? 30,
        lieu: (activite as any).lieu || '',
        participants: (activite as any).participants || '',
        resultat: (activite as any).resultat || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement de l\'activité');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const mapPrioriteToApi = (p: ActiviteFormData['priorite']): 'normal' | 'bas' | 'haut' | 'urgent' => {
        switch (p) {
          case 'basse':
            return 'bas';
          case 'haute':
            return 'haut';
          case 'normal':
          default:
            return 'normal';
        }
      };

      const payload = {
        ...formData,
        priorite: mapPrioriteToApi(formData.priorite)
      } as unknown as any;

      if (id) {
        await crmApi.updateActivite(parseInt(id), payload);
      } else {
        await crmApi.createActivite(payload);
      }
      navigate('/crm/activites');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duree' ? parseInt(value) || 0 : value
    }));
  };

  const typesActivite = [
    { value: 'appel', label: 'Appel téléphonique', icon: '📞' },
    { value: 'email', label: 'Email', icon: '✉️' },
    { value: 'reunion', label: 'Réunion', icon: '👥' },
    { value: 'visite', label: 'Visite', icon: '🏢' }
  ];

  const priorities = [
    { value: 'basse', label: 'Basse', color: '#107c10' },
    { value: 'normal', label: 'Normale', color: '#ffb900' },
    { value: 'haute', label: 'Haute', color: '#d13438' }
  ];

  if (loading) return <div className="ms-loading">Chargement...</div>;

  return (
    <div className="ms-form-container">
      <div className="ms-form-header">
        <div className="ms-header-left">
          <h1 className="ms-form-title">{id ? 'Modifier l\'activité' : 'Nouvelle activité'}</h1>
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
            onClick={() => navigate('/crm/activites')}
            className="ms-btn ms-btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="activite-form"
            className="ms-btn ms-btn-primary"
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : (id ? 'Mettre à jour' : 'Créer')}
          </button>
        </div>
      </div>

      <form id="activite-form" onSubmit={handleSubmit} className="ms-form">
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
                        {client.raison_sociale || ` ${client.nom}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="type_activite">
                    Type d'activité <span className="ms-required">*</span>
                  </label>
                  <select
                    id="type_activite"
                    name="type_activite"
                    className="ms-field-input"
                    value={formData.type_activite}
                    onChange={handleChange}
                    required
                  >
                    {typesActivite.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="sujet">
                  Sujet <span className="ms-required">*</span>
                </label>
                <input
                  type="text"
                  id="sujet"
                  name="sujet"
                  className="ms-field-input"
                  value={formData.sujet}
                  onChange={handleChange}
                  placeholder="Objet de l'activité..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Planification */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Planification</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-row">
                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="date_activite">
                    Date et heure <span className="ms-required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="date_activite"
                    name="date_activite"
                    className="ms-field-input"
                    value={formData.date_activite}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="date_rappel">
                    Rappel
                  </label>
                  <input
                    type="datetime-local"
                    id="date_rappel"
                    name="date_rappel"
                    className="ms-field-input"
                    value={formData.date_rappel}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="ms-form-row">
                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="duree">
                    Durée (minutes)
                  </label>
                  <div className="ms-duration-input">
                    <input
                      type="number"
                      id="duree"
                      name="duree"
                      className="ms-field-input"
                      value={formData.duree}
                      onChange={handleChange}
                      min="1"
                    />
                    <span className="ms-duration-unit">min</span>
                  </div>
                </div>

                <div className="ms-form-field">
                  <label className="ms-field-label" htmlFor="priorite">
                    Priorité
                  </label>
                  <select
                    id="priorite"
                    name="priorite"
                    className="ms-field-input"
                    value={formData.priorite}
                    onChange={handleChange}
                  >
                    {priorities.map(prio => (
                      <option key={prio.value} value={prio.value}>
                        {prio.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section Détails supplémentaires */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Détails supplémentaires</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="lieu">
                  Lieu
                </label>
                <input
                  type="text"
                  id="lieu"
                  name="lieu"
                  className="ms-field-input"
                  value={formData.lieu}
                  onChange={handleChange}
                  placeholder="Lieu de la réunion/visite..."
                />
              </div>

              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="participants">
                  Participants
                </label>
                <input
                  type="text"
                  id="participants"
                  name="participants"
                  className="ms-field-input"
                  value={formData.participants}
                  onChange={handleChange}
                  placeholder="Noms des participants..."
                />
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Description</h2>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="description">
                  Description <span className="ms-required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="ms-field-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Détails de l'activité, points abordés, contexte..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Résultats */}
          <div className="ms-form-section">
            <div className="ms-section-header">
              <h2 className="ms-section-title">Résultats</h2>
              <span className="ms-section-subtitle">À compléter après l'activité</span>
            </div>
            <div className="ms-section-content">
              <div className="ms-form-field">
                <label className="ms-field-label" htmlFor="resultat">
                  Résultat
                </label>
                <textarea
                  id="resultat"
                  name="resultat"
                  className="ms-field-textarea"
                  value={formData.resultat}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Résultats obtenus, décisions prises, prochaines étapes..."
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ActiviteForm;