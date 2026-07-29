export const FAILURE_DIGEST_V146_ID='DD-FAILURE-DIGEST-V146';
export const FAILURE_DIGEST_VERSION='1.0.46';
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const r=(v,d=3)=>Math.round(n(v)*10**d)/10**d;
const slope=(a,k)=>{const p=a.map(s=>({x:n(s.wave),y:n(s[k],NaN)})).filter(v=>Number.isFinite(v.y));if(p.length<2)return 0;const x=p.reduce((s,v)=>s+v.x,0)/p.length,y=p.reduce((s,v)=>s+v.y,0)/p.length,d=p.reduce((s,v)=>s+(v.x-x)**2,0);return d?r(p.reduce((s,v)=>s+(v.x-x)*(v.y-y),0)/d*10):0};
function firstFailure(report={}){
  const a=report.samples||[],t=report.thresholds||{},failed=new Set(Object.entries(report.checks||{}).filter(([,v])=>!v).map(([k])=>k));if(!a.length||!failed.size)return null;
  const first=a[0],base=Math.max(.001,n(report.metrics?.frameBaselineP95Ms||first.frameP95Ms,.001)),cal=report.metrics?.measurementMode==='software-renderer-calibrated',ltCal=report.metrics?.longTaskMeasurementMode==='software-renderer-rate';
  for(let i=0;i<a.length;i+=1){const s=a[i],p=a.slice(0,i+1),c=[];
    if(failed.has('runtimeErrors'))c.push(['runtimeErrors',n(s.runtimeErrors),t.maxRuntimeErrors]);
    if(failed.has('frameP95'))cal?c.push(['frameP95RatioToBaseline',n(s.frameP95Ms)/base,t.maxCalibratedFrameP95Ratio],['frameP95DeltaFromBaselineMs',Math.max(0,n(s.frameP95Ms)-base),t.maxCalibratedFrameP95DeltaMs]):c.push(['frameP95Ms',n(s.frameP95Ms),t.maxFrameP95Ms]);
    if(failed.has('textureGrowth'))c.push(['textureGrowth',n(s.textures)-n(first.textures),t.maxTextureGrowth]);
    if(failed.has('geometryGrowth'))c.push(['geometryGrowth',n(s.geometries)-n(first.geometries),t.maxGeometryGrowth]);
    if(failed.has('longTasks')&&!ltCal)c.push(['longTaskGrowth',n(s.longTasks)-n(first.longTasks),t.maxLongTaskGrowth]);
    if(failed.has('contextBalanced'))c.push(['contextBalance',n(s.contextLosses)-n(s.contextRestores),t.maxUnmatchedContextLosses]);
    if(failed.has('heapGrowth')&&s.heapSupported&&first.heapSupported)c.push(['heapGrowthMB',n(s.heapUsedMB)-n(first.heapUsedMB),t.maxHeapGrowthMB]);
    if(p.length>=3){if(failed.has('frameTrend')){const v=slope(p,'frameP95Ms');c.push(cal?['frameSlopeRatioPer10Waves',v/base,t.maxCalibratedFrameSlopeRatioPer10Waves]:['frameSlopeMsPer10Waves',v,t.maxFrameSlopeMsPer10Waves])}if(failed.has('textureTrend'))c.push(['textureSlopePer10Waves',slope(p,'textures'),t.maxTextureSlopePer10Waves]);if(failed.has('geometryTrend'))c.push(['geometrySlopePer10Waves',slope(p,'geometries'),t.maxGeometrySlopePer10Waves]);if(failed.has('heapTrend')&&p.every(v=>v.heapSupported))c.push(['heapSlopeMBPer10Waves',slope(p,'heapUsedMB'),t.maxHeapSlopeMBPer10Waves])}
    const bad=c.find(([,v,m])=>Number.isFinite(Number(m))&&v>m);if(bad)return{wave:s.wave,sampleIndex:i,metric:bad[0],actual:r(bad[1]),maximum:bad[2]};
  }return null;
}
export function buildFailureDigestV146(report={}){const failedChecks=Object.entries(report.checks||{}).filter(([,v])=>!v).map(([k])=>k),firstRegression=report.passed===true?null:firstFailure(report);return Object.freeze({id:FAILURE_DIGEST_V146_ID,releaseVersion:FAILURE_DIGEST_VERSION,sourceReportId:String(report.id||''),sourceReleaseVersion:String(report.releaseVersion||''),passed:report.passed===true,failedChecks:Object.freeze(failedChecks),firstRegression:firstRegression?Object.freeze(firstRegression):null,summary:report.passed===true?'No regressing sample detected.':firstRegression?`${firstRegression.metric} first exceeded its limit at wave ${firstRegression.wave}.`:`Report failed without a sample-localized regression: ${failedChecks.join(', ')||'unknown check'}.`})}
