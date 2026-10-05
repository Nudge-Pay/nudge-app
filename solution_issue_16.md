```typescript
import { expect } from '@jest/globals';
import { PaymentRequest } from './paymentRequest';

describe('PaymentRequest', () => {
  it('accepts a valid XLM payment request', () => {
    const paymentRequest = new PaymentRequest({
      amount: '1000',
      destination: '123456789012345678901234',
      payment_method: 'XLM',
      timestamp: '2023-10-01T12:00:00Z',
    });

    expect(paymentRequest).toBeValid();
  });
});
```