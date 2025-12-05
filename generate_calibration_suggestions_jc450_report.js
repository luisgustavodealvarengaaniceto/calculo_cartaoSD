const { DVRCalculator } = require('./calculator.js');

const calc = new DVRCalculator();
calc.updateConfig({ useDecimalUnits: false, MB_PER_HOUR_PER_MBPS: 450000000 / 1048576 });

function computeSuggestions(deviceId, channels, measuredMap, modelId) {
  const suggestions = {};
  channels.forEach(ch => {
    const codec = ch.codec || 'H.264';
    const codecMult = ch.codecMultiplier || 1;
    const correction = calc.getRealisticCorrectionFactor(codec, codecMult);

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

    const modelScale = (calc.config.calibrationByModel && modelId && calc.config.calibrationByModel[modelId] && calc.config.calibrationByModel[modelId].bitrateScale) ? calc.config.calibrationByModel[modelId].bitrateScale : 1;

    const predictedRaw = ch.bitrate * modelScale * correction.factor * resolutionFactor * fpsFactor;
    const resKey = `${ch.resolution}@${ch.fps}`;
    const measured = measuredMap[resKey] !== undefined ? measuredMap[resKey] : (measuredMap[ch.resolution] !== undefined ? measuredMap[ch.resolution] : null);
    if (measured !== null && predictedRaw > 0) {
      const suggestedOutputMultiplier = measured / predictedRaw;
      if (!suggestions[modelId]) suggestions[modelId] = {};
      suggestions[modelId][resKey] = Number(suggestedOutputMultiplier.toFixed(3));
    }
  });
  return suggestions;
}

// Nominal configuration string provided: 1:720-25-3072;2:480-15-1024;3:480-15-1024;4:480-15-1024;5:480-15-1024;
// Interpret as: CH1 -> 1280x720@25 bitrate 3.072 Mbps
// CH2..CH5 -> 720x480@15 bitrate 1.024 Mbps (but report shows many 25fps groups; we'll compute for both 15 and 25 keys if measured)

const jc450_channels = [
  { channelId: 'CH1', bitrate: 3.072, resolution: '1280x720', fps: 25 },
  { channelId: 'CH2', bitrate: 1.024, resolution: '720x480', fps: 15 },
  { channelId: 'CH3', bitrate: 1.024, resolution: '720x480', fps: 15 },
  { channelId: 'CH4', bitrate: 1.024, resolution: '720x480', fps: 15 },
  { channelId: 'CH5', bitrate: 1.024, resolution: '720x480', fps: 15 }
];

// Measured averages extracted from your report (MiB-based Mbps)
const jc450_measured = {
  '1280x720@25': 1.46,
  // Report shows many 720x480 groups at 25fps with ~0.52 Mbps; include both 25 and 15 keys
  '720x480@25': 0.52,
  '720x480@15': 0.52
};

const suggestions = computeSuggestions('jc450', jc450_channels, jc450_measured, 'jc450');
console.log(JSON.stringify(suggestions, null, 2));
