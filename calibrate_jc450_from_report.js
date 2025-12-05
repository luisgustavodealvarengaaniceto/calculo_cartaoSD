const { DVRCalculator } = require('./calculator.js');

const calc = new DVRCalculator();
// Force no model calibration for baseline prediction
calc.updateConfig({ calibrationByModel: { jc450: { bitrateScale: 1 } }, useDecimalUnits: false, MB_PER_HOUR_PER_MBPS: 428.22265625 });

// Channels as before
const channels = [
    { channelId: 'CH1', channelName: 'VID_F', bitrate: 3.072, resolution: '1280x720', fps: 25, active: true, codec: 'H.264' },
    { channelId: 'CH2', channelName: 'VID_B', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' },
    { channelId: 'CH3', channelName: 'VID_L', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' },
    { channelId: 'CH4', channelName: 'VID_R', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' },
    { channelId: 'CH5', channelName: 'VID_X', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' }
];

// Measured averages from your report (approx)
const measured = {
    '1280x720@25': 1.46,
    '720x480@15': 0.52 // approximate - report shows 720x480 groups around 0.52-0.54
};

// Compute predictions without calibration
const MB_PER_GB = calc.config.useDecimalUnits ? 1000 : 1024;

function predictEffective(ch) {
    const codec = ch.codec || 'H.264';
    const baseCodecMultiplier = ch.codecMultiplier || 1;
    const correction = calc.getRealisticCorrectionFactor(codec, baseCodecMultiplier);

    // resolution factor
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

    const effective = ch.bitrate * correction.factor * resolutionFactor * fpsFactor;
    return { effective, correctionFactor: correction.factor, resolutionFactor, fpsFactor };
}

console.log('Predictions (no calibration):');
channels.forEach(ch => {
    const key = `${ch.resolution}@${ch.fps}`;
    const pred = predictEffective(ch);
    const meas = measured[`${ch.resolution}@${ch.fps}`] || measured[`${ch.resolution}@25`] || null;
    console.log(`${ch.channelId} ${ch.resolution}@${ch.fps} -> predicted=${pred.effective.toFixed(3)} Mbps, measured=${meas !== null ? meas.toFixed(3) : 'N/A'}`);
    if (meas) {
        const multiplier = meas / pred.effective;
        console.log(`  Suggested output multiplier to match measured: ${multiplier.toFixed(3)} (apply to effectiveBitrate)`);
    }
});

console.log('\nSuggested calibration entries (per resolution@fps):');
const suggested = {
    jc450: {
        '1280x720@25': null,
        '720x480@15': null
    }
};
console.log(JSON.stringify(suggested, null, 2));
