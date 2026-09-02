import { mockApiCall } from './mockDelay';
import { Address } from '../types/user';
import { DUMMY_ADDRESSES } from '../lib/dummyData';

let mockAddresses: Address[] = [...DUMMY_ADDRESSES];

export const addressesApi = {
  async getAddresses(): Promise<Address[]> {
    return mockApiCall(() => mockAddresses);
  },

  async addAddress(payload: Omit<Address, 'id' | 'userId' | 'createdAt'>): Promise<Address> {
    return mockApiCall(() => {
      const newAddress: Address = {
        ...payload,
        id: `addr-${Date.now()}`,
        userId: 'user-1',
        createdAt: new Date().toISOString(),
      };

      if (payload.isDefault) {
        mockAddresses = mockAddresses.map(a => ({ ...a, isDefault: false }));
      }

      mockAddresses = [...mockAddresses, newAddress];
      return newAddress;
    });
  },

  async updateAddress(
    id: string,
    payload: Partial<Address>
  ): Promise<Address> {
    return mockApiCall(() => {
      const idx = mockAddresses.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Address not found');

      if (payload.isDefault) {
        mockAddresses = mockAddresses.map(a => ({ ...a, isDefault: false }));
      }

      const updated = { ...mockAddresses[idx], ...payload };
      mockAddresses[idx] = updated;
      return updated;
    });
  },

  async deleteAddress(id: string): Promise<void> {
    return mockApiCall(() => {
      mockAddresses = mockAddresses.filter(a => a.id !== id);
    });
  },

  async setDefaultAddress(id: string): Promise<Address> {
    return mockApiCall(() => {
      mockAddresses = mockAddresses.map(a => ({ ...a, isDefault: a.id === id }));
      const addr = mockAddresses.find(a => a.id === id);
      if (!addr) throw new Error('Address not found');
      return addr;
    });
  },
};
