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

export const NOTIFICATION_SOUND_URL = '/assets/tone/loud.wav';
const SOUND_STORAGE_KEY = 'hlynk_notification_sound_enabled';
const SOUND_COOLDOWN_MS = 300; // Minimum time between consecutive sound triggers

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
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggle or set notification sound preference
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  return audioContext;
}

/**
 * Preload the audio file and prepare Audio element
 */
function getPreloadedAudio(): HTMLAudioElement {
  if (!cachedAudio) {
    cachedAudio = new Audio(NOTIFICATION_SOUND_URL);
    cachedAudio.preload = 'auto';
    cachedAudio.volume = 1.0;
  }
  return cachedAudio;
}

/**
 * Unlock audio on modern browsers requiring a user gesture (iOS Safari & Android Chrome).
 * Automatically invoked on first click / touch / keydown.
 */
export function initAudioUnlock(): void {
  if (typeof window === 'undefined' || isAudioUnlocked) return;

  const unlock = async () => {
    if (isAudioUnlocked) return;

    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audio = getPreloadedAudio();
      audio.load();

      isAudioUnlocked = true;
    } catch (_) {
      // Autoplay unlock attempt
    } finally {
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      window.removeEventListener('pointerdown', unlock, true);
    }
  };

  window.addEventListener('click', unlock, { capture: true, once: true, passive: true });
  window.addEventListener('touchstart', unlock, { capture: true, once: true, passive: true });
  window.addEventListener('keydown', unlock, { capture: true, once: true, passive: true });
  window.addEventListener('pointerdown', unlock, { capture: true, once: true, passive: true });

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
    const ctx = getAudioContext();
    if (!ctx) return null;

    const response = await fetch(NOTIFICATION_SOUND_URL);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch {
    return null;
  }
}

/**
 * Built-in synthesized melodious notification chime (fallback when audio files fail to load)
 */
function playSynthesizedChime(ctx: AudioContext, volume = 1.0): boolean {
  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.8)), now);
    masterGain.connect(ctx.destination);

    // Two-tone bright notification bell: Note 1 (E5 - 659Hz) -> Note 2 (A5 - 880Hz)
    const tones = [
      { freq: 659.25, start: 0.0, duration: 0.15 },
      { freq: 880.0, start: 0.12, duration: 0.35 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.7, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Play the Hlynk notification sound universally across devices.
 * 
 * @param options.force - If true, bypasses user mute preference (e.g. for user testing)
 * @param options.volume - Playback volume (0.0 to 1.0, defaults to 1.0)
 * @returns Promise<boolean> - True if sound successfully started, false otherwise
 */
export async function playNotificationSound(options: { force?: boolean; volume?: number } = {}): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const { force = false, volume = 1.0 } = options;

  if (!force && !isNotificationSoundEnabled()) {
    return false;
  }

  const now = Date.now();
  if (!force && now - lastPlayTimestamp < SOUND_COOLDOWN_MS) {
    return false;
  }
  lastPlayTimestamp = now;

  const ctx = getAudioContext();

  // 1. Resume AudioContext if suspended (common after user click)
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (_) {}
  }

  // 2. Strategy 1: Web Audio API with decoded loud.wav buffer
  if (ctx && ctx.state === 'running') {
    try {
      const buffer = audioBuffer || (await loadAudioBuffer());
      if (buffer) {
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        gainNode.gain.value = Math.max(0, Math.min(1, volume));
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return true;
      }
    } catch (_) {}
  }

  // 3. Strategy 2: HTML5 Audio element playback
  try {
    const audio = getPreloadedAudio();
    audio.volume = Math.max(0, Math.min(1, volume));

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
    console.warn('[NotificationSound] HTMLAudio play failed, falling back to synthesizer:', err?.message || err);
  }

  // 4. Strategy 3: Guaranteed Synthesized Web Audio chime fallback
  if (ctx) {
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (ctx.state === 'running') {
        return playSynthesizedChime(ctx, volume);
      }
    } catch (_) {}
  }

  return false;
}

/**
 * Preview / Test the notification sound
 */
export async function testNotificationSound(): Promise<boolean> {
  return playNotificationSound({ force: true, volume: 1.0 });
}

// Automatically trigger unlock listeners when module loads in browser
if (typeof window !== 'undefined') {
  initAudioUnlock();
}
