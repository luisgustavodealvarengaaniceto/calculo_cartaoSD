const { DVRCalculator } = require('./calculator.js');

const calc = new DVRCalculator();
// Use MiB semantics to match your reports (MB = 1024*1024)
calc.updateConfig({ useDecimalUnits: false, MB_PER_HOUR_PER_MBPS: 450000000 / 1048576 });

// Helper to predict effective bitrate and suggest adjustments
function analyzeDevice(deviceId, channels, measuredMap, modelId = null) {
  console.log('\n=== Report analysis for', deviceId, '===');
  channels.forEach(ch => {
    const codec = ch.codec || 'H.264';
    const codecMult = ch.codecMultiplier || 1;
    const correction = calc.getRealisticCorrectionFactor(codec, codecMult);

    // derive resolution factor (same code as calculator)
    let resolutionFactor = 1;
    try {
      const res = String(ch.resolution || '').trim();
      let w = null, h = null;
      if (res.includes('x')) {
        const parts = res.split('x').map(p => Number(p.replace(/[^0-9]/g, '')));
        if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) { w = parts[0]; h = parts[1]; }
      } else if (/^[0-9]+$/.test(res)) { h = Number(res); w = Math.round(h * (16/9)); }
      if (w && h) {
        const areaRatio = (w * h) / (1920 * 1080);
        resolutionFactor = Math.max(0.1, Math.sqrt(areaRatio));
      }
    } catch (e) { resolutionFactor = 1; }

    const baselineFPS = 30;
    const fpsVal = Number(ch.fps) || baselineFPS;
    const rawFpsFactor = fpsVal / baselineFPS;
    const fpsFactor = Math.min(1.2, Math.max(0.6, rawFpsFactor));

    // Model calibration scale (if present)
    const modelScale = (calc.config.calibrationByModel && modelId && calc.config.calibrationByModel[modelId] && calc.config.calibrationByModel[modelId].bitrateScale) ? calc.config.calibrationByModel[modelId].bitrateScale : 1;

    const predictedRaw = ch.bitrate * modelScale * correction.factor * resolutionFactor * fpsFactor;

    // Output multiplier (per-model per-res@fps) if configured
    const resKey = `${ch.resolution}@${ch.fps}`;
    const om = calc.getOutputMultiplier(modelId, ch.resolution, ch.fps);
    const outputMultiplier = om.multiplier;
    const predicted = predictedRaw * outputMultiplier;

    const measured = measuredMap[resKey] !== undefined ? measuredMap[resKey] : (measuredMap[ch.resolution] !== undefined ? measuredMap[ch.resolution] : null);

    console.log(`\nChannel ${ch.channelId} ${ch.resolution}@${ch.fps}fps`);
    console.log(`  Nominal (input): ${ch.bitrate} Mbps`);
    console.log(`  Predicted (raw): ${predictedRaw.toFixed(3)} Mbps`);
    if (outputMultiplier !== 1) console.log(`  Applied output multiplier: ${outputMultiplier} => predicted=${predicted.toFixed(3)} Mbps${om.estimated ? ' (estimated via ' + om.reason + ')' : ''}`);
    if (measured !== null) {
      console.log(`  Measured (report): ${measured} Mbps`);
      const suggestedOutputMultiplier = measured / predictedRaw;
      const requiredNominal = measured / (modelScale * correction.factor * resolutionFactor * fpsFactor);
      console.log(`  Suggested output multiplier (measured/predictedRaw): ${suggestedOutputMultiplier.toFixed(3)}`);
      console.log(`  Required nominal to produce measured (approx): ${requiredNominal.toFixed(3)} Mbps`);
    } else {
      console.log('  No measured value provided for this resolution@fps.');
    }
  });
}

// DATASETS from your reports

// JC450 (you provided earlier)
const jc450_channels = [
  { channelId: 'CH1', bitrate: 3.072, resolution: '1280x720', fps: 25, codec: 'H.264' },
  { channelId: 'CH2', bitrate: 1.024, resolution: '720x480', fps: 15, codec: 'H.264' },
  { channelId: 'CH3', bitrate: 1.024, resolution: '720x480', fps: 15, codec: 'H.264' },
  { channelId: 'CH4', bitrate: 1.024, resolution: '720x480', fps: 15, codec: 'H.264' },
  { channelId: 'CH5', bitrate: 1.024, resolution: '720x480', fps: 15, codec: 'H.264' }
];
const jc450_measured = {
  '1280x720@25': 1.46,
  '720x480@15': 0.52
};

// JC181 (from your earlier report)
const jc181_channels = [
  { channelId: 'CH01', bitrate: 4.096, resolution: '1280x720', fps: 30, codec: 'H.264' },
  { channelId: 'CH02', bitrate: 0.600, resolution: '640x360', fps: 10, codec: 'H.264' }
];
const jc181_measured = {
  '1280x720@30': 3.45,
  '640x360@10': 0.59
};

// JC371 (new report you provided)
// We need assumed nominal bitrates — use reasonable guesses (you can correct them)
const jc371_channels = [
  { channelId: 'CH01', bitrate: 8.0, resolution: '1920x1080', fps: 25, codec: 'H.264' },
  { channelId: 'CH02', bitrate: 4.0, resolution: '1280x720', fps: 15, codec: 'H.264' },
  { channelId: 'CH03', bitrate: 2.0, resolution: '1280x720', fps: 15, codec: 'H.264' }
];
const jc371_measured = {
  '1920x1080@25': 8.60,
  '1280x720@15': 4.36,
  // second 720@15 group measured 1.86 in report — this likely indicates different nominal for CH03
  '1280x720@15#2': 1.86
};

// Run analyses
analyzeDevice('JC450', jc450_channels, jc450_measured, 'jc450');
analyzeDevice('JC181', jc181_channels, jc181_measured, 'jc181');
// For JC371, run two analyses: one using CH02 measured value and also comparing CH03
analyzeDevice('JC371', jc371_channels, { '1920x1080@25': 8.60, '1280x720@15': 4.36 }, 'jc371');

// For CH03 separate measured lower average, show suggestion specifically
console.log('\nNote: JC371 CH03 reported 1.86 Mbps for one channel group — suggests different nominal or aggressive VBR.');

console.log('\nAnalysis complete.');
