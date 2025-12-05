const { DVRCalculator } = require('./calculator.js');

const calc = new DVRCalculator();
calc.updateConfig({ useDecimalUnits: false, MB_PER_HOUR_PER_MBPS: 450000000 / 1048576 });

function analyzeDevice(deviceId, channels, measuredMap, modelId = null) {
  console.log('\n=== Report analysis for', deviceId, '===');
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

// Use the same assumptions as the generator script
const jc400_channels = [
  { channelId: 'CH03', bitrate: 8.0, resolution: '1920x1080', fps: 25 },
  { channelId: 'CH03-51', bitrate: 8.0, resolution: '1920x1080', fps: 51 },
  { channelId: 'CH04', bitrate: 6.0, resolution: '1280x720', fps: 12.5 },
  { channelId: 'CH05', bitrate: 8.0, resolution: '1920x1080', fps: 25.58 },
  { channelId: 'CH06', bitrate: 6.0, resolution: '1280x720', fps: 12.5 },
  { channelId: 'CH20', bitrate: 8.0, resolution: '1920x1080', fps: 25.5 },
  { channelId: 'CH21', bitrate: 6.0, resolution: '1280x720', fps: 12.5 },
  { channelId: 'CH27', bitrate: 8.0, resolution: '1920x1080', fps: 25.58 },
  { channelId: 'CH28', bitrate: 6.0, resolution: '1280x720', fps: 12.42 },
  { channelId: 'CH43', bitrate: 8.0, resolution: '1920x1080', fps: 25.58 },
  { channelId: 'CH44', bitrate: 6.0, resolution: '1280x720', fps: 12.5 }
];

const jc400_measured = {
  '1920x1080@25': 7.66,
  '1920x1080@51': 7.66,
  '1280x720@12.5': 5.81,
  '1920x1080@25.58': 8.42,
  '1920x1080@25.5': 8.46,
  '1280x720@12.42': 6.51,
  '1280x1080@25.58': 8.42,
  '1280x720@12.42-CH28': 6.45
};

analyzeDevice('JC400', jc400_channels, jc400_measured, 'jc400');
console.log('\nJC400 analysis complete.');
