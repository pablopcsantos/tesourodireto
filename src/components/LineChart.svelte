<script lang="ts">
  import type { SimulationResult } from '../lib/types';

  export let results: SimulationResult[] = [];
  export let real = false;

  const width = 900;
  const height = 340;
  const pad = 48;

  $: maxMonth = Math.max(1, ...results.flatMap((r) => r.projection.map((p) => p.month)));
  $: maxValue = Math.max(1, ...results.flatMap((r) => r.projection.map((p) => real ? p.realGross : p.gross)));

  function points(result: SimulationResult) {
    return result.projection.map((p) => {
      const x = pad + (p.month / maxMonth) * (width - pad * 2);
      const y = height - pad - ((real ? p.realGross : p.gross) / maxValue) * (height - pad * 2);
      return `${x},${y}`;
    }).join(' ');
  }

  const dash = ['', '7 4', '3 3', '10 4 2 4', '2 5'];
</script>

<div class="chart-wrap" aria-label={real ? 'Gráfico de patrimônio em valores reais' : 'Gráfico de evolução do patrimônio'}>
  <svg viewBox={`0 0 ${width} ${height}`} role="img">
    <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} class="axis" />
    <line x1={pad} y1={pad} x2={pad} y2={height-pad} class="axis" />
    {#each [0.25, 0.5, 0.75, 1] as f}
      <line x1={pad} y1={height-pad-f*(height-pad*2)} x2={width-pad} y2={height-pad-f*(height-pad*2)} class="grid" />
      <text x={pad-8} y={height-pad-f*(height-pad*2)+4} text-anchor="end">{Math.round(maxValue*f/1000)}k</text>
    {/each}
    {#each results as result, index}
      <polyline points={points(result)} fill="none" class="series" stroke-dasharray={dash[index]} />
    {/each}
    <text x={width-pad} y={height-12} text-anchor="end">{maxMonth} meses</text>
  </svg>
</div>

<div class="legend">
  {#each results as result, index}
    <span><i style={`border-top-style:${index === 0 ? 'solid' : 'dashed'}`}></i>{result.label}</span>
  {/each}
</div>
