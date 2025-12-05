const { DVRCalculator } = require('./calculator.js');

const calc = new DVRCalculator();
// Ensure MiB semantics to match reports
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

// Reuse datasets from test_compare_reports.js
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

const jc181_channels = [
  { channelId: 'CH01', bitrate: 4.096, resolution: '1280x720', fps: 30, codec: 'H.264' },
  { channelId: 'CH02', bitrate: 0.600, resolution: '640x360', fps: 10, codec: 'H.264' }
];
const jc181_measured = {
  '1280x720@30': 3.45,
  '640x360@10': 0.59
};

const jc371_channels = [
  { channelId: 'CH01', bitrate: 8.0, resolution: '1920x1080', fps: 25, codec: 'H.264' },
  { channelId: 'CH02', bitrate: 4.0, resolution: '1280x720', fps: 15, codec: 'H.264' },
  { channelId: 'CH03', bitrate: 2.0, resolution: '1280x720', fps: 15, codec: 'H.264' }
];
const jc371_measured = {
  '1920x1080@25': 8.60,
  '1280x720@15': 4.36,
  '1280x720@15#2': 1.86
};

const suggestions = {};
Object.assign(suggestions, computeSuggestions('jc450', jc450_channels, jc450_measured, 'jc450'));
Object.assign(suggestions, computeSuggestions('jc181', jc181_channels, jc181_measured, 'jc181'));
Object.assign(suggestions, computeSuggestions('jc371', jc371_channels, { '1920x1080@25': 8.60, '1280x720@15': 4.36 }, 'jc371'));

console.log(JSON.stringify(suggestions, null, 2));
