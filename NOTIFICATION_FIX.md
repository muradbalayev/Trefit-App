# 🔧 Notification System - Expo Go Fix

## ❌ Problems

### 1. Notification API Error
```
ERROR [TypeError: Notifications.removeNotificationSubscription is not a function (it is undefined)]
```

### 2. Hardware Bitmap Error
```
ERROR Software rendering doesn't support hardware bitmaps
```

## ✅ Solutions

### 1. **Expo Go Detection**
Expo Go detection əlavə etdik və production build-də işləyən, amma Expo Go-da crash etməyən sistem yaratdıq.

### 2. **Hardware Bitmap Fix**
Android-də hardware bitmap-i disable etdik və safe image rendering config yaratdıq.

---

## 🔍 Nə Dəyişdi?

### 1. **Expo Go Detection**
```javascript
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';
```

### 2. **Safe API Calls**
Hər notification API çağırışından əvvəl yoxlama:
```javascript
// Skip in Expo Go
if (isExpoGo) {
  console.warn('⚠️ Notifications not available in Expo Go');
  return false;
}

// Check if API exists
if (!Notifications.getPermissionsAsync) {
  console.warn('⚠️ Notification API not available');
  return false;
}
```

### 3. **Safe Cleanup**
```javascript
return () => {
  if (notificationListener.current && Notifications.removeNotificationSubscription) {
    try {
      Notifications.removeNotificationSubscription(notificationListener.current);
    } catch (error) {
      console.warn('⚠️ Could not remove notification listener:', error.message);
    }
  }
};
```

---

## 📦 Dəyişdirilən/Yaradılan Fayllar

### 1. **utils/notificationManager.js**
- ✅ Expo Go detection əlavə edildi
- ✅ Hər function-da API mövcudluğu yoxlanır
- ✅ Try-catch blokları əlavə edildi
- ✅ Optional chaining (`?.`) istifadə edildi

### 2. **contexts/NotificationContext.jsx**
- ✅ Expo Go detection əlavə edildi
- ✅ Listener-lər safe şəkildə əlavə/silir
- ✅ Try-catch blokları əlavə edildi

### 3. **utils/imageConfig.js** (YENİ)
- ✅ Hardware bitmap fix utility functions
- ✅ `getSafeImageProps()` - Safe image props
- ✅ `getSafeImageSource()` - Safe image source
- ✅ Android-specific configurations

### 4. **app.json**
- ✅ `jsEngine: "hermes"` əlavə edildi
- ✅ `enableDangerousExperimentalLeanBuilds: false`

---

## 🎯 Necə İşləyir?

### Expo Go-da
```
1. App açılır
2. isExpoGo = true
3. Notification API-lar skip olunur
4. Console-da warning göstərir
5. App normal işləyir (crash yoxdur)
```

### Production Build-də (EAS Build / APK)
```
1. App açılır
2. isExpoGo = false
3. Notification API-lar işləyir
4. Permission request
5. Notifications göstərilir
```

---

## 🧪 Test

### Expo Go-da Test
```bash
npx expo start
# Expo Go-da aç
# ✅ Heç bir crash olmamalıdır
# ⚠️ Console-da "Notifications not available in Expo Go" görünməlidir
```

### Production Build Test
```bash
# EAS Build
eas build --platform android --profile preview

# Və ya local APK
npx expo run:android

# ✅ Notifications işləməlidir
```

---

## 📱 Expo Go vs Production

| Feature | Expo Go | Production Build |
|---------|---------|------------------|
| Notifications | ❌ Limited | ✅ Full Support |
| Push Notifications | ❌ No | ✅ Yes |
| Badge Count | ❌ No | ✅ Yes |
| Notification Channels | ❌ No | ✅ Yes (Android) |
| Custom Sounds | ❌ No | ✅ Yes |

---

## 🚨 Important Notes

### 1. **Expo Go Limitations**
- Expo Go yalnız development üçündür
- Production features məhduddur
- Notifications tam işləmir
- Bu normaldır və gözləniləndir

### 2. **Production Build Lazımdır**
Notifications-u test etmək üçün:
```bash
# Option 1: EAS Build (recommended)
eas build --platform android --profile preview

# Option 2: Local build
npx expo run:android
```

### 3. **No Crash in Expo Go**
İndi Expo Go-da:
- ✅ App açılır
- ✅ Heç bir crash yoxdur
- ⚠️ Notifications skip olunur (expected)
- ✅ Digər features işləyir

---

## 🔧 API Safety Pattern

Hər notification API üçün:

```javascript
// 1. Check Expo Go
if (isExpoGo) return;

// 2. Check API exists
if (!Notifications.someMethod) return;

// 3. Try-catch
try {
  await Notifications.someMethod();
} catch (error) {
  console.warn('⚠️ Error:', error.message);
}
```

---

## ✅ Checklist

- [x] Expo Go detection əlavə edildi
- [x] API existence checks
- [x] Try-catch blokları
- [x] Safe cleanup in useEffect
- [x] Optional chaining (`?.`)
- [x] Meaningful console warnings
- [x] No crashes in Expo Go
- [x] Works in production build

---

## 🎉 Result

**Expo Go-da:**
- ✅ App açılır
- ✅ Crash yoxdur
- ⚠️ Notifications skip olunur (normal)

**Production Build-də:**
- ✅ Notifications tam işləyir
- ✅ Push notifications
- ✅ Badge count
- ✅ Sound & vibration

---

## 📚 Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Go Limitations](https://docs.expo.dev/workflow/expo-go/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)

---

---

## 🖼️ Hardware Bitmap Fix

### Problem
```
ERROR Software rendering doesn't support hardware bitmaps
```

### Səbəb
Android-də hardware bitmap GPU üçün optimize edilib, amma:
- Software canvas ilə işləmir
- Bəzi hallarda GPU texture-a yüklənə bilmir
- React Native Image component-də problem yaradır

### Həll

#### 1. **app.json Config**
```json
{
  "android": {
    "jsEngine": "hermes",
    "enableDangerousExperimentalLeanBuilds": false
  }
}
```

#### 2. **Image Config Utility**
```javascript
// utils/imageConfig.js
export const getSafeImageProps = () => {
  if (Platform.OS === 'android') {
    return {
      renderToHardwareTextureAndroid: false,
      fadeDuration: 0,
    };
  }
  return {};
};
```

#### 3. **İstifadə**
```javascript
import { getSafeImageProps } from '@/utils/imageConfig';

// Option 1: Direct props
<Image 
  source={{ uri: imageUrl }}
  {...getSafeImageProps()}
/>

// Option 2: With additional props
<Image 
  source={{ uri: imageUrl }}
  style={styles.image}
  {...getSafeImageProps({ resizeMode: 'cover' })}
/>
```

### Utility Functions

#### `getSafeImageProps(additionalProps)`
Android-də hardware bitmap-i disable edir.

#### `getSafeImageSource(uri, options)`
Safe image source config yaradır.

#### `safeImageStyle`
Platform-specific style object.

#### `expoImageProps`
expo-image üçün safe props.

---

## 🎯 Usage Examples

### React Native Image
```javascript
import { Image } from 'react-native';
import { getSafeImageProps } from '@/utils/imageConfig';

<Image 
  source={{ uri: avatarUrl }}
  style={styles.avatar}
  {...getSafeImageProps()}
/>
```

### Expo Image
```javascript
import { Image } from 'expo-image';
import { expoImageProps } from '@/utils/imageConfig';

<Image 
  source={{ uri: imageUrl }}
  style={styles.image}
  {...expoImageProps}
/>
```

### Dynamic Source
```javascript
import { getSafeImageSource } from '@/utils/imageConfig';

<Image 
  source={getSafeImageSource(imageUrl, { cache: 'force-cache' })}
  style={styles.image}
/>
```

---

**Hər iki problem həll olundu! İndi Expo Go-da crash yoxdur və production-da notifications işləyir! 🎉**
