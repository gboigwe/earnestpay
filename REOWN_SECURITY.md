# 🔒 Reown Project ID - Security Guide

## Is My Project ID Safe?

**YES** - Your Reown Project ID is designed to be public and safe to use in frontend code. However, you should still follow security best practices to prevent misuse.

---

## ✅ What's Safe About Project IDs

### 1. **Designed to Be Public**
- Project IDs are meant to be embedded in frontend JavaScript
- They're visible to anyone who inspects your website's code
- Similar to Google Analytics IDs or Firebase config

### 2. **Cannot Access Your Funds**
- Project ID ≠ Private Key
- Cannot control wallets or approve transactions
- Only used for connection routing and analytics

### 3. **Built-in Protections**
- Rate limiting (prevents spam/abuse)
- Domain verification (you configure allowed origins)
- Usage analytics (detect unusual patterns)

---

## 🛡️ Security Best Practices

### ✅ DO These Things

#### 1. **Configure Allowed Origins** (MOST IMPORTANT)
In your Reown dashboard (https://cloud.reown.com):

```
Project Settings → Allowed Origins

Add these domains:
✅ http://localhost:5173      (Vite dev server)
✅ http://localhost:3000      (Alternative port)
✅ https://earnestpay.com     (Your production domain)
✅ https://www.earnestpay.com (With www)
```

**Why**: This prevents anyone from using your Project ID on their own website.

#### 2. **Monitor Usage**
- Check Reown dashboard regularly
- Review connection attempts
- Look for suspicious patterns
- Set up usage alerts if available

#### 3. **Rotate If Compromised**
If you suspect misuse:
- Create a new project in Reown
- Get new Project ID
- Update `.env` file
- Deploy with new ID

#### 4. **Keep Private Keys PRIVATE**
```bash
# ✅ SAFE to commit
VITE_REOWN_PROJECT_ID=c67f800f8fe6b8e12232a9d1a8ea363c

# ❌ NEVER commit these
VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=...
WALLET_SEED_PHRASE=...
PRIVATE_KEY=...
```

---

## ❌ What Attackers CANNOT Do

Even if someone copies your Project ID, they **CANNOT**:

- ❌ Steal cryptocurrency from any wallet
- ❌ Approve transactions on behalf of users
- ❌ Access user's private keys or seed phrases
- ❌ Impersonate your app (if domains are configured)
- ❌ Exceed rate limits significantly
- ❌ Access your Reown account settings

---

## ⚠️ What Attackers CAN Do (and how to prevent)

### 1. **Use Your Project ID on Their Website**
**Impact**: Low - Just uses your analytics quota

**Prevention**:
```
✅ Configure Allowed Origins in Reown dashboard
✅ Monitor usage statistics
✅ Report suspicious domains to Reown
```

### 2. **Consume Your Rate Limit**
**Impact**: Low - Reown has generous limits

**Prevention**:
```
✅ Monitor connection counts
✅ Reown auto-throttles suspicious activity
✅ Upgrade plan if needed (or rotate ID)
```

### 3. **Create Fake App Using Your Branding**
**Impact**: Medium - Phishing risk

**Prevention**:
```
✅ Configure allowed origins (blocks fake sites)
✅ Educate users about official domain
✅ Use SSL certificate (HTTPS)
✅ Report phishing attempts
```

---

## 🔍 How to Verify Your Project ID is Secure

### Step 1: Check Allowed Origins
1. Go to https://cloud.reown.com
2. Open your EarnestPay project
3. Navigate to **Settings** → **Allowed Origins**
4. Verify only your domains are listed

### Step 2: Review Connection Logs
1. In Reown dashboard, check **Analytics**
2. Review connection attempts
3. Look for unknown domains
4. Report suspicious activity

### Step 3: Test Domain Restrictions
1. Try using your app on localhost → Should work ✅
2. Try creating test page on different domain → Should fail ❌

---

## 📊 Comparison: What's Public vs Private

| Item | Public? | Safe to Commit? | Why |
|------|---------|-----------------|-----|
| Project ID | ✅ Yes | ✅ Yes | For analytics only, no auth |
| API Keys (read-only) | ⚠️ Depends | ⚠️ Depends | Check provider docs |
| Private Keys | ❌ No | ❌ NEVER | Can control funds |
| Seed Phrases | ❌ No | ❌ NEVER | Can control funds |
| Database Passwords | ❌ No | ❌ NEVER | Can access data |
| JWT Secrets | ❌ No | ❌ NEVER | Can create tokens |

---

## 🎯 Real-World Example

### Scenario: Someone Copies Your Project ID

**What happens:**
1. Attacker creates fake-earnestpay.com
2. Uses your Project ID: `c67f800f8fe6b8e12232a9d1a8ea363c`
3. User visits fake site and tries to connect wallet

**Result if you configured origins:**
```
❌ Connection fails
❌ Reown blocks the request
❌ User sees error message
✅ No funds at risk
```

**Result if you DIDN'T configure origins:**
```
⚠️ Connection works (but only for WalletConnect routing)
⚠️ Uses your analytics quota
⚠️ Attacker still can't steal funds (wallet security)
⚠️ But confusing for users
```

---

## 🚨 What to Do If You Suspect Misuse

### Immediate Actions
1. **Check Reown Dashboard**
   - Review connection logs
   - Look for suspicious domains
   - Check usage spikes

2. **Verify Allowed Origins**
   - Ensure only your domains listed
   - Remove any unknown entries
   - Save changes

3. **Rotate Project ID** (if needed)
   ```bash
   # In Reown dashboard
   1. Create new project
   2. Get new Project ID
   3. Update .env file
   4. Redeploy app
   ```

### Long-term Prevention
- Set up usage alerts
- Regular security audits
- Keep dependencies updated
- Monitor user reports

---

## 📚 Additional Resources

### Official Documentation
- [Reown Security Best Practices](https://docs.reown.com/appkit/features/security)
- [WalletConnect Security Model](https://docs.reown.com/advanced/security)

### Web3 Security
- [MetaMask Security Tips](https://metamask.io/security/)
- [Web3 Security Checklist](https://consensys.github.io/smart-contract-best-practices/)

### Report Security Issues
- Reown Support: support@reown.com
- GitHub Security: https://github.com/gboigwe/earnestpay/security

---

## ✅ Quick Checklist

Before deploying to production:

- [ ] Configured allowed origins in Reown dashboard
- [ ] Added production domain to allowed list
- [ ] Removed test/development domains from production config
- [ ] Tested that connections work on allowed domains
- [ ] Tested that connections FAIL on non-allowed domains
- [ ] Set up usage monitoring/alerts
- [ ] Documented security practices for team
- [ ] Private keys are in `.gitignore` (not committed)

---

## 💡 Summary

**TL;DR**:
- ✅ Project ID is safe to use publicly
- ✅ Configure allowed origins to prevent misuse
- ✅ Monitor usage regularly
- ❌ Never expose private keys or seed phrases
- 🎯 Focus on domain verification, not ID secrecy

**Your Project ID**: `c67f800f8fe6b8e12232a9d1a8ea363c`
**Security Level**: Safe ✅ (when origins configured)

---

*Last Updated: January 2025*
*For questions: Open an issue on GitHub*
