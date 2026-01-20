
class SoundEffects {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private currentVibe: 'calm' | 'mystery' | 'arcade' = 'calm';
  private crowdSource: AudioBufferSourceNode | null = null;
  private crowdGainNode: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private safeConnect(source: AudioNode | null, destination: AudioNode | AudioParam | null) {
    if (source && destination) {
      try {
        if (destination instanceof AudioNode) source.connect(destination);
        else if (destination instanceof AudioParam) (source as any).connect(destination);
      } catch (e) { console.warn('Audio connection failed', e); }
    }
  }

  // Fix: playMove method for basic game actions
  playMove() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    this.safeConnect(osc, gain);
    this.safeConnect(gain, this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Fix: playDice method for board games and randomized events
  playDice() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    this.safeConnect(osc, gain);
    this.safeConnect(gain, this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Fix: Added playCapture for Checkers, Chess, and CarRacing collision
  playCapture() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    this.safeConnect(osc, gain);
    this.safeConnect(gain, this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Fix: playWin method for successful game outcomes
  playWin() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
        this.safeConnect(osc, gain);
        this.safeConnect(gain, this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
      }, i * 150);
    });
  }

  // Fix: playLoss method for failed game outcomes
  playLoss() {
    this.init();
    if (!this.ctx) return;
    const notes = [300, 200, 150];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
        this.safeConnect(osc, gain);
        this.safeConnect(gain, this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
      }, i * 200);
    });
  }

  // Fix: Added playCard for UnoGame actions
  playCard() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    this.safeConnect(osc, gain);
    this.safeConnect(gain, this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Fix: Added playWhistle for FootballGame start/goal
  playWhistle() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    this.safeConnect(osc, gain);
    this.safeConnect(gain, this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  // Fix: Added playApplause for MazeGame victory state
  playApplause() {
    this.init();
    if (!this.ctx) return;
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150 + Math.random() * 300, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        this.safeConnect(osc, gain);
        this.safeConnect(gain, this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
      }, i * 40 + Math.random() * 30);
    }
  }

  // Fix: Added playCrowd for FootballGame background noise management
  playCrowd(play: boolean) {
    this.init();
    if (!this.ctx) return;
    if (play) {
      if (this.crowdSource) return;
      this.crowdGainNode = this.ctx.createGain();
      this.crowdGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.crowdGainNode.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 1);
      this.safeConnect(this.crowdGainNode, this.ctx.destination);

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.crowdSource = this.ctx.createBufferSource();
      this.crowdSource.buffer = buffer;
      this.crowdSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      this.safeConnect(this.crowdSource, filter);
      this.safeConnect(filter, this.crowdGainNode);
      this.crowdSource.start();
    } else {
      if (this.crowdGainNode && this.crowdSource) {
        const currentGain = this.crowdGainNode;
        const currentSource = this.crowdSource;
        currentGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          try { currentSource.stop(); } catch(e) {}
        }, 500);
        this.crowdSource = null;
        this.crowdGainNode = null;
      }
    }
  }

  toggleMusic(mute: boolean, vibe: 'calm' | 'mystery' | 'arcade' = 'calm') {
    this.init();
    this.currentVibe = vibe;
    if (mute) this.stopMusic();
    else this.startMusic();
  }

  private startMusic() {
    if (this.isMusicPlaying || !this.ctx) return;
    this.isMusicPlaying = true;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 2);
    this.safeConnect(this.musicGain, this.ctx.destination);
    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.musicGain || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220 + Math.random() * 220, this.ctx.currentTime);
      g.gain.setValueAtTime(0, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 2);
      g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 4);
      this.safeConnect(osc, g);
      this.safeConnect(g, this.musicGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 4);
    }, 3000);
  }

  private stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) clearInterval(this.musicInterval);
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
    }
  }
}

export const sounds = new SoundEffects();
