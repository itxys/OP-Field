
import * as Tone from 'tone';
import { SynthParams, SynthEngineType } from '../types';

class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private currentEngine: SynthEngineType = 'poly';
  private recorder: Tone.Recorder | null = null;
  private players: (Tone.Player | null)[] = [null, null, null, null];
  private isInitialized = false;
  private tapeSpeed = 1.0;

  constructor() {
    this.recorder = new Tone.Recorder();
  }

  async init() {
    if (this.isInitialized) return;
    await Tone.start();
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    // Connect synth to master and recorder
    this.synth.connect(this.recorder!);
    
    this.isInitialized = true;
    console.log("Audio Engine Initialized");
  }

  setEngine(type: SynthEngineType) {
    if (!this.synth) return;
    const oldSynth = this.synth;
    this.currentEngine = type;

    switch (type) {
      case 'fm':
        this.synth = new Tone.PolySynth(Tone.FMSynth).toDestination();
        break;
      case 'mono':
        this.synth = new Tone.PolySynth(Tone.MonoSynth).toDestination();
        break;
      case 'string':
        this.synth = new Tone.PolySynth(Tone.PluckSynth).toDestination();
        break;
      default:
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
    this.synth.connect(this.recorder!);
    oldSynth.dispose();
  }

  updateParams(params: SynthParams) {
    if (!this.synth) return;
    
    this.synth.set({
      envelope: {
        attack: params.white / 1000 + 0.01,
        release: params.white / 100 + 0.1,
      },
      oscillator: {
        type: params.blue > 50 ? 'sawtooth' : 'sine'
      }
    });
  }

  setTapeSpeed(speed: number) {
    this.tapeSpeed = speed;
    // Update existing players
    this.players.forEach(p => {
      if (p) {
        p.playbackRate = speed;
      }
    });
    // Adjust transport speed if used for sequencing
    Tone.Transport.bpm.value = 120 * speed;
  }

  triggerAttack(note: string) {
    this.synth?.triggerAttack(note);
  }

  triggerRelease(note: string) {
    this.synth?.triggerRelease(note);
  }

  async startRecording() {
    if (this.recorder?.state !== 'started') {
      this.recorder?.start();
    }
  }

  async stopRecording(trackIndex: number): Promise<AudioBuffer | null> {
    if (this.recorder?.state === 'started') {
      const blob = await this.recorder.stop();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
      
      // Setup player for this track
      if (this.players[trackIndex]) {
        this.players[trackIndex]?.dispose();
      }
      const player = new Tone.Player(audioBuffer).toDestination();
      player.playbackRate = this.tapeSpeed;
      player.loop = false;
      this.players[trackIndex] = player;
      return audioBuffer;
    }
    return null;
  }

  setTrackLoop(trackIndex: number, isLooping: boolean) {
    if (this.players[trackIndex]) {
      this.players[trackIndex]!.loop = isLooping;
    }
  }

  clearTrack(trackIndex: number) {
    if (this.players[trackIndex]) {
      this.players[trackIndex]?.stop();
      this.players[trackIndex]?.dispose();
      this.players[trackIndex] = null;
    }
  }

  playTape() {
    const now = Tone.now();
    this.players.forEach(p => {
      if (p && p.buffer.loaded) {
        p.start(now);
      }
    });
  }

  stopTape() {
    this.players.forEach(p => p?.stop());
  }

  getRecorder() {
    return this.recorder;
  }
}

export const audioEngine = new AudioEngine();
