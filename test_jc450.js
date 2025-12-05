const path = require('path');
const { DVRCalculator } = require('./calculator.js');

const calc = new DVRCalculator();

// Configure to match the JC450 analysis assumptions: MB reported as MiB (1024-based)
calc.updateConfig({ useDecimalUnits: false, MB_PER_HOUR_PER_MBPS: 428.22265625 });

// JC450 test input parsed from: 1:720-25-3072;2:480-15-1024;3:480-15-1024;4:480-15-1024;5:480-15-1024
// Interpreting the bitrate values as Kbps in the device config (3072 kbps = 3.072 Mbps)
const channels = [
    { channelId: 'CH1', channelName: 'VID_F', bitrate: 3.072, resolution: '1280x720', fps: 25, active: true, codec: 'H.264' },
    { channelId: 'CH2', channelName: 'VID_B', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' },
    { channelId: 'CH3', channelName: 'VID_L', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' },
    { channelId: 'CH4', channelName: 'VID_R', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' },
    { channelId: 'CH5', channelName: 'VID_X', bitrate: 1.024, resolution: '720x480', fps: 15, active: true, codec: 'H.264' }
];

// Run the JC450 dual-card calculation (mirror mode)
const cardSizeGB = 64; // arbitrary for time calculation; we mainly inspect effective bitrate
const result = calc.calculateJC450DualCard(cardSizeGB, channels, false);

console.log('\n=== JC450 Test Output ===');
console.log('Card size (GB):', cardSizeGB);
console.log('TotalBitrate (nominal sum Mbps):', result.totalBitrate.toFixed(3));
console.log('TotalRateMBh (with overhead):', result.totalRateMBh.toFixed(2), 'MB/h');
console.log('TotalTimeHours (theoretical):', result.totalTimeHours.toFixed(2), 'h');
console.log('\nChannel results (effective bitrate and rateMBh):');
result.channelResults.forEach(ch => {
    console.log(`${ch.channelId} ${ch.resolution}@${ch.fps}fps -> bitrate_nominal=${ch.bitrate.toFixed(3)} Mbps, correction=${ch.correctionFactor.toFixed(3)}, resolutionFactor=${(ch.resolutionFactor||1).toFixed(3)}, fpsFactor=${(ch.fpsFactor||1).toFixed(3)}, effective=${ch.effectiveBitrate.toFixed(3)} Mbps, rateMBh=${ch.rateMBh.toFixed(1)} MB/h`);
});

console.log('\nFull result object saved to result_jc450.json');
const fs = require('fs');
fs.writeFileSync('result_jc450.json', JSON.stringify(result, null, 2));
console.log('Wrote result_jc450.json');
