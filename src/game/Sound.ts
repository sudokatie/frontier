/**
 * Sound system for Frontier using Web Audio API.
 * Generates retro-style synthesized sounds.
 */

type SoundType =
  | 'jump'
  | 'dock'
  | 'buy'
  | 'sell'
  | 'refuel'
  | 'select'
  | 'error';

class SoundSystem {
  private static instance: SoundSystem;
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private constructor() {}

  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.context) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    return this.context;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  resetContext(): void {
    this.context = null;
  }

  play(sound: SoundType): void {
    if (!this.enabled) return;

    const ctx = this.getContext();
    if (!ctx) return;

    switch (sound) {
      case 'jump':
        this.playJump(ctx);
        break;
      case 'dock':
        this.playDock(ctx);
        break;
      case 'buy':
        this.playBuy(ctx);
        break;
      case 'sell':
        this.playSell(ctx);
        break;
      case 'refuel':
        this.playRefuel(ctx);
        break;
      case 'select':
        this.playSelect(ctx);
        break;
      case 'error':
        this.playError(ctx);
        break;
    }
  }

  private playJump(ctx: AudioContext): void {
    // Hyperspace jump - rising whoosh with warp effect
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.4);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(100, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.5);
  }

  private playDock(ctx: AudioContext): void {
    // Docking sound - mechanical clunk
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  private playBuy(ctx: AudioContext): void {
    // Purchase sound - positive chime
    const notes = [523.25, 659.25]; // C5, E5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  }

  private playSell(ctx: AudioContext): void {
    // Sell sound - coin/cash register
    const notes = [880, 1174.66, 1396.91]; // A5, D6, F6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  private playRefuel(ctx: AudioContext): void {
    // Refueling - fluid/hissing sound
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Hissing with periodic bubbles
      const hiss = (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 3);
      const bubble = Math.sin(2 * Math.PI * 100 * t * (1 + Math.sin(t * 20))) * Math.exp(-t * 4) * 0.5;
      data[i] = hiss + bubble;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
  }

  private playSelect(ctx: AudioContext): void {
    // UI select - soft click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  private playError(ctx: AudioContext): void {
    // Error buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }
}

export const Sound = SoundSystem.getInstance();
