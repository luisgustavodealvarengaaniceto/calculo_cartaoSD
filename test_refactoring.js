// Teste de Cálculo - JC400
const { DVRCalculator } = require('./calculator.js');
const calc = new DVRCalculator();

console.log('\n========================================');
console.log('🧪 TESTE 1: JC400 - 32GB - 14.0 Mbps');
console.log('========================================');
console.log('Esperado: 4.80 horas (NÃO 2.40 horas)');
console.log('');

const channels_jc400 = [
    {
        active: true,
        channelId: 'OUT',
        channelName: 'Camera Externa',
        resolution: '1080',
        fps: 25,
        bitrate: 8.0,  // 8 Mbps
        codec: 'H.264'
    },
    {
        active: true,
        channelId: 'IN',
        channelName: 'Camera Interna',
        resolution: '720',
        fps: 25,
        bitrate: 6.0,  // 6 Mbps
        codec: 'H.264'
    }
];

// Total bitrate nominal: 8 + 6 = 14.0 Mbps
// Espaço disponível: 32 GB × 1000 MB/GB × 0.9 = 28800 MB
// Consumo: 14.0 Mbps × 428.22265625 MB/h/Mbps = 5995.117 MB/h
// Tempo: 28800 MB ÷ 5995.117 MB/h = 4.804 horas ✅

const result_jc400 = calc.calculateTotal(32, channels_jc400, false, { modelId: 'jc400' });

console.log('\n📊 RESULTADO:');
console.log('  Tempo total:', result_jc400.totalTimeHours.toFixed(2), 'horas');
console.log('  Tempo total:', result_jc400.totalTimeDays.toFixed(2), 'dias');
console.log('  Bitrate total:', result_jc400.totalBitrate.toFixed(2), 'Mbps');
console.log('  Consumo:', result_jc400.totalRateMBh.toFixed(2), 'MB/h');

const esperado = 4.80;
const tolerancia = 0.05; // 5%
const passou = Math.abs(result_jc400.totalTimeHours - esperado) < esperado * tolerancia;

console.log('\n✅ VERIFICAÇÃO:');
console.log('  Esperado: ~', esperado, 'horas');
console.log('  Obtido:', result_jc400.totalTimeHours.toFixed(2), 'horas');
console.log('  Status:', passou ? '✅ PASSOU' : '❌ FALHOU');

console.log('\n========================================');
console.log('🧪 TESTE 2: JC181 - 32GB - 1.5 Mbps');
console.log('========================================');
console.log('Esperado: ~44.84 horas');
console.log('');

const channels_jc181 = [
    {
        active: true,
        channelId: 'CH1',
        channelName: 'Camera Principal',
        resolution: '720',
        fps: 25,
        bitrate: 1.0,  // 1 Mbps
        codec: 'H.264'
    },
    {
        active: true,
        channelId: 'CH2',
        channelName: 'Camera Interna (Fixa)',
        resolution: '360',
        fps: 10,
        bitrate: 0.5,  // 0.5 Mbps (FIXO)
        codec: 'H.264',
        fixed: true
    }
];

// Total bitrate nominal: 1.0 + 0.5 = 1.5 Mbps
// Espaço disponível: 32 GB × 1000 MB/GB × 0.9 = 28800 MB
// Consumo: 1.5 Mbps × 428.22265625 MB/h/Mbps = 642.334 MB/h
// Tempo: 28800 MB ÷ 642.334 MB/h = 44.84 horas ✅

const result_jc181 = calc.calculateTotal(32, channels_jc181, false, { modelId: 'jc181' });

console.log('\n📊 RESULTADO:');
console.log('  Tempo total:', result_jc181.totalTimeHours.toFixed(2), 'horas');
console.log('  Tempo total:', result_jc181.totalTimeDays.toFixed(2), 'dias');
console.log('  Bitrate total:', result_jc181.totalBitrate.toFixed(2), 'Mbps');
console.log('  Consumo:', result_jc181.totalRateMBh.toFixed(2), 'MB/h');

const esperado_jc181 = 44.84;
const passou_jc181 = Math.abs(result_jc181.totalTimeHours - esperado_jc181) < esperado_jc181 * tolerancia;

console.log('\n✅ VERIFICAÇÃO:');
console.log('  Esperado: ~', esperado_jc181, 'horas');
console.log('  Obtido:', result_jc181.totalTimeHours.toFixed(2), 'horas');
console.log('  Status:', passou_jc181 ? '✅ PASSOU' : '❌ FALHOU');

console.log('\n========================================');
console.log('🧪 TESTE 3: JC450 - 32GB - 10.0 Mbps');
console.log('========================================');
console.log('Esperado: ~6.73 horas (Mirror Mode)');
console.log('');

const channels_jc450 = [
    {
        active: true,
        channelId: 'CH1',
        channelName: 'Camera 1',
        resolution: '1080',
        fps: 25,
        bitrate: 4.0,
        codec: 'H.264'
    },
    {
        active: true,
        channelId: 'CH2',
        channelName: 'Camera 2',
        resolution: '720',
        fps: 25,
        bitrate: 3.0,
        codec: 'H.264'
    },
    {
        active: true,
        channelId: 'CH3',
        channelName: 'Camera 3',
        resolution: '720',
        fps: 25,
        bitrate: 3.0,
        codec: 'H.264'
    }
];

// Total bitrate nominal: 4.0 + 3.0 + 3.0 = 10.0 Mbps
// Mirror mode: tempo limitado por UM cartão
// Espaço por cartão: 32 GB × 1000 MB/GB × 0.9 = 28800 MB
// Consumo: 10.0 Mbps × 428.22265625 MB/h/Mbps = 4282.227 MB/h
// Tempo: 28800 MB ÷ 4282.227 MB/h = 6.73 horas ✅

const result_jc450 = calc.calculateJC450DualCard(32, channels_jc450, false);

console.log('\n📊 RESULTADO:');
console.log('  Tempo total:', result_jc450.totalTimeHours.toFixed(2), 'horas');
console.log('  Tempo total:', result_jc450.totalTimeDays.toFixed(2), 'dias');
console.log('  Bitrate total:', result_jc450.totalBitrate.toFixed(2), 'Mbps');
console.log('  Consumo:', result_jc450.totalRateMBh.toFixed(2), 'MB/h');
console.log('  SD1 tempo:', result_jc450.sd1.timeHours.toFixed(2), 'horas');
console.log('  SD2 tempo:', result_jc450.sd2 ? result_jc450.sd2.timeHours.toFixed(2) : 'N/A', 'horas');

const esperado_jc450 = 6.73;
const passou_jc450 = Math.abs(result_jc450.totalTimeHours - esperado_jc450) < esperado_jc450 * tolerancia;

console.log('\n✅ VERIFICAÇÃO:');
console.log('  Esperado: ~', esperado_jc450, 'horas');
console.log('  Obtido:', result_jc450.totalTimeHours.toFixed(2), 'horas');
console.log('  Status:', passou_jc450 ? '✅ PASSOU' : '❌ FALHOU');

console.log('\n========================================');
console.log('📊 RESUMO DOS TESTES');
console.log('========================================');
console.log('  JC400 (32GB, 14.0 Mbps):', passou ? '✅ PASSOU' : '❌ FALHOU');
console.log('  JC181 (32GB, 1.5 Mbps):', passou_jc181 ? '✅ PASSOU' : '❌ FALHOU');
console.log('  JC450 (32GB, 10.0 Mbps):', passou_jc450 ? '✅ PASSOU' : '❌ FALHOU');
console.log('========================================\n');

process.exit(passou && passou_jc181 && passou_jc450 ? 0 : 1);
