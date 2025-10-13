import { Audio } from 'expo-av';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isEnabled = true;
  }

  async loadSound(name, source) {
    try {
      const { sound } = await Audio.Sound.createAsync(source);
      this.sounds[name] = sound;
      return sound;
    } catch (error) {
      console.error(`Error loading sound ${name}:`, error);
      return null;
    }
  }

  async playSound(name) {
    if (!this.isEnabled) return;

    try {
      const sound = this.sounds[name];
      if (sound) {
        await sound.replayAsync();
      } else {
        console.warn(`Sound ${name} not loaded`);
      }
    } catch (error) {
      console.error(`Error playing sound ${name}:`, error);
    }
  }

  async unloadSound(name) {
    try {
      const sound = this.sounds[name];
      if (sound) {
        await sound.unloadAsync();
        delete this.sounds[name];
      }
    } catch (error) {
      console.error(`Error unloading sound ${name}:`, error);
    }
  }

  async unloadAll() {
    try {
      const promises = Object.keys(this.sounds).map(name => this.unloadSound(name));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error unloading all sounds:', error);
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Singleton instance
const soundManager = new SoundManager();

// Load notification sound on app start
export const initializeSounds = async () => {
  try {
    // Set audio mode for iOS
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Load message notification sound
    // You need to add message-notification.mp3 to assets/sounds/
    await soundManager.loadSound(
      'message',
      require('../assets/sounds/notification.mp3')
    );

    console.log('✅ Sounds initialized');
  } catch (error) {
    console.error('❌ Error initializing sounds:', error);
  }
};

export const playMessageSound = () => {
  soundManager.playSound('message');
};

export const enableSounds = (enabled) => {
  soundManager.setEnabled(enabled);
};

export default soundManager;
