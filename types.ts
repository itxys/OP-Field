
export enum AppMode {
  SYNTH = 'SYNTH',
  DRUM = 'DRUM',
  TAPE = 'TAPE',
  MIXER = 'MIXER'
}

export interface SynthParams {
  blue: number;   // Color-coded controls like OP-1
  green: number;
  white: number;
  red: number;
}

export interface TapeTrack {
  id: number;
  isRecording: boolean;
  isMuted: boolean;
  volume: number;
  isLooping: boolean;
  buffer?: AudioBuffer;
}

export type SynthEngineType = 'fm' | 'poly' | 'mono' | 'string';
