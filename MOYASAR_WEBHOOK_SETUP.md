# Moyasar Webhook Configuration Guide

## 🎯 Objective
Configure secure webhook endpoints in Moyasar dashboard to receive payment notifications.

## 📋 Prerequisites
- ✅ Moyasar account with live API key
- ✅ Backend server deployed and accessible
- ✅ PostgreSQL database set up
- ✅ Webhook endpoint: `https://yourdomain.com/api/billing/webhook`

## 🔧 Step 1: Access Moyasar Dashboard

1. Log in to your Moyasar account
2. Navigate to **Settings** → **Webhooks**
3. Click **Add New Webhook**

## 🌐 Step 2: Configure Webhook URL

### Webhook URL
```
https://yourdomain.com/api/billing/webhook
```

**Note**: Replace `yourdomain.com` with your actual domain.

### Webhook Events
Select the following events:
- ✅ **Invoice Paid** - Payment successful
- ✅ **Invoice Failed** - Payment failed
- ✅ **Invoice Created** - Payment initiated
- ✅ **Invoice Updated** - Payment status changed

## 🔐 Step 3: Configure Security

### Webhook Secret
```
moyasar_webhook_secret_shaheenpulse_2026
```

This secret is used for HMAC-SHA256 signature verification.

### Signature Method
- **Algorithm**: HMAC-SHA256
- **Header**: `X-Moyasar-Signature`
- **Format**: Hexadecimal string

## 🚀 Step 4: Test Webhook

### Test Payload Example
```json
{
  "type": "invoice.paid",
  "data": {
    "id": "inv_1234567890",
    "status": "paid",
    "amount": 490000,
    "currency": "SAR",
    "description": "Discovery Tier - Advanced AI Analytics",
    "metadata": {
      "tier": "discovery",
      "customer_email": "user@domain.sa",
      "customer_name": "Saudi User"
    },
    "created_at": "2026-03-01T04:34:00Z",
    "updated_at": "2026-03-01T04:34:00Z"
  }
}
```

### Verification Script
```python
import hmac
import hashlib
import json

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        json.dumps(payload, separators=(',', ':')).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)
```

## 📊 Step 5: Monitor Webhook Logs

### Check Webhook Status
```bash
curl -X GET https://yourdomain.com/api/billing/health
```

### View Webhook Logs
Webhook events are stored in the `webhook_logs` table:
```sql
SELECT * FROM webhook_logs 
WHERE provider = 'moyasar' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔍 Step 6: Troubleshooting

### Common Issues

#### 1. Webhook Not Received
- **Check**: Webhook URL is accessible
- **Verify**: SSL certificate is valid
- **Test**: Use curl to test endpoint:
  ```bash
  curl -X POST https://yourdomain.com/api/billing/webhook \
    -H "Content-Type: application/json" \
    -H "X-Moyasar-Signature: test" \
    -d '{"test": "data"}'
  ```

#### 2. Signature Verification Failed
- **Check**: Webhook secret matches configuration
- **Verify**: Payload format is correct
- **Test**: Use verification script

#### 3. Database Not Updated
- **Check**: Database connection
- **Verify**: Payment ID exists
- **Test**: Check transaction_logs table

### Debug Mode
Enable debug logging in backend:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📝 Step 7: Production Checklist

### Security
- ✅ HTTPS enabled
- ✅ Webhook secret configured
- ✅ Signature verification implemented
- ✅ Rate limiting enabled
- ✅ IP whitelist (optional)

### Reliability
- ✅ Redundant webhook endpoints
- ✅ Retry mechanism implemented
- ✅ Error logging enabled
- ✅ Monitoring dashboard set up

### Performance
- ✅ Database indexes created
- ✅ Connection pooling configured
- ✅ Caching enabled
- ✅ Load balancing configured

## 🎯 Step 8: End-to-End Testing

### Test Scenarios
1. **Successful Payment**
   - Create checkout session
   - Complete payment with test card
   - Verify webhook received
   - Check database updated

2. **Failed Payment**
   - Create checkout session
   - Fail payment intentionally
   - Verify webhook received
   - Check error handling

3. **Saudi Customer Test**
   - Use Saudi email domain
   - Verify Mada prioritization
   - Complete payment
   - Check Saudi-specific features

### Test Cards
| Card Type | Number | Expiry | CVV |
|-----------|---------|--------|-----|
| Mada | 4223000000000008 | 12/25 | 123 |
| Visa | 4111111111111111 | 12/25 | 123 |
| Mastercard | 5555555555554444 | 12/25 | 123 |

## 📞 Support

### Moyasar Support
- Email: support@moyasar.com
- Documentation: https://moyasar.com/docs
- Status Page: https://status.moyasar.com

### Common Webhook Issues
1. **Timeout**: Increase webhook timeout to 30 seconds
2. **Retries**: Configure retry policy (3 attempts)
3. **Rate Limits**: Monitor webhook rate limits
4. **Payload Size**: Keep payload under 1MB

## 🔄 Next Steps

1. **Deploy** webhook endpoint to production
2. **Configure** webhook in Moyasar dashboard
3. **Test** end-to-end payment flow
4. **Monitor** webhook delivery status
5. **Scale** for production traffic

## 📊 Success Metrics

### Webhook Performance
- **Delivery Rate**: >99%
- **Latency**: <500ms
- **Error Rate**: <1%
- **Retry Success**: >95%

### Payment Processing
- **Success Rate**: >95%
- **Processing Time**: <2 seconds
- **Database Updates**: Real-time
- **Customer Experience**: Seamless

---

**🎉 Your webhook is now ready for production!**
