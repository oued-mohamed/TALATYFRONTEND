import { apiService } from './api';
import { storageService } from './storageService';

class DocumentService {
  async uploadDocument(documentType, fileData, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('document', {
        uri: fileData.uri,
        type: fileData.type || 'image/jpeg',
        name: fileData.fileName || `${documentType}_${Date.now()}.jpg`,
      });
      formData.append('type', documentType);

      // Store upload progress locally if needed
      if (onProgress) {
        onProgress(0);
      }

      const response = await apiService.documents.upload(formData);

      if (onProgress) {
        onProgress(100);
      }

      // Cache document info locally
      await this.cacheDocumentInfo(response.data.document);

      return response;
    } catch (error) {
      if (onProgress) {
        onProgress(0);
      }
      throw error;
    }
  }

  async getDocuments(type = null) {
    try {
      const response = await apiService.documents.getAll(type ? { type } : {});
      
      // Cache documents locally
      await storageService.setItem('cachedDocuments', response.data.documents);
      
      return response;
    } catch (error) {
      // Return cached documents if network fails
      const cachedDocs = await storageService.getItem('cachedDocuments');
      if (cachedDocs) {
        return { success: true, data: { documents: cachedDocs } };
      }
      throw error;
    }
  }

  async getDocumentById(documentId) {
    try {
      const response = await apiService.documents.getById(documentId);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      const response = await apiService.documents.delete(documentId);
      
      // Remove from cache
      await this.removeCachedDocument(documentId);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateDocumentStatus(documentId, status, notes = '') {
    try {
      const response = await apiService.documents.updateStatus(documentId, status, notes);
      
      // Update cached document
      await this.updateCachedDocument(documentId, { verificationStatus: status, verificationNotes: notes });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async downloadDocument(documentId) {
    try {
      const response = await apiService.documents.download(documentId);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Cache management methods
  async cacheDocumentInfo(document) {
    try {
      const cachedDocs = await storageService.getItem('cachedDocuments') || [];
      const existingIndex = cachedDocs.findIndex(doc => doc._id === document._id);
      
      if (existingIndex >= 0) {
        cachedDocs[existingIndex] = document;
      } else {
        cachedDocs.push(document);
      }
      
      await storageService.setItem('cachedDocuments', cachedDocs);
    } catch (error) {
      console.error('Error caching document:', error);
    }
  }

  async updateCachedDocument(documentId, updates) {
    try {
      const cachedDocs = await storageService.getItem('cachedDocuments') || [];
      const docIndex = cachedDocs.findIndex(doc => doc._id === documentId);
      
      if (docIndex >= 0) {
        cachedDocs[docIndex] = { ...cachedDocs[docIndex], ...updates };
        await storageService.setItem('cachedDocuments', cachedDocs);
      }
    } catch (error) {
      console.error('Error updating cached document:', error);
    }
  }

  async removeCachedDocument(documentId) {
    try {
      const cachedDocs = await storageService.getItem('cachedDocuments') || [];
      const filteredDocs = cachedDocs.filter(doc => doc._id !== documentId);
      await storageService.setItem('cachedDocuments', filteredDocs);
    } catch (error) {
      console.error('Error removing cached document:', error);
    }
  }

  // Utility methods
  validateFileSize(fileSize, maxSize = 10 * 1024 * 1024) { // 10MB default
    return fileSize <= maxSize;
  }

  validateFileType(fileType) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    return allowedTypes.includes(fileType);
  }

  getDocumentTypeDisplayName(type) {
    const displayNames = {
      national_id: 'Carte d\'Identité Nationale',
      passport: 'Passeport',
      driving_license: 'Permis de Conduire',
      business_registration: 'Registre de Commerce',
      bank_statement: 'Relevé Bancaire',
      selfie: 'Photo Selfie',
    };
    return displayNames[type] || type;
  }

  getVerificationStatusColor(status) {
    const colors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      verified: '#28a745',
      rejected: '#dc3545',
    };
    return colors[status] || '#6c757d';
  }

  getVerificationStatusText(status) {
    const texts = {
      pending: 'En attente',
      processing: 'En cours de traitement',
      verified: 'Vérifié',
      rejected: 'Rejeté',
    };
    return texts[status] || status;
  }
}

export const documentService = new DocumentService();