// import { IGalleryCreate } from 'src/interfaces';
import { APIRequest } from './api-request';

export class PaymentService extends APIRequest {
  subscribe(payload: any) {
    return this.post('/payment/subscribe/performers', payload);
  }

  getListTransactions(payload) {
    return this.get(this.buildUrl('/payment/transactions', payload));
  }

  userSearchTransactions(payload) {
    return this.get(this.buildUrl('/transactions/user/search', payload));
  }

  purchaseVideo(id, payload) {
    return this.post(`/payment/purchase-video/${id}`, payload);
  }

  purchaseProducts(products: any) {
    return this.post('/payment/purchase-products', products);
  }

  applyCoupon(code: any) {
    return this.post(`/coupons/${code}/apply-coupon`);
  }

  cancelSubscription(performerId: string) {
    return this.post(`/payment/ccbill/cancel-subscription/${performerId}`);
  }

  sendTip(performerId: string, userId: string, tipAmount: number) {
    return this.post(`/payment/send-tip/${performerId}/${userId}/${tipAmount}`);
  }

  purchaseMedia(performerId: string, userId: string, fileId: string, price: number) {
    return this.post(`/payment/purchase-media/${performerId}/${userId}/${fileId}/${price}`);
  }
}

export const paymentService = new PaymentService();
