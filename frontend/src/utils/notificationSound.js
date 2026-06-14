let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playOrderAlert() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const notes = [784, 988, 1175]; // G5, B5, D6
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0   = ctx.currentTime + i * 0.18;
      const t1   = t0 + 0.45;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t1);
      osc.start(t0);
      osc.stop(t1);
    });
  } catch {
    // Silently ignore if audio not available
  }
}
