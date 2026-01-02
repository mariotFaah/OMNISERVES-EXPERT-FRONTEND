import React from 'react';
import type { Expedition } from '../../types';
import './DocumentList.css';

interface DocumentListProps {
  expedition: Expedition;
}

const DocumentList: React.FC<DocumentListProps> = ({ expedition }) => {
  const documents = [
    {
      type: 'Bon de Livraison',
      numero: expedition.numero_bl,
      key: 'bl'
    },
    {
      type: 'Connaissement',
      numero: expedition.numero_connaissement,
      key: 'connaissement'
    },
    {
      type: 'Packing List',
      numero: expedition.numero_packing_list,
      key: 'packing'
    }
  ];

  const hasDocuments = documents.some(doc => doc.numero);

  if (!hasDocuments) {
    return (
      <div className="document-list empty">
        <p className="empty-message">Aucun document disponible</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <h4 className="document-list-title">Documents d'expédition</h4>
      <div className="document-items">
        {documents.map((doc) => (
          doc.numero && (
            <div key={doc.key} className="document-item">
              <div className="document-icon">
                {doc.key === 'bl' && '📄'}
                {doc.key === 'connaissement' && '📑'}
                {doc.key === 'packing' && '📋'}
              </div>
              <div className="document-info">
                <div className="document-type">{doc.type}</div>
                <div className="document-numero">{doc.numero}</div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default DocumentList;