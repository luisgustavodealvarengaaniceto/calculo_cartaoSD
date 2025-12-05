// generate_detailed_jc450_report.js
// Produces a detailed JSON report for JC450 using current calibration and calculator logic
const { calculator } = require('./calculator');

function buildTestChannels() {
    // This mirrors the test nominal string in your logs: CH1=3Mbps, CH2-5=1Mbps, fps/res per UI defaults
    return [
        { active: true, channelId: 'CH1', channelName: 'CH1 - Road Facing/ADAS', resolution: '720', fps: 25, bitrate: 3, codec: 'H.264', codecMultiplier: 1 },
        { active: true, channelId: 'CH2', channelName: 'CH2 - USB Camera', resolution: '480', fps: 15, bitrate: 1, codec: 'H.264', codecMultiplier: 1 },
        { active: true, channelId: 'CH3', channelName: 'CH3 - DMS Camera', resolution: '480', fps: 15, bitrate: 1, codec: 'H.264', codecMultiplier: 1 },
        { active: true, channelId: 'CH4', channelName: 'CH4 - Camera 4', resolution: '480', fps: 15, bitrate: 1, codec: 'H.264', codecMultiplier: 1 }
    ];
}

function generateReport() {
    const cardSize = 256; // use 256GB cards like in your logs
    const useOneCard = false; // dual card mirror
    const channels = buildTestChannels();

    const results = calculator.calculateJC450DualCard(cardSize, channels, useOneCard);

    // Build detailed report
    const report = {
        metadata: {
            model: 'JC450',
            cardSizeGB: cardSize,
            dualCardMirror: !useOneCard,
            generatedAt: new Date().toISOString()
        },
        channelResults: results.channelResults,
        sd1: results.sd1,
        sd2: results.sd2,
        totals: {
            totalBitrate: results.totalBitrate,
            totalRateMBh: results.totalRateMBh,
            totalTimeHours: results.totalTimeHours
        }
    };

    const fs = require('fs');
    fs.writeFileSync('jc450_detailed_report.json', JSON.stringify(report, null, 2));
    console.log('Detailed JC450 report written to jc450_detailed_report.json');
}

generateReport();
