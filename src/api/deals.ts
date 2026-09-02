import { mockApiCall } from './mockDelay';
import { Deal } from '../types/restaurant';
import { DUMMY_RESTAURANTS } from '../lib/dummyData';

export interface ValidateCouponResponse {
  deal: Deal;
  discountAmount: number;
  isValid: boolean;
  message?: string;
}

export const dealsApi = {
  async getDeals(restaurantId: string): Promise<Deal[]> {
    return mockApiCall(() => {
      const restaurant = DUMMY_RESTAURANTS.find(r => r.id === restaurantId);
      return restaurant?.deals.filter(d => d.isActive) ?? [];
    });
  },

  async validateCoupon(
    restaurantId: string,
    couponCode: string,
    subtotal: number
  ): Promise<ValidateCouponResponse> {
    return mockApiCall(() => {
      const restaurant = DUMMY_RESTAURANTS.find(r => r.id === restaurantId);
      const deal = restaurant?.deals.find(
        d => d.couponCode?.toUpperCase() === couponCode.toUpperCase() && d.isActive
      );

      if (!deal) {
        return {
          deal: {} as Deal,
          discountAmount: 0,
          isValid: false,
          message: 'Invalid coupon code',
        };
      }

      if (deal.minOrderAmount && subtotal < deal.minOrderAmount) {
        return {
          deal,
          discountAmount: 0,
          isValid: false,
          message: `Minimum order amount is PKR ${deal.minOrderAmount}`,
        };
      }

      let discountAmount = 0;
      if (deal.type === 'percentage') {
        discountAmount = Math.round((subtotal * deal.value) / 100);
      } else if (deal.type === 'fixed') {
        discountAmount = Math.min(deal.value, subtotal);
      }

      return { deal, discountAmount, isValid: true };
    });
  },
};
