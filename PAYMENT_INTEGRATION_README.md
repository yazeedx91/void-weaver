# ShaheenPulse AI - Payment Gateway Integration

## Overview
Modular payment gateway integration with Moyasar as the primary provider and HyperPay support for future migration.

## Features
- ✅ Moyasar Sandbox integration
- ✅ Mada card detection and prioritization for Saudi customers
- ✅ Secure webhook verification
- ✅ PostgreSQL transaction logging
- ✅ Tier-based pricing (Discovery: SAR 4,900, Professional: SAR 12,500)
- ✅ Modular design for easy provider switching
- ✅ React components with Saudi customer optimization

## Architecture

### Backend Structure
```
backend/
├── payment/
│   ├── __init__.py              # Payment abstraction layer
│   ├── moyasar_gateway.py       # Moyasar implementation
│   └── hyperpay_gateway.py      # HyperPay implementation (future)
├── api/
│   └── billing.py               # Billing API endpoints
└── database/
    └── transaction_logs.py      # PostgreSQL service
```

### Frontend Structure
```
frontend/src/
├── components/
│   └── PaymentCheckout.jsx      # Payment component with Mada detection
├── pages/
│   └── BillingSuccess.jsx       # Payment success page
└── utils/
    └── scriptLoader.js          # Script loading utility
```

## API Endpoints

### Create Checkout Session
```
POST /api/billing/checkout
Content-Type: application/json

{
  "tier": "discovery",  // or "professional"
  "customer_email": "user@example.com",
  "customer_name": "John Doe"
}
```

### Webhook Handler
```
POST /api/billing/webhook
Headers: X-Moyasar-Signature
```

### Payment Status
```
GET /api/billing/payment/{payment_id}
```

### Supported Cards
```
GET /api/billing/card-types
```

### Available Tiers
```
GET /api/billing/tiers
```

## Database Schema

### Transaction Logs Table
```sql
CREATE TABLE transaction_logs (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Environment Variables
```bash
# Moyasar Sandbox
MOYASAR_API_KEY=pk_test_...
MOYASAR_SECRET_KEY=sk_test_...
MOYASAR_WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shaheenpulse

# Application
BASE_URL=http://localhost:3000
```

## Security Features

### Webhook Verification
- HMAC-SHA256 signature verification
- Payload validation
- Replay attack prevention

### Data Protection
- Encrypted payment data
- Secure API endpoints
- SQL injection prevention
- XSS protection

## Mada Card Optimization

### Saudi Customer Detection
```javascript
const saudiDomains = ['.sa', '.com.sa', '.org.sa', '.net.sa'];
const isSaudi = saudiDomains.some(domain => 
  customerEmail.toLowerCase().includes(domain)
);
```

### UI Prioritization
- Mada logo highlighted for Saudi customers
- "Recommended" badge for Mada
- Localized messaging

## Tier Configuration

### Discovery Tier
- Price: SAR 4,900
- Features: Advanced AI Analytics
- Target: Small to medium businesses

### Professional Tier
- Price: SAR 12,500
- Features: Enterprise AI Solutions
- Target: Large enterprises

## Testing

### Sandbox Testing
1. Use Moyasar sandbox credentials
2. Test with Saudi email domains (.sa, .com.sa)
3. Verify Mada card prioritization
4. Test webhook endpoints

### Test Cards
- Mada: 4223000000000008
- Visa: 4111111111111111
- Mastercard: 5555555555554444

## Migration to HyperPay

### Easy Switch
```python
# Change provider in one line
payment_gateway = PaymentGatewayFactory.create_gateway(PaymentProvider.HYPERPAY)
```

### Configuration Update
```bash
# Update environment variables
HYPERPAY_ENTITY_ID=your_entity_id
HYPERPAY_ACCESS_TOKEN=your_access_token
```

## Deployment

### Requirements
- PostgreSQL database
- Node.js 18+
- Python 3.9+
- Redis (for caching)

### Steps
1. Install dependencies
2. Configure environment variables
3. Run database migrations
4. Start backend server
5. Build and serve frontend

## Monitoring

### Health Checks
- `/api/billing/health` - Service health
- Payment gateway connectivity
- Database connection status

### Logging
- Payment transactions
- Webhook processing
- Error tracking

## Support

### Common Issues
1. **Webhook verification failed** - Check webhook secret
2. **Payment not found** - Verify payment_id format
3. **Database connection** - Check DATABASE_URL

### Debug Mode
```bash
# Enable debug logging
DEBUG=true
LOG_LEVEL=debug
```

## Future Enhancements

### Planned Features
- Subscription management
- Invoice generation
- Multi-currency support
- Advanced analytics
- Refund processing

### Provider Support
- Stripe integration
- PayPal integration
- Apple Pay/Google Pay

## License
© 2026 ShaheenPulse AI. All rights reserved.
