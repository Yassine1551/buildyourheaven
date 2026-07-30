import { Audio } from 'expo-av';

let tapSound: Audio.Sound | null = null;
let isLoaded = false;

export async function loadTapSound() {
  try {
    if (isLoaded) return;
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://cdn.freesound.org/previews/25/25879_37876-lq.mp3' },
      { shouldPlay: false, volume: 0.12 }
    );
    tapSound = sound;
    isLoaded = true;
  } catch (e) {
    // Silent fail - sound is non-critical
  }
}

export async function playTapSound() {
  try {
    if (!tapSound || !isLoaded) {
      await loadTapSound();
    }
    if (tapSound) {
      await tapSound.setPositionAsync(0);
      await tapSound.playAsync();
    }
  } catch (e) {
    // Silent fail
  }
}

export async function unloadSound() {
  try {
    if (tapSound) {
      await tapSound.unloadAsync();
      tapSound = null;
      isLoaded = false;
    }
  } catch (e) {
    // Silent fail
  }
}
