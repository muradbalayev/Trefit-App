# 🎯 Trefit Onboarding Flow

Modern, dark-themed onboarding experience for first-time users.

## 🌟 Features

### Visual Design
- ✅ **Dark Theme:** Black background with neon lime (#C7FF00) accents
- ✅ **Lottie Animations:** Smooth, engaging animations on each screen
- ✅ **Smooth Transitions:** Fade + slide animations between screens
- ✅ **Pagination Dots:** Visual progress indicator
- ✅ **Glowing Button:** Neon-styled "Get Started" button with shadow

### User Experience
- ✅ **3-Step Flow:** 
  1. Discover Your Trainer
  2. Turn Effort into Progress
  3. Fitness, Made Simple
- ✅ **Skip Option:** Top-right skip button (except last screen)
- ✅ **Smart Navigation:** Auto-advances to Auth after completion
- ✅ **One-Time Show:** Uses AsyncStorage to prevent repeat views

### Technical Implementation
- ✅ **AsyncStorage:** Persistent onboarding flag
- ✅ **Animated API:** Smooth fade and slide transitions
- ✅ **Responsive:** Adapts to all screen sizes
- ✅ **Performance:** Optimized animations with useNativeDriver

## 📱 Screen Flow

```
App Launch
    ↓
Check hasSeenOnboarding
    ↓
┌─────────────────┐
│ Not Seen?       │
│   ↓             │
│ Onboarding      │
│   Screen 1      │
│   Screen 2      │
│   Screen 3      │
│   ↓             │
│ Get Started     │
└─────────────────┘
    ↓
Set hasSeenOnboarding = true
    ↓
Auth Navigator (Login/Register)
```

## 🎨 Design Specifications

### Screen 1: Discover Your Trainer
- **Title:** "Find the right trainer for your goals"
- **Subtitle:** "Choose certified trainers across fitness, pilates, and strength — all in one app."
- **Animation:** Lottie onboarding1

### Screen 2: Turn Effort into Progress
- **Title:** "Turn effort into progress"
- **Subtitle:** "Complete daily tasks, earn points, and track your body progress visually."
- **Animation:** Lottie onboarding1

### Screen 3: Fitness, Made Simple
- **Title:** "Fitness, made simple"
- **Subtitle:** "Chat with your trainer, follow custom plans, and see real results."
- **Animation:** Lottie onboarding1
- **Button:** "Get Started" (instead of "Next")

## 🔧 Development

### Testing Onboarding
To reset and see onboarding again during development:

```javascript
import { resetOnboarding } from '@/utils/resetOnboarding';

// Call this to reset
await resetOnboarding();

// Then restart the app
```

### Adding New Screens
Edit `ONBOARDING_DATA` in `OnboardingScreen.jsx`:

```javascript
const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Your Title',
    subtitle: 'Your subtitle text',
    animation: Lotties.yourAnimation,
  },
  // Add more screens...
];
```

### Customizing Animations
1. Add Lottie JSON to `assets/lotties/`
2. Import in `constants/Lotties.js`
3. Use in `ONBOARDING_DATA`

## 📦 Files Structure

```
screens/onboarding/
├── OnboardingScreen.jsx    # Main onboarding component
└── README.md               # This file

navigators/
└── OnboardingNavigator.jsx # Onboarding stack navigator

utils/
└── resetOnboarding.js      # Helper functions

constants/
└── Lotties.js              # Lottie animation imports
```

## 🎯 User Flow

1. **First Launch:**
   - User sees onboarding (3 screens)
   - Can skip or go through all screens
   - Clicks "Get Started"
   - Flag saved to AsyncStorage
   - Navigates to Auth

2. **Subsequent Launches:**
   - App checks AsyncStorage
   - Onboarding skipped
   - Goes directly to Auth or Main app

## 🎨 Styling

### Colors
- **Background:** `#000000` (Colors.BACKGROUND)
- **Brand:** `#C7FF00` (Colors.BRAND)
- **Text:** `#FFFFFF` (Colors.TEXT)
- **Secondary Text:** `#94A3B8` (Colors.TEXT_SECONDARY)

### Typography
- **Title:** Bold, 28px
- **Subtitle:** Regular, 16px
- **Button:** Bold, 18px

### Animations
- **Fade Duration:** 200-300ms
- **Slide Distance:** 50px
- **Easing:** Native driver optimized

## 🚀 Performance

- ✅ **Native Driver:** All animations use native driver
- ✅ **Lazy Loading:** Screens rendered on demand
- ✅ **Optimized Images:** Lottie animations are lightweight
- ✅ **Minimal Re-renders:** Efficient state management

## 📝 Notes

- Onboarding only shows for non-authenticated users
- Flag persists across app restarts
- Can be reset for testing purposes
- Smooth transition to Auth navigator
- No back navigation from onboarding

---

**Built with ❤️ for Trefit**
