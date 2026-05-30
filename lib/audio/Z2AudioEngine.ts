type UiSound = "hover" | "breach" | "unlock" | "tick" | "anomaly";

export class Z2AudioEngine {
  private static instance: Z2AudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private roomGain: GainNode | null = null;
  private roomNodes: {
    noise?: AudioBufferSourceNode;
    left?: OscillatorNode;
    right?: OscillatorNode;
    leftGain?: GainNode;
    rightGain?: GainNode;
  } = {};

  private subjectNodes: {
    left?: OscillatorNode;
    right?: OscillatorNode;
    leftGain?: GainNode;
    rightGain?: GainNode;
    panner?: PannerNode;
    orbitLfo?: OscillatorNode;
    orbitGain?: GainNode;
    filter?: BiquadFilterNode;
  } = {};

  private programOsc?: OscillatorNode;
  private programGain?: GainNode;
  private _playing = false;
  private _roomActive = false;
  private _subjectActive = false;
  private orbitAngle = 0;
  private orbitRaf: number | null = null;

  static getInstance(): Z2AudioEngine {
    if (!Z2AudioEngine.instance) {
      Z2AudioEngine.instance = new Z2AudioEngine();
    }
    return Z2AudioEngine.instance;
  }

  async init(): Promise<void> {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return;
    }

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.roomGain = this.ctx.createGain();
    this.roomGain.gain.value = 0;
    this.roomGain.connect(this.master);
  }

  getAnalyserData(): Uint8Array {
    const data = new Uint8Array(this.analyser?.frequencyBinCount ?? 128);
    this.analyser?.getByteFrequencyData(data);
    return data;
  }

  getAverageLevel(): number {
    const data = this.getAnalyserData();
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum / data.length / 255;
  }

  async startRoomTone(): Promise<void> {
    if (!this.ctx || !this.roomGain || this._roomActive) return;
    await this.init();
    if (!this.ctx || !this.roomGain) return;

    const hour = new Date().getHours();
    const beatHz = hour >= 23 || hour < 5 ? 0.5 : hour >= 17 ? 4 : 7;

    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = hour >= 23 || hour < 5 ? 400 : 800;

    const left = this.ctx.createOscillator();
    const right = this.ctx.createOscillator();
    left.type = "sine";
    right.type = "sine";
    left.frequency.value = 80;
    right.frequency.value = 80 + beatHz;

    const leftGain = this.ctx.createGain();
    const rightGain = this.ctx.createGain();
    leftGain.gain.value = 0.04;
    rightGain.gain.value = 0.04;

    const merger = this.ctx.createChannelMerger(2);
    left.connect(leftGain);
    right.connect(rightGain);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);

    noise.connect(filter);
    filter.connect(this.roomGain);
    merger.connect(this.roomGain);

    noise.start();
    left.start();
    right.start();

    this.roomNodes = { noise, left, right, leftGain, rightGain };
    this._roomActive = true;

    const now = this.ctx.currentTime;
    this.roomGain.gain.cancelScheduledValues(now);
    this.roomGain.gain.setValueAtTime(0, now);
    this.roomGain.gain.linearRampToValueAtTime(0.35, now + 3);
  }

  stopRoomTone(): void {
    if (!this.roomGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.roomGain.gain.linearRampToValueAtTime(0, now + 1);
    setTimeout(() => {
      this.roomNodes.noise?.stop();
      this.roomNodes.left?.stop();
      this.roomNodes.right?.stop();
      this.roomNodes = {};
      this._roomActive = false;
    }, 1100);
  }

  playUiSound(type: UiSound): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();

    const configs: Record<UiSound, { freq: number; dur: number; vol: number }> = {
      hover: { freq: 847, dur: 0.04, vol: 0.08 },
      breach: { freq: 55, dur: 0.25, vol: 0.15 },
      unlock: { freq: 523.25, dur: 0.4, vol: 0.12 },
      tick: { freq: 1200, dur: 0.02, vol: 0.05 },
      anomaly: { freq: 37, dur: 0.18, vol: 0.2 },
    };

    const cfg = configs[type];
    osc.type = type === "anomaly" ? "sawtooth" : "sine";
    osc.frequency.value = cfg.freq;
    panner.pan.value = (Math.random() - 0.5) * 0.8;

    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.master);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(cfg.vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.dur);

    osc.start(now);
    osc.stop(now + cfg.dur + 0.05);
  }

  setCursorPan(x: number): void {
    if (!this.master || !this.ctx) return;
    const pan = (x / window.innerWidth) * 2 - 1;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.55 + Math.abs(pan) * 0.15, this.ctx.currentTime, 0.1);
  }

  startSubjectRack(opts: {
    carrierHz: number;
    beatHz: number;
    orbitSpeed: number;
    filterHz: number;
  }): void {
    if (!this.ctx || !this.master) return;
    this.stopSubjectRack();

    const panner = this.ctx.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = 1;
    panner.maxDistance = 10;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;

    const left = this.ctx.createOscillator();
    const right = this.ctx.createOscillator();
    left.type = "sine";
    right.type = "sine";
    left.frequency.value = opts.carrierHz;
    right.frequency.value = opts.carrierHz + opts.beatHz;

    const leftGain = this.ctx.createGain();
    const rightGain = this.ctx.createGain();
    leftGain.gain.value = 0.12;
    rightGain.gain.value = 0.12;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = opts.filterHz;

    const merger = this.ctx.createChannelMerger(2);
    left.connect(leftGain);
    right.connect(rightGain);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(filter);
    filter.connect(panner);
    panner.connect(this.master);

    left.start();
    right.start();

    this.subjectNodes = { left, right, leftGain, rightGain, panner, filter };
    this._subjectActive = true;

    const speed = opts.orbitSpeed;
    const animate = () => {
      if (!this._subjectActive || !this.subjectNodes.panner) return;
      this.orbitAngle += speed;
      const r = 2;
      this.subjectNodes.panner.positionX.value = Math.cos(this.orbitAngle) * r;
      this.subjectNodes.panner.positionZ.value = Math.sin(this.orbitAngle) * r;
      this.subjectNodes.panner.positionY.value = Math.sin(this.orbitAngle * 0.5) * 0.5;
      this.orbitRaf = requestAnimationFrame(animate);
    };
    animate();
  }

  updateSubjectRack(opts: {
    carrierHz: number;
    beatHz: number;
    orbitSpeed: number;
    filterHz: number;
  }): void {
    if (!this._subjectActive) {
      this.startSubjectRack(opts);
      return;
    }
    if (this.subjectNodes.left) this.subjectNodes.left.frequency.value = opts.carrierHz;
    if (this.subjectNodes.right)
      this.subjectNodes.right.frequency.value = opts.carrierHz + opts.beatHz;
    if (this.subjectNodes.filter) this.subjectNodes.filter.frequency.value = opts.filterHz;
  }

  stopSubjectRack(): void {
    this._subjectActive = false;
    if (this.orbitRaf) cancelAnimationFrame(this.orbitRaf);
    this.subjectNodes.left?.stop();
    this.subjectNodes.right?.stop();
    this.subjectNodes = {};
  }

  async playProgram(type: "theta" | "carrier" | "spark"): Promise<void> {
    if (!this.ctx || !this.master) return;
    this.stopProgram();

    const programs = {
      theta: { carrier: 100, beat: 4, dur: 30 },
      carrier: { carrier: 100, beat: 40, dur: 20 },
      spark: { carrier: 200, beat: 40, dur: 10 },
    };
    const p = programs[type];

    const left = this.ctx.createOscillator();
    const right = this.ctx.createOscillator();
    left.type = "sine";
    right.type = "sine";
    left.frequency.value = p.carrier;
    right.frequency.value = p.carrier + p.beat;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    const merger = this.ctx.createChannelMerger(2);
    left.connect(merger, 0, 0);
    right.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(this.master);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 2);
    gain.gain.setValueAtTime(0.25, now + p.dur - 2);
    gain.gain.linearRampToValueAtTime(0, now + p.dur);

    left.start();
    right.start();
    left.stop(now + p.dur);
    right.stop(now + p.dur);

    this.programOsc = left;
    this.programGain = gain;
    this._playing = true;

    setTimeout(() => {
      this._playing = false;
    }, p.dur * 1000);
  }

  stopProgram(): void {
    try {
      this.programOsc?.stop();
    } catch {
      /* already stopped */
    }
    this.programOsc = undefined;
    this.programGain = undefined;
    this._playing = false;
  }

  isPlaying(): boolean {
    return this._playing;
  }
}
