/**
 * Universal Hlynk Notification Sound Utility
 *
 * Plays '/assets/tone/loud.wav' across all platforms and devices:
 * - Desktop browsers (Chrome, Edge, Firefox, Safari)
 * - Mobile browsers & PWA (iOS standalone, Android PWA)
 *
 * Features:
 * - Dual-engine: HTML5 Audio with AudioContext auto-unlock
 * - Preloaded audio instance with rapid reset & clone fallback
 * - Automatic interaction-based unlocking for iOS / Android autoplay restrictions
 * - Debounce / cooldown protection to prevent duplicate overlapping sounds
 * - LocalStorage sound enabled toggle (enabled by default)
 */

export const NOTIFICATION_SOUND_URL = "/assets/tone/loud.wav";
const SOUND_STORAGE_KEY = "hlynk_notification_sound_enabled";
const SOUND_COOLDOWN_MS = 600; // Minimum time between consecutive sound triggers

let cachedAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let isAudioUnlocked = false;
let lastPlayTimestamp = 0;

/**
 * Check if notification sound is enabled in user settings (default: true)
 */
export function isNotificationSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
}

/**
 * Toggle or set notification sound preference
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors
  }
}

/**
 * Preload the audio file and prepare Audio element
 */
function getPreloadedAudio(): HTMLAudioElement {
  if (!cachedAudio) {
    cachedAudio = new Audio(NOTIFICATION_SOUND_URL);
    cachedAudio.preload = "auto";
    cachedAudio.volume = 1.0;
  }
  return cachedAudio;
}

/**
 * Unlock audio on modern browsers requiring a user gesture (iOS Safari & Android Chrome).
 * Automatically invoked on first click / touch / keydown.
 */
export function initAudioUnlock(): void {
  if (typeof window === "undefined" || isAudioUnlocked) return;

  const unlock = () => {
    if (isAudioUnlocked) return;

    try {
      // 1. Prime HTMLAudioElement
      const audio = getPreloadedAudio();
      audio.load();

      // 2. Prime AudioContext if available
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContext) {
          audioContext = new AudioCtx();
        }
        if (audioContext.state === "suspended") {
          audioContext.resume().catch(() => {});
        }
      }

      isAudioUnlocked = true;
    } catch (_) {
      // Autoplay unlock attempt
    } finally {
      // Remove one-time unlock listeners
      window.removeEventListener("click", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("pointerdown", unlock, true);
    }
  };

  window.addEventListener("click", unlock, {
    capture: true,
    once: true,
    passive: true,
  });
  window.addEventListener("touchstart", unlock, {
    capture: true,
    once: true,
    passive: true,
  });
  window.addEventListener("keydown", unlock, {
    capture: true,
    once: true,
    passive: true,
  });
  window.addEventListener("pointerdown", unlock, {
    capture: true,
    once: true,
    passive: true,
  });

  // Pre-instantiate audio element immediately
  try {
    getPreloadedAudio();
  } catch (_) {}
}

/**
 * Fetch and decode the audio buffer for zero-latency Web Audio playback
 */
async function loadAudioBuffer(): Promise<AudioBuffer | null> {
  if (audioBuffer) return audioBuffer;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContext) audioContext = new AudioCtx();

    const response = await fetch(NOTIFICATION_SOUND_URL);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch {
    return null;
  }
}

/**
 * Play the Hlynk notification sound ('loud.wav') universally across devices.
 *
 * @param options.force - If true, bypasses user mute preference (e.g. for user testing)
 * @param options.volume - Playback volume (0.0 to 1.0, defaults to 1.0)
 * @returns Promise<boolean> - True if sound successfully started, false otherwise
 */
export async function playNotificationSound(
  options: { force?: boolean; volume?: number } = {},
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const { force = false, volume = 1.0 } = options;

  if (!force && !isNotificationSoundEnabled()) {
    return false;
  }

  // Prevent multiple overlapping plays within cooldown window
  const now = Date.now();
  if (now - lastPlayTimestamp < SOUND_COOLDOWN_MS) {
    return false;
  }
  lastPlayTimestamp = now;

  // Strategy 1: Try Web Audio API if running and unlocked (fastest, zero-latency)
  try {
    if (audioContext && audioContext.state === "running") {
      const buffer = audioBuffer || (await loadAudioBuffer());
      if (buffer) {
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = Math.max(0, Math.min(1, volume));
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
        return true;
      }
    }
  } catch (_) {
    // Fall back to HTMLAudioElement
  }

  // Strategy 2: HTMLAudioElement with clone/reset
  try {
    const audio = getPreloadedAudio();
    audio.volume = Math.max(0, Math.min(1, volume));

    // If audio is already playing or ended, reset or clone
    if (!audio.paused) {
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = audio.volume;
      const playPromise = clone.play();
      if (playPromise !== undefined) {
        await playPromise;
        return true;
      }
    } else {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        return true;
      }
    }
    return true;
  } catch (err: any) {
    // If blocked by browser autoplay policy, resume context for next time
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    console.warn(
      "[NotificationSound] Audio playback prevented by browser:",
      err?.message || err,
    );
    return false;
  }
}

/**
 * Preview / Test the notification sound
 */
export async function testNotificationSound(): Promise<boolean> {
  return playNotificationSound({ force: true, volume: 1.0 });
}

// Automatically trigger unlock listeners when module loads in browser
if (typeof window !== "undefined") {
  initAudioUnlock();
}
