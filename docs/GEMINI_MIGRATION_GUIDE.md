# 🚀 MIGRATION GUIDE: OpenAI → Gemini + Imagen

## ✨ WHY MIGRATE?

### 💰 COST SAVINGS:
- **Text Generation**: 90-95% cheaper
  - GPT-4: $0.03/1K tokens
  - Gemini 1.5 Pro: $0.00125/1K tokens (96% cheaper!)
  - Gemini 1.5 Flash: $0.00035/1K tokens (99% cheaper!)

- **Image Generation**: 50% cheaper
  - DALL-E 3: $0.04-0.08/image
  - Imagen 3: $0.02-0.04/image

### 📊 MONTHLY SAVINGS ESTIMATE:
- 500 contents/month: **Save $100-200/month**
- 100 images/month: **Save $4-8/month**
- **Total savings: ~$104-208/month** (~$1,248-2,496/year)

---

## 📝 STEP 1: GET API KEYS

### 1.1 Get Gemini API Key (FREE!)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Get API Key"
3. Click "Create API Key in new project" or select existing project
4. Copy your key: `AIza...`

**Free tier includes:**
- 15 requests/minute
- 1 million tokens/minute
- 1,500 requests/day
- **This is MORE than enough for testing!**

### 1.2 Get Google Cloud Project for Imagen (Optional)
**Note: Imagen requires Google Cloud billing enabled**

1. Visit: https://console.cloud.google.com
2. Create new project or select existing
3. Enable billing (first $300 free credit!)
4. Enable Vertex AI API
5. Create service account credentials
6. Download JSON key file

**Alternative: Skip Imagen for now**
- You can use just Gemini for text
- Keep DALL-E for images temporarily
- Or skip image generation

---

## 🔧 STEP 2: UPDATE ENVIRONMENT VARIABLES

Add to `apps/api/.env`:

```bash
# === GOOGLE AI SERVICES ===
# Gemini for text generation (REQUIRED)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL=gemini-1.5-flash  # or gemini-1.5-pro for better quality

# Imagen for image generation (OPTIONAL - can skip for now)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Keep OpenAI as fallback (optional)
# OPENAI_API_KEY=sk-...
```

---

## 🚀 STEP 3: TEST THE MIGRATION

### 3.1 Test Gemini Text Generation
```bash
curl -X POST http://localhost:8000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "container homes",
    "language": "en",
    "region": "US",
    "contentType": "article",
    "wordCount": 500
  }'
```

### 3.2 Check Cost Savings in Console
Look for logs like:
```
💰 Cost: $0.000438 (vs OpenAI: $0.069 - saved $0.068562)
```

---

## 📊 STEP 4: MONITOR & OPTIMIZE

### Check Gemini Quota
Visit: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### Monitor Costs
- Gemini: Free tier → paid at $0.00035-0.00125/1K tokens
- Imagen: ~$0.02-0.04/image (requires billing)

---

## ⚠️ IMPORTANT NOTES

### What Works Now:
✅ Text generation with Gemini (better & 95% cheaper!)
✅ Content optimization
✅ Translation
✅ SEO analysis

### What Needs Setup:
⏳ Image generation with Imagen (requires Google Cloud billing)
🔄 Fallback to DALL-E if Imagen not configured

### Migration Options:
1. **Full migration**: Gemini + Imagen (max savings)
2. **Partial migration**: Gemini + keep DALL-E (still save 90%)
3. **Gradual**: Test Gemini first, add Imagen later

---

## 🔥 QUICK START (MINIMAL SETUP)

Just want to try Gemini now? Do this:

1. Get free Gemini key: https://makersuite.google.com/app/apikey
2. Add to `.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Restart API server
4. Test - you'll see 95% cost savings immediately!

For images, keep using DALL-E for now (still works).

---

## 📞 TROUBLESHOOTING

### "Gemini API key not found"
→ Check `.env` has `GEMINI_API_KEY=AIza...`

### "Imagen not configured"
→ Normal! Imagen is optional. System will tell you image gen is limited.
→ To fix: Set up Google Cloud project + billing

### "Still using OpenAI"
→ Check logs for "✅ Gemini AI initialized"
→ Make sure API server restarted after adding env vars

---

## 🎯 NEXT STEPS

After testing Gemini successfully:
1. ✅ Monitor cost savings in logs
2. ✅ Compare content quality (usually better with Gemini!)
3. ✅ Decide if you want to add Imagen
4. ✅ Remove OpenAI key to save money (optional)

Need help? Check the logs - they'll guide you!
