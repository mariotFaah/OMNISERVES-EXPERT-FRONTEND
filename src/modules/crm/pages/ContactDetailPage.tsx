// src/modules/crm/pages/ContactDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { crmApi } from '../services/api';
import type { Contact, Client } from '../types';
import './ContactDetailPage.css';

const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (id) {
      loadContactData();
    }
  }, [id]);

  const loadContactData = async () => {
    try {
      setLoading(true);
      const contactData = await crmApi.getContact(parseInt(id!));
      setContact(contactData);

      // Charger les infos du client associé
      const clientData = await crmApi.getClient(contactData.tiers_id);
      setClient(clientData);
      
    } catch (error) {
      console.error('Erreur chargement contact:', error);
      alert('Contact non trouvé');
      navigate('/crm/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contact || !window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }

    try {
      await crmApi.deleteContact(contact.id_contact);
      alert('Contact supprimé avec succès');
      navigate('/crm/contacts');
    } catch (error) {
      console.error('Erreur suppression contact:', error);
      alert('Erreur lors de la suppression du contact');
    }
  };

  if (loading) {
    return (
      <div className="contact-detail-container">
        <div className="loading">Chargement du contact...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="contact-detail-container">
        <div className="error">Contact non trouvé</div>
      </div>
    );
  }

  return (
    <div className="contact-detail-container">
      {/* En-tête avec actions */}
      <div className="contact-header">
        <div className="header-content">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/crm/contacts')}
          >
            ← Retour aux contacts
          </button>
          <h1>Détail du Contact</h1>
        </div>
        <div className="header-actions">
          <Link 
            to={`/crm/contacts/${contact.id_contact}/modifier`}
            className="btn btn-primary"
          >
            ✏️ Modifier
          </Link>
          <button 
            className="btn btn-danger"
            onClick={handleDelete}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>

      <div className="contact-content">
        {/* Carte principale */}
        <div className="contact-card">
          <div className="contact-avatar">
            {contact.prenom?.charAt(0) || contact.nom.charAt(0)}
          </div>
          
          <div className="contact-info">
            <h2 className="contact-name">
              {contact.prenom && `${contact.prenom} `}{contact.nom}
              {contact.principal && (
                <span className="badge primary">Principal</span>
              )}
            </h2>
            
            {contact.fonction && (
              <p className="contact-fonction">{contact.fonction}</p>
            )}

            <div className="contact-meta">
              {client && (
                <div className="meta-item">
                  <span className="meta-label">Client :</span>
                  <Link to={`/crm/clients/${client.id_tiers}`} className="meta-value link">
                    {client.nom}
                  </Link>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-label">Créé le :</span>
                <span className="meta-value">
                  {new Date(contact.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">Modifié le :</span>
                <span className="meta-value">
                  {new Date(contact.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="info-section">
          <h3>Coordonnées</h3>
          <div className="info-grid">
            {contact.email && (
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <div className="info-label">Email</div>
                  <a href={`mailto:${contact.email}`} className="info-value link">
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.telephone && (
              <div className="info-item">
                <div className="info-icon">📞</div>
                <div className="info-content">
                  <div className="info-label">Téléphone</div>
                  <a href={`tel:${contact.telephone}`} className="info-value link">
                    {contact.telephone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {contact.notes && (
          <div className="info-section">
            <h3>Notes</h3>
            <div className="notes-content">
              {contact.notes}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="quick-actions">
          <h3>Actions Rapides</h3>
          <div className="actions-grid">
            <button className="action-btn">
              <div className="action-icon">📧</div>
              <div className="action-text">Envoyer un email</div>
            </button>
            
            <button className="action-btn">
              <div className="action-icon">📞</div>
              <div className="action-text">Appeler</div>
            </button>
            
            <Link to={`/crm/devis/nouveau?client=${client?.id_tiers}&contact=${contact.id_contact}`} className="action-btn">
              <div className="action-icon">📄</div>
              <div className="action-text">Créer un devis</div>
            </Link>
            
            <button className="action-btn">
              <div className="action-icon">➕</div>
              <div className="action-text">Nouvelle activité</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPage;