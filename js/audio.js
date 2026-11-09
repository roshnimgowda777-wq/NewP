/**
 * Cosmic Sound Synthesizer Engine
 * Web Audio API real-time synthesis of crystalline chime strikes and binaural lo-fi drone.
 */

let sfxCtx = null;
let isLofiPlaying = false;
let lofiGain = null;
let lofiOsc1 = null;
let lofiOsc2 = null;

export function getAudioContext() {
  if (!sfxCtx) {
    sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sfxCtx.state === 'suspended') {
    sfxCtx.resume();
  }
  return sfxCtx;
}

// Beacon frequencies scale (C6, E6, G6, B6, C7, D7, E7)
export const beaconFrequencies = {
  burrito: 1046.50, // C6: California burrito
  polar:   1318.51, // E6: Polar bear
  naturals:1567.98, // G6: Naturals
  dumbass: 1975.53, // B6: Dumbass
  hrithik: 2093.00, // C7: Hrithik Roshan
  yrc:     2349.32, // D7: YRC
  bgs:     2637.02  // E7: BGS
};

/**
 * Synthesizes a physical crystal glass strike with resonant harmonic shimmer
 * @param {string} type - Key from beaconFrequencies
 */
export function playBeaconSound(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const baseFreq = beaconFrequencies[type] || 1318.51;

    // 1. Transient Crisp Glass Strike (physical impulse)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(baseFreq * 3.2, now);
    clickOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.018);

    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.025);

    // Filtered glass click noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.008);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(4800, now);
    noiseFilter.Q.setValueAtTime(4.0, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    // 2. Crystal Reverb & Resonant Space Bus
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.14, now);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.28, now);
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'highpass';
    delayFilter.frequency.setValueAtTime(1400, now);

    delay.connect(feedback);
    feedback.connect(delayFilter);
    delayFilter.connect(delay);
    delay.connect(ctx.destination);

    // 3. Pristine Pure Sinusoidal Fundamental Bell
    const fundOsc = ctx.createOscillator();
    const fundGain = ctx.createGain();
    fundOsc.type = 'sine';
    fundOsc.frequency.setValueAtTime(baseFreq, now);

    fundGain.gain.setValueAtTime(0.0001, now);
    fundGain.gain.linearRampToValueAtTime(0.32, now + 0.004);
    fundGain.gain.exponentialRampToValueAtTime(0.08, now + 0.35);
    fundGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.85);

    fundOsc.connect(fundGain);
    fundGain.connect(ctx.destination);
    fundGain.connect(delay);
    fundOsc.start(now);
    fundOsc.stop(now + 1.9);

    // 4. Quartz Inharmonic Bell Modes (2.756x and 5.404x overtones)
    const overtoneRatios = [2.756, 5.404];
    overtoneRatios.forEach((ratio, idx) => {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = 'sine';
      harmOsc.frequency.setValueAtTime(baseFreq * ratio, now);

      const amp = idx === 0 ? 0.14 : 0.07;
      harmGain.gain.setValueAtTime(0.0001, now);
      harmGain.gain.linearRampToValueAtTime(amp, now + 0.003);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, now + (idx === 0 ? 0.95 : 0.45));

      harmOsc.connect(harmGain);
      harmGain.connect(ctx.destination);
      harmGain.connect(delay);

      harmOsc.start(now);
      harmOsc.stop(now + 1.1);
    });
  } catch (err) {
    console.warn('Audio playback not permitted yet or failed:', err);
  }
}

/**
 * Toggles ambient binaural cosmic lo-fi drone
 * @param {HTMLElement} iconElement
 * @returns {boolean} Whether audio is now playing
 */
export function toggleCosmicLofi(iconElement) {
  const ctx = getAudioContext();

  if (!isLofiPlaying) {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    lofiGain = ctx.createGain();
    lofiGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    lofiGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.8);

    // Low binaural ethereal drone (A2 110Hz + chord tone 164.81Hz)
    lofiOsc1 = ctx.createOscillator();
    lofiOsc1.type = 'sine';
    lofiOsc1.frequency.setValueAtTime(110, ctx.currentTime);

    lofiOsc2 = ctx.createOscillator();
    lofiOsc2.type = 'triangle';
    lofiOsc2.frequency.setValueAtTime(164.81, ctx.currentTime);

    lofiOsc1.connect(lofiGain);
    lofiOsc2.connect(lofiGain);
    lofiGain.connect(ctx.destination);

    lofiOsc1.start();
    lofiOsc2.start();

    isLofiPlaying = true;
    if (iconElement) iconElement.innerText = 'volume_up';
  } else {
    if (lofiGain) {
      lofiGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      setTimeout(() => {
        try {
          if (lofiOsc1) lofiOsc1.stop();
          if (lofiOsc2) lofiOsc2.stop();
        } catch (_) {}
      }, 450);
    }
    isLofiPlaying = false;
    if (iconElement) iconElement.innerText = 'graphic_eq';
  }

  return isLofiPlaying;
}

