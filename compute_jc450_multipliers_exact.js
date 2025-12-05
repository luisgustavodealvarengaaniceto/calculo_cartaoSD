const { DVRCalculator } = require('./calculator.js');
const calc = new DVRCalculator();
calc.updateConfig({ useDecimalUnits: false, MB_PER_HOUR_PER_MBPS: 450000000 / 1048576 });

function predictedRawFor(bitrate, resolution, fps, modelId='jc450'){
  const codec = 'H.264';
  const codecMult = 1;
  const correction = calc.getRealisticCorrectionFactor(codec, codecMult);
  // resolution factor
  function parseRes(res){
    let w=null,h=null;
    if (res.includes('x')){
      const parts = res.split('x').map(p=>Number(p.replace(/[^0-9.]/g,'')));
      if (parts.length===2 && parts[0]>0 && parts[1]>0){w=parts[0];h=parts[1];}
    } else if (/^[0-9]+$/.test(res)){h=Number(res); w=Math.round(h*(16/9));}
    return {w,h};
  }
  const {w,h} = parseRes(resolution);
  let resolutionFactor = 1;
  if (w && h){const areaRatio=(w*h)/(1920*1080); resolutionFactor=Math.max(0.1, Math.sqrt(areaRatio));}
  const baseline=30; const rawFps = Number(fps)||baseline; const fpsFactor = Math.min(1.2, Math.max(0.6, rawFps/baseline));
  const modelScale = (calc.config.calibrationByModel && calc.config.calibrationByModel[modelId] && calc.config.calibrationByModel[modelId].bitrateScale) ? calc.config.calibrationByModel[modelId].bitrateScale : 1;
  const predictedRaw = bitrate * modelScale * correction.factor * resolutionFactor * fpsFactor;
  return { predictedRaw, correction: correction.factor, resolutionFactor, fpsFactor };
}

const tests = [
  { bitrate: 3.072, resolution: '1280x720', fps: 25, measured: 1.46 },
  { bitrate: 1.024, resolution: '720x480', fps: 25, measured: 0.52 }
];

const out = {};
for (const t of tests){
  const pr = predictedRawFor(t.bitrate, t.resolution, t.fps);
  const mult = t.measured / pr.predictedRaw;
  out[`${t.resolution}@${t.fps}`] = { predictedRaw: Number(pr.predictedRaw.toFixed(6)), measured: t.measured, multiplier: Number(mult.toFixed(6)), details: pr };
}
console.log(JSON.stringify(out, null, 2));
