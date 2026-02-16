import { Sound } from '../game/Sound';

describe('Sound System', () => {
  beforeEach(() => {
    Sound.resetContext();
    Sound.setEnabled(true);
    Sound.setVolume(0.3);
  });

  describe('singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = Sound;
      const instance2 = Sound;
      expect(instance1).toBe(instance2);
    });
  });

  describe('enabled state', () => {
    it('can be enabled and disabled', () => {
      Sound.setEnabled(false);
      expect(Sound.isEnabled()).toBe(false);

      Sound.setEnabled(true);
      expect(Sound.isEnabled()).toBe(true);
    });

    it('does not throw when playing while disabled', () => {
      Sound.setEnabled(false);
      expect(() => Sound.play('jump')).not.toThrow();
    });
  });

  describe('volume control', () => {
    it('can set and get volume', () => {
      Sound.setVolume(0.5);
      expect(Sound.getVolume()).toBe(0.5);
    });

    it('clamps volume to 0-1 range', () => {
      Sound.setVolume(-0.5);
      expect(Sound.getVolume()).toBe(0);

      Sound.setVolume(1.5);
      expect(Sound.getVolume()).toBe(1);
    });
  });

  describe('sound playback', () => {
    it('plays jump sound without error', () => {
      expect(() => Sound.play('jump')).not.toThrow();
    });

    it('plays dock sound without error', () => {
      expect(() => Sound.play('dock')).not.toThrow();
    });

    it('plays buy sound without error', () => {
      expect(() => Sound.play('buy')).not.toThrow();
    });

    it('plays sell sound without error', () => {
      expect(() => Sound.play('sell')).not.toThrow();
    });

    it('plays refuel sound without error', () => {
      expect(() => Sound.play('refuel')).not.toThrow();
    });

    it('plays select sound without error', () => {
      expect(() => Sound.play('select')).not.toThrow();
    });

    it('plays error sound without error', () => {
      expect(() => Sound.play('error')).not.toThrow();
    });
  });
});
