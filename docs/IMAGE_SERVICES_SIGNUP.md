# 🎨 HƯỚNG DẪN ĐĂNG KÝ IMAGE GENERATION SERVICES

## 🏆 OPTION 1: STABILITY AI (KHUYẾN NGHỊ - CHẤT LƯỢNG TỐT NHẤT!)

### Tại sao chọn Stability AI?
- ✅ **Chất lượng:** 9/10 - Tốt nhất trong 3 options
- ✅ **Tốc độ:** 3-5 giây (nhanh nhất!)
- ✅ **Free tier:** 25 credits/ngày (~25 ảnh/ngày)
- ✅ **Giá rẻ nhất:** $0.002-0.01/image nếu cần nhiều hơn
- ✅ **Models:** SD 3.5, SDXL, Core

### Cách đăng ký (3 phút):

#### Bước 1: Đăng ký tài khoản
1. Truy cập: https://platform.stability.ai/
2. Click "Sign Up" (góc phải trên)
3. Đăng ký bằng email hoặc Google

#### Bước 2: Xác nhận email
1. Check email inbox
2. Click link xác nhận
3. Login lại

#### Bước 3: Lấy API Key
1. Sau khi login, vào: https://platform.stability.ai/account/keys
2. Click "Create API Key"
3. Đặt tên: "K2W System"
4. Click "Create"
5. **Copy key** (dạng: `sk-...`)

#### Bước 4: Add vào .env
```bash
# Thêm vào apps/api/.env
STABILITY_API_KEY=sk-your-key-here
```

#### Bước 5: Restart server
```bash
cd apps/api
pnpm dev
```

**VẬY LÀ XONG!** 🎉

### Free Tier:
- 25 credits/ngày (reset hàng ngày)
- 1 credit = 1 ảnh SD3.5
- **~750 ảnh/tháng MIỄN PHÍ!**

---

## 🆓 OPTION 2: HUGGING FACE (100% MIỄN PHÍ MÃI MÃI!)

### Tại sao chọn Hugging Face?
- ✅ **100% MIỄN PHÍ:** Không giới hạn
- ✅ **Không cần thẻ:** Không cần credit card
- ✅ **1000 req/hour:** Đủ cho hầu hết use cases
- ✅ **Chất lượng:** 7/10 - Tốt
- ✅ **Models:** FLUX, SDXL, SD 1.5

### Cách đăng ký (2 phút):

#### Bước 1: Đăng ký tài khoản
1. Truy cập: https://huggingface.co/join
2. Fill form:
   - Email
   - Username
   - Password
3. Click "Sign Up"

#### Bước 2: Xác nhận email
1. Check email
2. Click link xác nhận
3. Login

#### Bước 3: Tạo Access Token
1. Vào: https://huggingface.co/settings/tokens
2. Click "New token"
3. Điền:
   - Name: "K2W System"
   - Role: Chọn "read"
4. Click "Generate token"
5. **Copy token** (dạng: `hf_...`)

#### Bước 4: Add vào .env
```bash
# Thêm vào apps/api/.env
HUGGINGFACE_TOKEN=hf_your_token_here
```

#### Bước 5: Restart server
```bash
cd apps/api
pnpm dev
```

**HOÀN TOÀN MIỄN PHÍ!** 🎉

### Free Tier:
- 1000 requests/hour
- Unlimited usage
- **Hoàn toàn miễn phí mãi mãi!**

---

## 🎯 OPTION 3: POLLINATIONS (KHÔNG CẦN ĐĂNG KÝ!)

### Tại sao chọn Pollinations?
- ✅ **Không cần đăng ký**
- ✅ **Không cần API key**
- ✅ **100% miễn phí**
- ✅ **Chỉ cần gọi URL**
- ⚠️ Chất lượng: 6/10 - OK

### Cách dùng:
**KHÔNG CẦN LÀM GÌ!** Hệ thống tự động dùng nếu không có Stability/Hugging Face.

---

## 📊 SO SÁNH & KHUYẾN NGHỊ

| Feature | Stability AI | Hugging Face | Pollinations |
|---------|-------------|--------------|--------------|
| **Chất lượng** | 9/10 ⭐⭐⭐⭐⭐ | 7/10 ⭐⭐⭐⭐ | 6/10 ⭐⭐⭐ |
| **Tốc độ** | 3-5s 🚀 | 10-15s | 5-8s |
| **Chi phí** | 25 free/ngày | 100% FREE ♾️ | 100% FREE ♾️ |
| **Đăng ký** | Cần (3 min) | Cần (2 min) | Không cần! |
| **API key** | Cần | Cần | Không cần! |
| **Giới hạn** | 25/ngày free | 1000/giờ | Không |

### 🎯 KHUYẾN NGHỊ CỦA TÔI:

1. **BẠN CẦN CHẤT LƯỢNG TỐT NHẤT?**
   → Chọn **Stability AI** (25 ảnh/ngày free đủ xài!)

2. **BẠN CẦN NHIỀU ẢNH?**
   → Chọn **Hugging Face** (unlimited, 100% free!)

3. **BẠN KHÔNG MUỐN ĐĂNG KÝ?**
   → Dùng **Pollinations** (tự động, không cần key!)

4. **BẠN MUỐN CẢ 3?**
   → Đăng ký **cả Stability + Hugging Face**!
   - Stability cho ảnh chất lượng cao (25/ngày)
   - Hugging Face cho số lượng lớn (unlimited)
   - Pollinations backup tự động

---

## 🚀 SETUP NHANH (RECOMMENDED)

### Setup CẢ 2 services (Tốt nhất!)

```bash
# 1. Đăng ký Stability AI (3 phút)
# https://platform.stability.ai/

# 2. Đăng ký Hugging Face (2 phút)
# https://huggingface.co/join

# 3. Add vào .env
STABILITY_API_KEY=sk-...
HUGGINGFACE_TOKEN=hf_...

# 4. Restart
cd apps/api && pnpm dev
```

**Kết quả:**
- ✅ 25 ảnh chất lượng cao/ngày (Stability)
- ✅ Unlimited ảnh tốt/tháng (Hugging Face)
- ✅ Tự động fallback (Pollinations)
- ✅ **Hoàn toàn MIỄN PHÍ!**

---

## ❓ FAQ

### Q: Tôi nên chọn service nào?
**A:** Stability AI cho chất lượng, Hugging Face cho số lượng. Tốt nhất là dùng cả 2!

### Q: Free tier đủ dùng không?
**A:**
- Stability: 25 ảnh/ngày = ~750 ảnh/tháng ✅
- Hugging Face: Unlimited! ✅
- **Đủ cho hầu hết projects!**

### Q: Có cần credit card không?
**A:** KHÔNG! Cả 3 options đều không cần credit card.

### Q: Sau khi hết free tier thì sao?
**A:**
- Stability: Chuyển sang Hugging Face (unlimited!)
- Hugging Face: Vẫn free mãi mãi!
- Pollinations: Vẫn free mãi mãi!

### Q: Tôi lười đăng ký, có cách nào không?
**A:** Dùng Pollinations! Không cần đăng ký, không cần key, tự động hoạt động!

---

## 💡 PRO TIPS

### Tip 1: Optimize usage
```
Sáng: Dùng Stability (25 ảnh chất lượng cao)
Chiều: Dùng Hugging Face (unlimited)
Fallback: Pollinations tự động
```

### Tip 2: Save credits
```
Test/Development: Dùng Hugging Face
Production/Important: Dùng Stability
```

### Tip 3: Batch processing
```
Tạo nhiều ảnh cùng lúc với Hugging Face (free!)
Cherry-pick ảnh đẹp nhất
Regenerate với Stability nếu cần chất lượng cao hơn
```

---

**🎉 BẮT ĐẦU NGAY! Chỉ mất 5 phút để có hệ thống tạo ảnh MIỄN PHÍ!**

Cần giúp? Hỏi tôi bất cứ lúc nào! 😊
