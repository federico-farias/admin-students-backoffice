import { apiClient, delay, USE_MOCK } from './apiClient';
import type { EmergencyContact } from '../types';
import type { PaginationParams, PaginatedResponse } from './apiClient';

// Mock data para contactos de emergencia
const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    publicId: 'ec_001',
    firstName: 'Dr. Juan',
    lastName: 'Pérez',
    email: 'dr.perez@hospital.com',
    phone: '987-654-3210',
    address: 'Hospital Central, Calle Principal 123',
    relationship: 'Médico',
    documentNumber: '12345678',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    publicId: 'ec_002',
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@email.com',
    phone: '987-654-3211',
    address: 'Calle Secundaria 456',
    relationship: 'Familiar',
    documentNumber: '87654321',
    isActive: true,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z'
  },
  {
    id: '3',
    publicId: 'ec_003',
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@email.com',
    phone: '555-0123',
    address: 'Avenida Principal 789',
    relationship: 'Amigo de la familia',
    documentNumber: '11223344',
    isActive: true,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z'
  },
  {
    id: '4',
    publicId: 'ec_004',
    firstName: 'Dra. María',
    lastName: 'González',
    email: 'dra.gonzalez@clinica.com',
    phone: '555-0456',
    address: 'Clínica San José, Av. Libertad 321',
    relationship: 'Médico',
    documentNumber: '55667788',
    isActive: true,
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-04T10:00:00Z'
  }
];

export interface EmergencyContactFilters {
  searchText?: string;
  relationship?: string;
  isActive?: boolean;
}

export const emergencyContactsApi = {
  async getAll(): Promise<EmergencyContact[]> {
    if (USE_MOCK) {
      await delay(500);
      return mockEmergencyContacts.filter(ec => ec.isActive);
    }
    
    const response = await apiClient.get<EmergencyContact[]>('/emergency-contacts');
    return response.data;
  },

  async getById(id: string): Promise<EmergencyContact | undefined> {
    if (USE_MOCK) {
      await delay(200);
      return mockEmergencyContacts.find(ec => ec.id === id || ec.publicId === id);
    }
    
    try {
      const response = await apiClient.get<EmergencyContact>(`/emergency-contacts/${id}`);
      return response.data;
    } catch (error) {
      return undefined;
    }
  },

  async search(query: string): Promise<EmergencyContact[]> {
    if (USE_MOCK) {
      await delay(300);
      const searchLower = query.toLowerCase();
      return mockEmergencyContacts.filter(ec => 
        ec.firstName.toLowerCase().includes(searchLower) ||
        ec.lastName.toLowerCase().includes(searchLower) ||
        ec.phone.includes(query) ||
        (ec.email && ec.email.toLowerCase().includes(searchLower)) ||
        (ec.documentNumber && ec.documentNumber.includes(query)) ||
        ec.relationship.toLowerCase().includes(searchLower)
      );
    }

    const response = await apiClient.get<PaginatedResponse<EmergencyContact>>('/emergency-contacts/search', {
      params: { search: query }
    });
    return response.data.content;
  },

  async searchPaginated(
    query: string, 
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<EmergencyContact>> {
    if (USE_MOCK) {
      await delay(400);
      const searchLower = query.toLowerCase();
      const filtered = mockEmergencyContacts.filter(ec => 
        ec.firstName.toLowerCase().includes(searchLower) ||
        ec.lastName.toLowerCase().includes(searchLower) ||
        ec.phone.includes(query) ||
        (ec.email && ec.email.toLowerCase().includes(searchLower)) ||
        (ec.documentNumber && ec.documentNumber.includes(query)) ||
        ec.relationship.toLowerCase().includes(searchLower)
      );

      const page = params.page || 0;
      const size = params.size || 10;
      const start = page * size;
      const end = start + size;
      const content = filtered.slice(start, end);

      return {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        number: page,
        size,
        first: page === 0,
        last: end >= filtered.length
      };
    }

    const response = await apiClient.get<PaginatedResponse<EmergencyContact>>('/emergency-contacts/search', {
      params: { q: query, ...params }
    });
    return response.data;
  },

  async create(contactData: Omit<EmergencyContact, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<EmergencyContact> {
    if (USE_MOCK) {
      await delay(800);
      const newContact: EmergencyContact = {
        ...contactData,
        id: `mock_${Date.now()}`,
        publicId: `ec_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockEmergencyContacts.push(newContact);
      return newContact;
    }

    const response = await apiClient.post<EmergencyContact>('/emergency-contacts', contactData);
    return response.data;
  },

  async update(id: string, contactData: Partial<Omit<EmergencyContact, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>>): Promise<EmergencyContact> {
    if (USE_MOCK) {
      await delay(600);
      const index = mockEmergencyContacts.findIndex(ec => ec.id === id || ec.publicId === id);
      if (index === -1) {
        throw new Error('Contacto de emergencia no encontrado');
      }

      const updatedContact = {
        ...mockEmergencyContacts[index],
        ...contactData,
        updatedAt: new Date().toISOString()
      };
      mockEmergencyContacts[index] = updatedContact;
      return updatedContact;
    }

    const response = await apiClient.put<EmergencyContact>(`/emergency-contacts/${id}`, contactData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const index = mockEmergencyContacts.findIndex(ec => ec.id === id || ec.publicId === id);
      if (index !== -1) {
        mockEmergencyContacts[index].isActive = false;
      }
      return;
    }

    await apiClient.delete(`/emergency-contacts/${id}`);
  },

  async getFiltered(filters: EmergencyContactFilters): Promise<EmergencyContact[]> {
    if (USE_MOCK) {
      await delay(400);
      let filtered = mockEmergencyContacts.filter(ec => ec.isActive);

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filtered = filtered.filter(ec => 
          ec.firstName.toLowerCase().includes(searchLower) ||
          ec.lastName.toLowerCase().includes(searchLower) ||
          ec.phone.includes(filters.searchText!) ||
          (ec.email && ec.email.toLowerCase().includes(searchLower)) ||
          (ec.documentNumber && ec.documentNumber.includes(filters.searchText!))
        );
      }

      if (filters.relationship) {
        filtered = filtered.filter(ec => ec.relationship === filters.relationship);
      }

      if (filters.isActive !== undefined) {
        filtered = filtered.filter(ec => ec.isActive === filters.isActive);
      }

      return filtered;
    }

    const response = await apiClient.get<EmergencyContact[]>('/emergency-contacts', {
      params: filters
    });
    return response.data;
  }
};
