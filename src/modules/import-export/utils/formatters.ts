export const formatters = {
  formatMontant: (montant: number, devise: string = 'EUR'): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(montant);
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatDateCourte: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  },

  formatPourcentage: (valeur: number): string => {
    return `${valeur.toFixed(1)}%`;
  },

  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};