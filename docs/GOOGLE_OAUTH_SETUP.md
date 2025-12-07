# 🔐 دليل إعداد Google OAuth

> **مهم جداً**: يجب تنفيذ هذه الخطوات لتفعيل تسجيل الدخول بـ Google

---

## 📋 المعلومات المطلوبة

```
Supabase Project ID: judlqxxkbptuauaexjxu
Supabase URL: https://judlqxxkbptuauaexjxu.supabase.co
Callback URL: https://judlqxxkbptuauaexjxu.supabase.co/auth/v1/callback
```

---

## 🚀 الخطوات (10 دقائق)

### الخطوة 1: فتح Google Cloud Console

1. افتح المتصفح واذهب إلى:
   ```
   https://console.cloud.google.com/
   ```

2. سجل دخول بحساب: `test2autoai@gmail.com`

---

### الخطوة 2: إنشاء مشروع جديد

1. في الأعلى، اضغط على **Select a project** (بجانب "Google Cloud")
2. اضغط **NEW PROJECT** (مشروع جديد)
3. أدخل البيانات:
   - **Project name**: `English Mastery Game`
   - **Location**: اتركه كما هو
4. اضغط **CREATE**
5. انتظر حتى يتم إنشاء المشروع (30 ثانية)
6. اضغط على الإشعار **SELECT PROJECT** أو اختره من القائمة

---

### الخطوة 3: إعداد OAuth Consent Screen

1. من القائمة الجانبية اليسرى:
   - اضغط **APIs & Services**
   - ثم **OAuth consent screen**

2. اختر **External** ثم اضغط **CREATE**

3. املأ البيانات في صفحة "Edit app registration":

   **App information:**
   - **App name**: `English Mastery Battle`
   - **User support email**: اختر `test2autoai@gmail.com`
   
   **App logo:** (اتركه فارغ)
   
   **App domain:** (اتركه فارغ)
   
   **Developer contact information:**
   - **Email addresses**: `test2autoai@gmail.com`

4. اضغط **SAVE AND CONTINUE**

5. في صفحة "Scopes": اضغط **SAVE AND CONTINUE** (بدون تغيير)

6. في صفحة "Test users": اضغط **SAVE AND CONTINUE** (بدون تغيير)

7. في صفحة "Summary": اضغط **BACK TO DASHBOARD**

---

### الخطوة 4: إنشاء OAuth Credentials

1. من القائمة الجانبية:
   - اضغط **APIs & Services**
   - ثم **Credentials**

2. اضغط **+ CREATE CREDENTIALS** (في الأعلى)

3. اختر **OAuth client ID**

4. اختر:
   - **Application type**: `Web application`
   - **Name**: `Supabase Auth`

5. في قسم **Authorized redirect URIs**:
   - اضغط **+ ADD URI**
   - الصق هذا الرابط:
   ```
   https://judlqxxkbptuauaexjxu.supabase.co/auth/v1/callback
   ```

6. اضغط **CREATE**

7. ⚠️ **مهم جداً - احفظ هذه البيانات:**
   
   ستظهر نافذة تحتوي على:
   ```
   Client ID: XXXXXXXXXX.apps.googleusercontent.com
   Client Secret: GOCSPX-XXXXXXXXXXXXXXXX
   ```
   
   📋 **انسخها وأرسلها لي!**

---

## 📤 ماذا ترسل لي؟

أرسل لي رسالة بهذا الشكل:

```
Client ID: [الصق هنا]
Client Secret: [الصق هنا]
```

---

## 🔧 ماذا سأفعل بعدها؟

1. سأضيف هذه البيانات إلى Supabase
2. سأفعّل Google Provider
3. سيعمل تسجيل الدخول بـ Google! ✅

---

## ❓ مشاكل شائعة

### "Access Denied" أو "This app isn't verified"
- هذا طبيعي في وضع التطوير
- المستخدمون سيرون تحذير لكن يمكنهم المتابعة
- بعد إطلاق التطبيق يمكن التقدم لـ Google للتحقق

### لا أجد "OAuth consent screen"
- تأكد أنك اخترت المشروع الصحيح من القائمة العلوية
- تأكد أنك في "APIs & Services"

### الـ Callback URL لا يعمل
- تأكد من نسخ الرابط بالكامل:
  ```
  https://judlqxxkbptuauaexjxu.supabase.co/auth/v1/callback
  ```

---

*آخر تحديث: 6 ديسمبر 2025*
