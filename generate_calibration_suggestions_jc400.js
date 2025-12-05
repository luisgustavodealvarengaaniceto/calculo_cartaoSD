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

// Construct JC400 dataset based on the report you provided.
// Assumed nominal configured bitrates (choose typical values):
// - 1920x1080 groups → nominal 8 Mbps
// - 1280x720 groups → nominal 6 Mbps
// - single small groups (CH05 etc) use 8 Mbps
// You can adjust these nominal bitrates if you have exact configured values.

const jc400_channels = [
  // CH03 many 1080@25.x groups — use nominal 8 Mbps
  { channelId: 'CH03-25.4', bitrate: 8.0, resolution: '1920x1080', fps: 25 },
  { channelId: 'CH03-25.5', bitrate: 8.0, resolution: '1920x1080', fps: 25 },
  { channelId: 'CH03-25.58', bitrate: 8.0, resolution: '1920x1080', fps: 25 },
  { channelId: 'CH03-25.67', bitrate: 8.0, resolution: '1920x1080', fps: 25 },
  { channelId: 'CH03-25.75', bitrate: 8.0, resolution: '1920x1080', fps: 25 },
  { channelId: 'CH03-51', bitrate: 8.0, resolution: '1920x1080', fps: 51 },
  { channelId: 'CH03-90000', bitrate: 8.0, resolution: '1920x1080', fps: 90000 },

  // CH04 many 1280x720 groups — use nominal 6 Mbps
  { channelId: 'CH04-12.42', bitrate: 6.0, resolution: '1280x720', fps: 12.42 },
  { channelId: 'CH04-12.5', bitrate: 6.0, resolution: '1280x720', fps: 12.5 },
  { channelId: 'CH04-12.58', bitrate: 6.0, resolution: '1280x720', fps: 12.58 },
  { channelId: 'CH04-25', bitrate: 6.0, resolution: '1280x720', fps: 25 },

  // Single-file channels
  { channelId: 'CH05-25.58', bitrate: 8.0, resolution: '1920x1080', fps: 25.58 },
  { channelId: 'CH06-12.5', bitrate: 6.0, resolution: '1280x720', fps: 12.5 },
  { channelId: 'CH20-25.5', bitrate: 8.0, resolution: '1920x1080', fps: 25.5 },

  // CH21 many 1280x720 small fps values — assume nominal 6 Mbps
  { channelId: 'CH21-12.42', bitrate: 6.0, resolution: '1280x720', fps: 12.42 },
  { channelId: 'CH21-12.5', bitrate: 6.0, resolution: '1280x720', fps: 12.5 },
  { channelId: 'CH21-12.56', bitrate: 6.0, resolution: '1280x720', fps: 12.56 },
  { channelId: 'CH21-12.57', bitrate: 6.0, resolution: '1280x720', fps: 12.57 },
  { channelId: 'CH21-12.58', bitrate: 6.0, resolution: '1280x720', fps: 12.58 },
  { channelId: 'CH21-12.59', bitrate: 6.0, resolution: '1280x720', fps: 12.59 },
  { channelId: 'CH21-12.66', bitrate: 6.0, resolution: '1280x720', fps: 12.66 },
  { channelId: 'CH21-12.68', bitrate: 6.0, resolution: '1280x720', fps: 12.68 },
  { channelId: 'CH21-12.71', bitrate: 6.0, resolution: '1280x720', fps: 12.71 },
  { channelId: 'CH21-12.74', bitrate: 6.0, resolution: '1280x720', fps: 12.74 },

  // CH27/28/43/44
  { channelId: 'CH27-25.58', bitrate: 8.0, resolution: '1920x1080', fps: 25.58 },
  { channelId: 'CH28-12.42', bitrate: 6.0, resolution: '1280x720', fps: 12.42 },
  { channelId: 'CH28-12.5', bitrate: 6.0, resolution: '1280x720', fps: 12.5 },
  { channelId: 'CH43-25.58', bitrate: 8.0, resolution: '1920x1080', fps: 25.58 },
  { channelId: 'CH44-12.5', bitrate: 6.0, resolution: '1280x720', fps: 12.5 }
];

// Measured averages from your report (MiB-based Mbps)
const jc400_measured = {
  '1920x1080@25': 7.66,
  '1920x1080@51': 7.66,
  '1920x1080@25.58': 7.65,
  '1920x1080@25.42': 7.66,
  '1920x1080@25.50': 7.66,
  '1920x1080@25.67': 7.66,
  '1920x1080@25.75': 7.64,
  '1920x1080@90000': 7.66,
  '1280x720@12.42': 5.81,
  '1280x720@12.5': 5.81,
  '1280x720@12.58': 5.44,
  '1280x720@25': 5.81,
  '1920x1080@25.58': 8.42,
  '1280x720@12.5': 6.42,
  '1920x1080@25.5': 8.46,
  '1280x720@12.42': 6.51,
  '1280x720@12.56': 6.56,
  '1280x720@12.57': 6.55,
  '1280x720@12.58': 6.53,
  '1280x720@12.59': 6.52,
  '1280x720@12.66': 6.55,
  '1280x720@12.68': 6.55,
  '1280x720@12.71': 6.56,
  '1280x720@12.74': 6.57,
  '1920x1080@25.58-CH27': 8.43,
  '1280x720@12.42-CH28': 6.45,
  '1920x1080@25.58-CH43': 8.44,
  '1280x720@12.5-CH44': 6.44
};

const suggestions = computeSuggestions('jc400', jc400_channels, jc400_measured, 'jc400');
console.log(JSON.stringify(suggestions, null, 2));
