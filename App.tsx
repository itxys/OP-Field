
import React, { useState, useEffect } from 'react';
import { AppMode, SynthParams, SynthEngineType, TapeTrack } from './types';
import { audioEngine } from './services/audioEngine';
import Knob from './components/Knob';
import Display from './components/Display';
import Keyboard from './components/Keyboard';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SYNTH);
  const [engine, setEngine] = useState<SynthEngineType>('poly');
  const [params, setParams] = useState<SynthParams>({
    blue: 50, green: 50, white: 50, red: 50
  });
  const [tapeSpeed, setTapeSpeed] = useState(1.0);

  const [tracks, setTracks] = useState<TapeTrack[]>([
    { id: 0, isRecording: false, isMuted: false, volume: 1, isLooping: false },
    { id: 1, isRecording: false, isMuted: false, volume: 1, isLooping: false },
    { id: 2, isRecording: false, isMuted: false, volume: 1, isLooping: false },
    { id: 3, isRecording: false, isMuted: false, volume: 1, isLooping: false },
  ]);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  const [isGlobalRecording, setIsGlobalRecording] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const updateParam = (key: keyof SynthParams, val: number) => {
    const newParams = { ...params, [key]: val };
    setParams(newParams);
    audioEngine.updateParams(newParams);
  };

  const handleTapeSpeedChange = (speed: number) => {
    setTapeSpeed(speed);
    audioEngine.setTapeSpeed(speed);
  };

  const handleStart = async () => {
    await audioEngine.init();
    setHasStarted(true);
  };

  const handleEngineChange = (newEngine: SynthEngineType) => {
    setEngine(newEngine);
    audioEngine.setEngine(newEngine);
    audioEngine.updateParams(params);
  };

  const toggleRecording = async () => {
    if (isGlobalRecording) {
      const buffer = await audioEngine.stopRecording(activeTrackIndex);
      const newTracks = [...tracks];
      newTracks[activeTrackIndex].buffer = buffer || undefined;
      newTracks[activeTrackIndex].isRecording = false;
      setTracks(newTracks);
      setIsGlobalRecording(false);
    } else {
      await audioEngine.startRecording();
      const newTracks = [...tracks];
      newTracks[activeTrackIndex].isRecording = true;
      setTracks(newTracks);
      setIsGlobalRecording(true);
    }
  };

  const togglePlayback = () => {
    if (isGlobalPlaying) {
      audioEngine.stopTape();
      setIsGlobalPlaying(false);
    } else {
      audioEngine.playTape();
      setIsGlobalPlaying(true);
    }
  };

  const toggleTrackLoop = (trackIndex: number) => {
    const newTracks = [...tracks];
    const newLoopingState = !newTracks[trackIndex].isLooping;
    newTracks[trackIndex].isLooping = newLoopingState;
    setTracks(newTracks);
    audioEngine.setTrackLoop(trackIndex, newLoopingState);
  };

  const clearTrack = (trackIndex: number) => {
    audioEngine.clearTrack(trackIndex);
    const newTracks = [...tracks];
    newTracks[trackIndex].buffer = undefined;
    newTracks[trackIndex].isLooping = false;
    setTracks(newTracks);
  };

  const stopEverything = () => {
    audioEngine.stopTape();
    setIsGlobalPlaying(false);
    if (isGlobalRecording) {
      toggleRecording();
    }
  };

  return (
    <div className="h-screen w-screen bg-[#121212] flex flex-col items-center justify-center p-0.5 md:p-4 overflow-hidden select-none">
      {!hasStarted ? (
        <div className="flex flex-col items-center gap-8 text-center px-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[8px] md:border-[12px] border-[#222] flex items-center justify-center shadow-2xl">
            <span className="text-zinc-600 font-black text-xl md:text-2xl tracking-tighter uppercase">OP-Web</span>
          </div>
          <div>
            <h1 className="text-zinc-400 font-mono text-[10px] md:text-sm mb-4 tracking-[0.3em]">FIELD SYNTHESIZER</h1>
            <button
              onClick={handleStart}
              className="px-8 py-4 md:px-12 md:py-5 bg-[#eeeeee] text-[#121212] font-black rounded-full hover:brightness-90 active:scale-95 transition-all shadow-2xl uppercase tracking-widest text-xs md:text-sm"
            >
              Start Engine
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full max-w-[1400px] bg-[#eeeeee] rounded-[24px] md:rounded-[48px] p-2 md:p-8 shadow-[0_40px_80px_rgba(0,0,0,1)] flex flex-col gap-1 md:gap-4 border-b-[4px] md:border-b-[14px] border-[#c0c0c0] relative overflow-hidden">

          {/* TOP ROW: MODES, DISPLAY, ENGINE SELECTORS, KNOBS */}
          <div className="flex gap-2 md:gap-4 lg:gap-8 items-stretch h-[24%] md:h-[28%]">
            <div className="w-16 hidden lg:grid grid-cols-5 gap-1 pt-2 opacity-5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-black" />
              ))}
            </div>

            <div className="flex flex-col gap-1.5 md:gap-3 py-1">
              <button onClick={() => setMode(AppMode.SYNTH)} className={`w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center border-b-2 md:border-b-4 active:border-b-0 active:translate-y-0.5 md:active:translate-y-1 transition-all ${mode === AppMode.SYNTH ? 'bg-[#333] text-[#4fbefd] border-black shadow-lg' : 'bg-zinc-200 text-zinc-500 border-zinc-400'}`}>🎹</button>
              <button onClick={() => setMode(AppMode.TAPE)} className={`w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center border-b-2 md:border-b-4 active:border-b-0 active:translate-y-0.5 md:active:translate-y-1 transition-all ${mode === AppMode.TAPE ? 'bg-[#333] text-[#ff6d00] border-black shadow-lg' : 'bg-zinc-200 text-zinc-500 border-zinc-400'}`}>📼</button>
            </div>

            <div className="flex-[2] h-full bg-black rounded-xl md:rounded-3xl border-2 md:border-4 border-[#222] shadow-[inset_0_4px_8px_rgba(0,0,0,1)] relative overflow-hidden">
              <Display
                mode={mode}
                params={params}
                tapeSpeed={tapeSpeed}
                isPlaying={isGlobalPlaying}
                isRecording={isGlobalRecording}
                activeTrackIndex={activeTrackIndex}
                tracks={tracks}
              />
            </div>

            {/* Engine Selectors - Now next to display */}
            <div className="flex flex-col gap-1 md:gap-2 w-12 md:w-20 lg:w-24">
              <div className="grid grid-cols-1 gap-1 h-full py-1">
                {(['poly', 'fm', 'mono', 'string'] as SynthEngineType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => handleEngineChange(t)}
                    className={`text-[5px] md:text-[8px] font-black uppercase rounded-md md:rounded-lg transition-all border-b-2 flex items-center justify-center ${engine === t ? 'bg-[#4fbefd] text-white border-[#3ca0d4] shadow-md' : 'bg-zinc-200 text-zinc-500 border-zinc-400 hover:bg-zinc-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Knobs in a 2x2 grid */}
            <div className="grid grid-cols-2 gap-1.5 md:gap-x-4 lg:gap-x-8 md:gap-y-4 px-1 md:px-2">
              <Knob label="" color="#4fbefd" value={params.blue} onChange={(v) => updateParam('blue', v)} />
              <Knob label="" color="#24d982" value={params.green} onChange={(v) => updateParam('green', v)} />
              <Knob label="" color="#ffffff" value={params.white} onChange={(v) => updateParam('white', v)} />
              <Knob label="" color="#ff6d00" value={params.red} onChange={(v) => updateParam('red', v)} />
            </div>
          </div>

          {/* SECOND ROW: SELECTORS & TRANSPORT */}
          <div className="flex gap-2 md:gap-4 items-center h-16 md:h-24">
            {/* Transport Controls - Left side */}
            <div className="flex gap-1 md:gap-2 bg-zinc-300/30 p-1 md:p-2 rounded-2xl md:rounded-3xl border border-zinc-400/20 shadow-inner">
              <button
                onClick={toggleRecording}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-b-2 md:border-b-4 flex items-center justify-center text-xs md:text-lg transition-all shadow-md ${isGlobalRecording ? 'bg-red-500 text-white animate-pulse border-red-800' : 'bg-zinc-200 text-red-500 border-zinc-400'}`}
              >
                ●
              </button>
              <button
                onClick={stopEverything}
                className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-zinc-200 border-b-2 md:border-b-4 border-zinc-400 flex items-center justify-center text-zinc-700 active:translate-y-0.5 md:active:translate-y-1 active:border-b-0 shadow-md"
              >
                ■
              </button>
              <button
                onClick={togglePlayback}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-b-2 md:border-b-4 flex items-center justify-center transition-all shadow-md ${isGlobalPlaying ? 'bg-green-500 text-white border-green-800' : 'bg-zinc-200 text-zinc-700 border-zinc-400'}`}
              >
                ▶
              </button>
              <button
                onClick={() => tracks[activeTrackIndex]?.buffer && toggleTrackLoop(activeTrackIndex)}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-b-2 md:border-b-4 flex items-center justify-center text-xs md:text-lg transition-all shadow-md ${tracks[activeTrackIndex]?.isLooping ? 'bg-blue-500 text-white border-blue-800' : 'bg-zinc-200 text-blue-500 border-zinc-400'}`}
              >
                ↻
              </button>
              <button
                onClick={() => tracks[activeTrackIndex]?.buffer && clearTrack(activeTrackIndex)}
                className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-zinc-200 border-b-2 md:border-b-4 border-zinc-400 flex items-center justify-center text-xs md:text-lg text-orange-500 active:translate-y-0.5 md:active:translate-y-1 active:border-b-0 shadow-md"
              >
                ×
              </button>
            </div>

            {/* Track Selectors 1-8 - Expanded */}
            <div className="flex gap-1 md:gap-2 flex-1 h-full py-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i, idx) => (
                <button
                  key={i}
                  onClick={() => {
                    if (idx < 4) {
                      setActiveTrackIndex(idx);
                    } else if (idx < 4 + 4 && tracks[idx - 4]?.buffer) {
                      toggleTrackLoop(idx - 4);
                    }
                  }}
                  className={`flex-1 rounded-lg md:rounded-2xl border-b-2 md:border-b-4 font-black font-mono text-[10px] md:text-base active:translate-y-0.5 md:active:translate-y-1 active:border-b-0 transition-all ${idx < 4 && activeTrackIndex === idx
                    ? 'bg-[#333] text-white border-black shadow-lg scale-[1.02]'
                    : 'bg-zinc-200 text-zinc-400 border-zinc-400 hover:bg-zinc-100 shadow-sm'
                    }`}
                >
                  {i}
                  {idx < 4 && tracks[idx].buffer && <span className="block text-[6px] md:text-[10px] text-green-400 mt-0.5">•</span>}
                  {idx < 4 && tracks[idx].buffer && tracks[idx].isLooping && <span className="block text-[6px] md:text-[10px] text-blue-400 mt-0.5">↻</span>}
                </button>
              ))}
            </div>

            {/* Tape Speed Control */}
            <div className="flex flex-col gap-1 items-center bg-zinc-300/30 p-1.5 md:p-2 rounded-2xl border border-zinc-400/20 min-w-[50px] md:min-w-[90px] shadow-inner">
              <span className="text-[6px] md:text-[9px] font-black uppercase text-zinc-500">Speed</span>
              <div className="flex gap-0.5 md:gap-1">
                {[0.5, 1.0, 2.0].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleTapeSpeedChange(speed)}
                    className={`text-[7px] md:text-[10px] px-1 md:px-2 py-0.5 rounded font-bold transition-all ${tapeSpeed === speed ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KEYBOARD AREA */}
          <div className="flex-1 flex flex-col justify-start md:justify-end">
            <Keyboard
              onNoteOn={(note) => audioEngine.triggerAttack(note)}
              onNoteOff={(note) => audioEngine.triggerRelease(note)}
            />
          </div>

        </div>
      )}
    </div>
  );
};

export default App;
