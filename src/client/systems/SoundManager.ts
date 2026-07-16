// ============================================================
// Nexus Realms — Sound Manager
// Web Audio API-based sound with procedural SFX & music
// ============================================================

// ─── Sound Manager ───────────────────────────────────────────
export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted: boolean = false;
  private masterVolume: number = 0.5;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.6;
  private musicOscillators: OscillatorNode[] = [];
  private musicPlaying: boolean = false;

  constructor() {
    // Audio context is created on first user interaction
  }

  /** Initialize audio context (call on first user click) */
  init(): boolean {
    if (this.ctx) return true;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      return true;
    } catch {
      console.warn('[Sound] Web Audio API not available');
      return false;
    }
  }

  /** Resume audio context if suspended */
  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ─── Volume Controls ──────────────────────────────────────

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.masterVolume;
  }

  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  // ─── Background Music (Procedural) ────────────────────────

  /** Start ambient background music loop */
  startMusic(): void {
    if (!this.ctx || !this.musicGain || this.musicPlaying) return;
    this.musicPlaying = true;

    // Create a gentle ambient pad using multiple oscillators
    const notes = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4
    const types: OscillatorType[] = ['sine', 'triangle', 'sine', 'sine'];
    const volumes = [0.15, 0.1, 0.08, 0.05];

    for (let i = 0; i < notes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = types[i];
      osc.frequency.value = notes[i];
      gain.gain.value = volumes[i];

      // Add slow LFO for movement
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.1 + i * 0.05;
      lfoGain.gain.value = notes[i] * 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();

      this.musicOscillators.push(osc);
    }

    // Add a gentle noise layer
    this.addNoiseLayer();
  }

  /** Stop background music */
  stopMusic(): void {
    for (const osc of this.musicOscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.musicOscillators = [];
    this.musicPlaying = false;
  }

  // ─── Sound Effects ────────────────────────────────────────

  /** Sword/weapon hit */
  playSwordHit(): void {
    this.playNoiseBurst(0.08, 800, 200, 0.4);
    this.playTone(120, 0.05, 'sawtooth', 0.3);
  }

  /** Spell cast whoosh */
  playSpellCast(): void {
    this.playSweep(200, 800, 0.2, 'sine', 0.25);
    this.playNoiseBurst(0.1, 1000, 500, 0.15);
  }

  /** Heal sound (gentle chime) */
  playHeal(): void {
    this.playTone(523.25, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.25), 80);
    setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.2), 160);
  }

  /** Level up fanfare */
  playLevelUp(): void {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, 'sine', 0.3);
        this.playTone(freq * 1.5, 0.2, 'triangle', 0.15);
      }, i * 100);
    });
  }

  /** Loot pickup */
  playLoot(): void {
    this.playTone(880, 0.08, 'sine', 0.25);
    setTimeout(() => this.playTone(1108.73, 0.1, 'sine', 0.2), 60);
  }

  /** UI click */
  playUIClick(): void {
    this.playTone(600, 0.04, 'sine', 0.15);
  }

  /** Entity death */
  playDeath(): void {
    this.playSweep(400, 80, 0.3, 'sawtooth', 0.2);
    this.playNoiseBurst(0.15, 500, 100, 0.2);
  }

  /** Critical hit */
  playCritical(): void {
    this.playNoiseBurst(0.06, 1200, 300, 0.5);
    this.playTone(200, 0.1, 'square', 0.3);
    setTimeout(() => this.playTone(150, 0.15, 'sawtooth', 0.2), 50);
  }

  /** Ability on cooldown */
  playError(): void {
    this.playTone(200, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(160, 0.15, 'square', 0.12), 100);
  }

  /** Footstep */
  playFootstep(): void {
    this.playNoiseBurst(0.03, 200, 80, 0.08);
  }

  /** Spatial sound — plays at a world position relative to listener */
  playSpatial(
    type: 'hit' | 'spell' | 'heal' | 'death',
    sourceX: number,
    sourceY: number,
    listenerX: number,
    listenerY: number,
  ): void {
    const dx = sourceX - listenerX;
    const dy = sourceY - listenerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 800;

    if (dist > maxDist) return;

    // Volume falloff
    const volume = 1 - dist / maxDist;

    // Pan (left/right)
    const pan = Math.max(-1, Math.min(1, dx / 400));

    // Create a temporary gain for spatial
    if (!this.ctx || !this.sfxGain) return;

    const spatialGain = this.ctx.createGain();
    spatialGain.gain.value = volume;
    spatialGain.connect(this.sfxGain);

    const panner = this.ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(spatialGain);

    // Play the appropriate sound through the spatial chain
    switch (type) {
      case 'hit': this.playNoiseBurstTo(0.08, 800, 200, 0.4 * volume, panner); break;
      case 'spell': this.playSweepTo(200, 800, 0.2, 'sine', 0.25 * volume, panner); break;
      case 'heal': this.playToneTo(523.25, 0.15, 'sine', 0.3 * volume, panner); break;
      case 'death': this.playSweepTo(400, 80, 0.3, 'sawtooth', 0.2 * volume, panner); break;
    }
  }

  // ─── Internal Sound Generation ────────────────────────────

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ): void {
    if (!this.ctx || !this.sfxGain) return;
    this.playToneTo(freq, duration, type, volume, this.sfxGain);
  }

  private playToneTo(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    dest: AudioNode,
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.01);
  }

  private playNoiseBurst(
    duration: number,
    freqHigh: number,
    freqLow: number,
    volume: number,
  ): void {
    if (!this.ctx || !this.sfxGain) return;
    this.playNoiseBurstTo(duration, freqHigh, freqLow, volume, this.sfxGain);
  }

  private playNoiseBurstTo(
    duration: number,
    freqHigh: number,
    freqLow: number,
    volume: number,
    dest: AudioNode,
  ): void {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = (freqHigh + freqLow) / 2;
    filter.Q.value = 1;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start();
  }

  private playSweep(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ): void {
    if (!this.ctx || !this.sfxGain) return;
    this.playSweepTo(freqStart, freqEnd, duration, type, volume, this.sfxGain);
  }

  private playSweepTo(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    dest: AudioNode,
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, freqEnd),
      this.ctx.currentTime + duration,
    );
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.01);
  }

  private addNoiseLayer(): void {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.08;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    source.start();
  }

  destroy(): void {
    this.stopMusic();
    this.ctx?.close();
    this.ctx = null;
  }
}
