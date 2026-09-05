<script lang="ts">
  import LineChart from './components/LineChart.svelte';
  import InfoTip from './components/InfoTip.svelte';
  import { brl, pct } from './lib/format';
  import { combineRates, markToMarket, retirementIncome, simulateAll } from './lib/finance';
  import type { SimulationInputs, SimulationResult } from './lib/types';

  let tab: 'comparador' | 'mercado' | 'renda' | 'aprender' = 'comparador';
  let scenario: 'base' | 'juros-altos' | 'juros-baixos' | 'inflacao-alta' | 'custom' = 'base';

  let inputs: SimulationInputs = {
    initial: 10000,
    monthlyContribution: 500,
    years: 8,
    selic: 10.5,
    inflation: 4.0,
    selicSpread: 0,
    prefixRate: 11.2,
    ipcaRealRate: 6.2,
    custodyEnabled: true,
    incomeTaxEnabled: true,
    reinvestCoupons: true
  };

  let selected = new Set(['selic', 'prefixado', 'ipca', 'prefixado-cupom', 'ipca-cupom']);

  let mtmType: 'prefixado' | 'ipca' = 'prefixado';
  let mtmYears = 7;
  let mtmContracted = 11.5;
  let mtmMarket = 10.5;

  let rendaInitial = 20000;
  let rendaMonthly = 700;
  let rendaYears = 20;
  let rendaInflation = 4;
  let rendaRealRate = 6;

  $: results = simulateAll(inputs).filter((r) => selected.has(r.type));
  $: bestNet = results.length ? results.reduce((a, b) => a.net > b.net ? a : b) : null;
  $: bestReal = results.length ? results.reduce((a, b) => a.realNet > b.realNet ? a : b) : null;
  $: mtm = markToMarket(mtmYears, mtmContracted, mtmMarket, mtmType === 'ipca', inputs.inflation);
  $: rendaPlus = retirementIncome(rendaInitial, rendaMonthly, rendaYears, rendaInflation, rendaRealRate, 20);
  $: educaPlus = retirementIncome(rendaInitial, rendaMonthly, rendaYears, rendaInflation, rendaRealRate, 5);

  function setScenario(value: typeof scenario) {
    scenario = value;
    if (value === 'base') inputs = { ...inputs, selic: 10.5, inflation: 4, prefixRate: 11.2, ipcaRealRate: 6.2 };
    if (value === 'juros-altos') inputs = { ...inputs, selic: 14, inflation: 5, prefixRate: 13.2, ipcaRealRate: 7 };
    if (value === 'juros-baixos') inputs = { ...inputs, selic: 7.5, inflation: 3.5, prefixRate: 8.5, ipcaRealRate: 4.5 };
    if (value === 'inflacao-alta') inputs = { ...inputs, selic: 12, inflation: 7, prefixRate: 11.5, ipcaRealRate: 6.5 };
  }

  function toggleTitle(type: string) {
    const copy = new Set(selected);
    copy.has(type) ? copy.delete(type) : copy.add(type);
    selected = copy;
  }

  function reset() {
    inputs = {
      initial: 10000,
      monthlyContribution: 500,
      years: 8,
      selic: 10.5,
      inflation: 4,
      selicSpread: 0,
      prefixRate: 11.2,
      ipcaRealRate: 6.2,
      custodyEnabled: true,
      incomeTaxEnabled: true,
      reinvestCoupons: true
    };
    scenario = 'base';
  }

  function resultBadge(result: SimulationResult) {
    if (bestNet?.type === result.type) return 'Maior valor líquido';
    if (result.type === 'ipca') return 'Proteção real no vencimento';
    if (result.type === 'selic') return 'Baixa sensibilidade a juros';
    return 'Fluxo e prazo importam';
  }
</script>

<svelte:head>
  <title>Tesouro Educa — Simulador educativo do Tesouro Direto</title>
</svelte:head>

<header class="hero">
  <div class="hero-inner">
    <div>
      <p class="eyebrow">Simulador educativo · Tesouro Direto</p>

<!--
  TESOURO EDUCA

  Aplicação web educacional desenvolvida de forma independente por
  Pablo Phillipe Cândido dos Santos, destinada à simulação e compreensão
  dos fatores que influenciam os resultados de investimentos em títulos
  do Tesouro Direto.

  O desenvolvimento contou com ferramentas de inteligência artificial
  generativa como recurso auxiliar, mantendo-se sob responsabilidade do
  autor a concepção, implementação, integração e verificação do projeto.

  Currículo Lattes: http://lattes.cnpq.br/9500873674712528
-->

      <h1>Entenda <em>por que</em> cada título chega a um resultado diferente.</h1>
      <p class="hero-copy">Compare cenários, decomponha impostos e inflação, visualize juros compostos e experimente marcação a mercado sem usar dinheiro real.</p>
    </div>
    <div class="hero-card">
      <span>Princípio do app</span>
      <strong>Não existe “melhor título” fora de um objetivo e de um cenário.</strong>
      <small>As projeções são educativas e não constituem recomendação de investimento.</small>
    </div>
  </div>
</header>

<nav class="tabs" aria-label="Módulos do simulador">
  <button class:active={tab === 'comparador'} on:click={() => tab = 'comparador'}>Comparador</button>
  <button class:active={tab === 'mercado'} on:click={() => tab = 'mercado'}>Marcação a mercado</button>
  <button class:active={tab === 'renda'} on:click={() => tab = 'renda'}>RendA+ e Educa+</button>
  <button class:active={tab === 'aprender'} on:click={() => tab = 'aprender'}>Aprenda</button>
</nav>

<main>
  {#if tab === 'comparador'}
    <section class="intro-grid">
      <div>
        <p class="section-kicker">Laboratório de cenários</p>
        <h2>Altere uma variável e observe o efeito.</h2>
      </div>
      <div class="scenario-buttons">
        <button class:active={scenario === 'base'} on:click={() => setScenario('base')}>Base</button>
        <button class:active={scenario === 'juros-altos'} on:click={() => setScenario('juros-altos')}>Juros altos</button>
        <button class:active={scenario === 'juros-baixos'} on:click={() => setScenario('juros-baixos')}>Juros baixos</button>
        <button class:active={scenario === 'inflacao-alta'} on:click={() => setScenario('inflacao-alta')}>Inflação alta</button>
      </div>
    </section>

    <section class="workspace">
      <aside class="panel controls">
        <div class="panel-head">
          <div>
            <span>Entradas</span>
            <h3>Sua simulação</h3>
          </div>
          <button class="text-button" on:click={reset}>Restaurar</button>
        </div>

        <label>Investimento inicial <input type="number" min="0" step="500" bind:value={inputs.initial} /></label>
        <label>Aporte mensal <input type="number" min="0" step="100" bind:value={inputs.monthlyContribution} /></label>
        <label>Prazo: <b>{inputs.years} anos</b><input type="range" min="0.5" max="30" step="0.5" bind:value={inputs.years} /></label>

        <div class="separator"></div>
        <p class="mini-title">Cenário econômico</p>
        <label>Selic esperada (% a.a.) <input type="number" step="0.1" bind:value={inputs.selic} on:input={() => scenario = 'custom'} /></label>
        <label>Inflação IPCA (% a.a.) <input type="number" step="0.1" bind:value={inputs.inflation} on:input={() => scenario = 'custom'} /></label>
        <label>Prefixado contratado (% a.a.) <input type="number" step="0.1" bind:value={inputs.prefixRate} on:input={() => scenario = 'custom'} /></label>
        <label>IPCA+ taxa real (% a.a.) <input type="number" step="0.1" bind:value={inputs.ipcaRealRate} on:input={() => scenario = 'custom'} /></label>
        <label>Ágio/deságio Selic (% a.a.) <input type="number" step="0.01" bind:value={inputs.selicSpread} /></label>

        <div class="separator"></div>
        <label class="check"><input type="checkbox" bind:checked={inputs.incomeTaxEnabled} /> Considerar IR e IOF</label>
        <label class="check"><input type="checkbox" bind:checked={inputs.custodyEnabled} /> Considerar custódia B3</label>
        <label class="check"><input type="checkbox" bind:checked={inputs.reinvestCoupons} /> Reinvestir cupons semestrais</label>
      </aside>

      <div class="content-stack">
        <section class="panel">
          <div class="panel-head wrap">
            <div>
              <span>Comparação</span>
              <h3>Escolha os títulos</h3>
            </div>
            <div class="title-toggles">
              {#each [
                ['selic','Selic'], ['prefixado','Prefixado'], ['ipca','IPCA+'],
                ['prefixado-cupom','Prefixado + cupom'], ['ipca-cupom','IPCA+ + cupom']
              ] as item}
                <button class:active={selected.has(item[0])} on:click={() => toggleTitle(item[0])}>{item[1]}</button>
              {/each}
            </div>
          </div>

          {#if results.length === 0}
            <div class="empty">Selecione ao menos um título para iniciar a comparação.</div>
          {:else}
            <div class="result-grid">
              {#each results as result}
                <article class:best={bestNet?.type === result.type} class="result-card">
                  <div class="badge">{resultBadge(result)}</div>
                  <h4>{result.label}</h4>
                  <strong>{brl.format(result.net)}</strong>
                  <span>valor líquido projetado</span>
                  <dl>
                    <div><dt>Investido</dt><dd>{brl.format(result.invested)}</dd></div>
                    <div><dt>Bruto acumulado</dt><dd>{brl.format(result.gross)}</dd></div>
                    <div><dt>IR</dt><dd>- {brl.format(result.incomeTax)}</dd></div>
                    <div><dt>Custódia estimada</dt><dd>- {brl.format(result.custody)}</dd></div>
                    <div><dt>Valor em reais de hoje</dt><dd>{brl.format(result.realNet)}</dd></div>
                    <div><dt>Retorno nominal</dt><dd>{pct(result.nominalReturnPct)}</dd></div>
                    <div><dt>Retorno real</dt><dd>{pct(result.realReturnPct)}</dd></div>
                  </dl>
                  <p>{result.explanation}</p>
                </article>
              {/each}
            </div>
          {/if}
        </section>

        {#if results.length}
          <section class="panel callout">
            <div>
              <span>O que mudou?</span>
              <h3>Inflação transforma retorno nominal em poder de compra.</h3>
              <p>Com IPCA de <b>{pct(inputs.inflation, 1)}</b>, um valor futuro não compra o mesmo que o mesmo número de reais hoje. Por isso o app mostra os dois resultados.</p>
            </div>
            <div class="formula">
              <small>IPCA+ nominal aproximado</small>
              <b>{pct(inputs.inflation, 1)} + {pct(inputs.ipcaRealRate, 1)} ≠ {pct(inputs.inflation + inputs.ipcaRealRate, 1)}</b>
              <strong>{pct(combineRates(inputs.inflation, inputs.ipcaRealRate))}</strong>
              <span>As taxas são compostas: (1 + IPCA) × (1 + taxa real) − 1.</span>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head"><div><span>Gráfico 1</span><h3>Evolução nominal do patrimônio</h3></div></div>
            <LineChart {results} />
          </section>

          <section class="panel">
            <div class="panel-head"><div><span>Gráfico 2</span><h3>Patrimônio em poder de compra de hoje</h3></div></div>
            <LineChart {results} real={true} />
          </section>

          <section class="panel table-panel">
            <div class="panel-head"><div><span>Decomposição</span><h3>Compare os fatores lado a lado</h3></div></div>
            <div class="table-scroll">
              <table>
                <thead><tr><th>Título</th><th>Taxa anual usada</th><th>Investido</th><th>IR</th><th>Custódia</th><th>Líquido</th><th>Real</th></tr></thead>
                <tbody>
                  {#each results as result}
                    <tr class:highlight={bestReal?.type === result.type}>
                      <td>{result.label}</td><td>{pct(result.annualRate)}</td><td>{brl.format(result.invested)}</td><td>{brl.format(result.incomeTax)}</td><td>{brl.format(result.custody)}</td><td>{brl.format(result.net)}</td><td>{brl.format(result.realNet)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <p class="caption">Linha destacada: maior valor em poder de compra no cenário informado.</p>
          </section>
        {/if}
      </div>
    </section>

  {:else if tab === 'mercado'}
    <section class="module-head">
      <p class="section-kicker">Preço antes do vencimento</p>
      <h2>Marcação a mercado: quando a taxa sobe, o preço tende a cair.</h2>
      <p>Este laboratório isola a relação entre taxa de mercado, prazo e preço. A conta é uma aproximação pedagógica por fluxo único e não substitui a precificação oficial do Tesouro Direto.</p>
    </section>

    <section class="workspace market-layout">
      <aside class="panel controls">
        <label>Tipo
          <select bind:value={mtmType}>
            <option value="prefixado">Tesouro Prefixado</option>
            <option value="ipca">Tesouro IPCA+</option>
          </select>
        </label>
        <label>Anos até o vencimento: <b>{mtmYears}</b><input type="range" min="1" max="30" step="1" bind:value={mtmYears} /></label>
        <label>Taxa contratada (% a.a.) <input type="number" step="0.1" bind:value={mtmContracted} /></label>
        <label>Taxa de mercado hoje (% a.a.) <input type="number" step="0.1" bind:value={mtmMarket} /></label>
      </aside>

      <div class="content-stack">
        <section class="panel market-card">
          <div class="rate-flow">
            <div><span>Você contratou</span><strong>{mtmType === 'ipca' ? 'IPCA + ' : ''}{pct(mtmContracted)}</strong></div>
            <div class:up={mtm.direction === 'up'} class:down={mtm.direction === 'down'} class="arrow">{mtm.direction === 'up' ? '↑' : mtm.direction === 'down' ? '↓' : '→'}</div>
            <div><span>Mercado agora</span><strong>{mtmType === 'ipca' ? 'IPCA + ' : ''}{pct(mtmMarket)}</strong></div>
          </div>
          <div class="price-result">
            <span>Variação estimada do preço</span>
            <strong class:positive={mtm.changePct > 0} class:negative={mtm.changePct < 0}>{pct(mtm.changePct)}</strong>
          </div>
          <div class="explain-box">
            {#if mtmMarket < mtmContracted}
              <b>A taxa de mercado caiu.</b> Seu título antigo oferece uma taxa relativamente mais atraente, então seu preço tende a subir.
            {:else if mtmMarket > mtmContracted}
              <b>A taxa de mercado subiu.</b> Novos títulos oferecem taxa maior, então o preço do título antigo tende a cair para se ajustar.
            {:else}
              <b>As taxas são iguais.</b> Nesta simplificação, não há pressão de preço causada pela taxa.
            {/if}
          </div>
        </section>

        <section class="panel duration-demo">
          <div><span>Sensibilidade aproximada</span><strong>{mtm.duration.toFixed(1)} anos</strong></div>
          <p>Quanto mais distante o vencimento, maior tende a ser a sensibilidade do preço a mudanças na taxa. É por isso que IPCA+ longos podem oscilar muito mesmo sendo títulos públicos.</p>
        </section>

        <InfoTip title="Por que levar ao vencimento muda a interpretação?">
          No Prefixado e no IPCA+, a taxa contratada é a referência de retorno quando o fluxo é mantido até o vencimento, respeitadas as regras do título. A oscilação de preço passa a ser decisiva quando existe venda antecipada.
        </InfoTip>
      </div>
    </section>

  {:else if tab === 'renda'}
    <section class="module-head">
      <p class="section-kicker">Planejamento por renda</p>
      <h2>RendA+ e Educa+ mudam a pergunta: de “quanto terei?” para “quanto receberei por mês?”.</h2>
      <p>O RendA+ é concebido para pagamentos mensais durante 20 anos; o Educa+ para 5 anos. A projeção abaixo usa uma anuidade real simplificada para ensinar o efeito do prazo, da taxa real e dos aportes.</p>
    </section>

    <section class="workspace">
      <aside class="panel controls">
        <label>Valor inicial <input type="number" min="0" step="1000" bind:value={rendaInitial} /></label>
        <label>Aporte mensal <input type="number" min="0" step="100" bind:value={rendaMonthly} /></label>
        <label>Período de acumulação: <b>{rendaYears} anos</b><input type="range" min="5" max="40" step="1" bind:value={rendaYears} /></label>
        <label>Inflação esperada (% a.a.) <input type="number" step="0.1" bind:value={rendaInflation} /></label>
        <label>Taxa real (% a.a.) <input type="number" step="0.1" bind:value={rendaRealRate} /></label>
      </aside>

      <div class="content-stack">
        <section class="income-grid">
          <article class="panel income-card">
            <span>Tesouro RendA+</span><h3>Renda por 20 anos</h3>
            <strong>{brl.format(rendaPlus.monthlyRealIncome)}</strong><small>renda mensal estimada em reais de hoje</small>
            <dl><div><dt>Total investido</dt><dd>{brl.format(rendaPlus.invested)}</dd></div><div><dt>Saldo real ao converter</dt><dd>{brl.format(rendaPlus.realBalance)}</dd></div><div><dt>Pagamentos</dt><dd>{rendaPlus.payoutMonths}</dd></div></dl>
          </article>
          <article class="panel income-card">
            <span>Tesouro Educa+</span><h3>Renda por 5 anos</h3>
            <strong>{brl.format(educaPlus.monthlyRealIncome)}</strong><small>renda mensal estimada em reais de hoje</small>
            <dl><div><dt>Total investido</dt><dd>{brl.format(educaPlus.invested)}</dd></div><div><dt>Saldo real ao converter</dt><dd>{brl.format(educaPlus.realBalance)}</dd></div><div><dt>Pagamentos</dt><dd>{educaPlus.payoutMonths}</dd></div></dl>
          </article>
        </section>

        <section class="panel callout">
          <div><span>Insight</span><h3>Mesmo patrimônio, horizontes diferentes.</h3><p>Distribuir um saldo ao longo de 60 meses produz uma renda mensal muito maior do que distribuí-lo por 240 meses. O produto precisa combinar com a finalidade.</p></div>
          <div class="formula"><small>Taxa nominal equivalente</small><strong>{pct(rendaPlus.nominalAnnual)}</strong><span>Combinação de inflação de {pct(rendaInflation,1)} com taxa real de {pct(rendaRealRate,1)}.</span></div>
        </section>
      </div>
    </section>

  {:else}
    <section class="module-head">
      <p class="section-kicker">Guia de conceitos</p>
      <h2>O que realmente move o resultado no Tesouro Direto?</h2>
      <p>Use estes cartões como um mapa mental. Depois volte ao simulador e altere apenas uma variável por vez.</p>
    </section>

    <section class="learn-grid">
      <article class="lesson"><b>01</b><h3>Selic</h3><p>É a referência central do Tesouro Selic. Mudanças na taxa alteram a velocidade de crescimento do investimento ao longo do tempo.</p></article>
      <article class="lesson"><b>02</b><h3>Inflação</h3><p>O IPCA reduz o poder de compra do dinheiro. Por isso retorno nominal e retorno real são conceitos diferentes.</p></article>
      <article class="lesson"><b>03</b><h3>Taxa real</h3><p>No IPCA+, a taxa contratada acima da inflação é o componente de ganho real quando o título é mantido até o vencimento.</p></article>
      <article class="lesson"><b>04</b><h3>Prazo</h3><p>Mais tempo potencializa juros compostos, mas também aumenta a sensibilidade a juros em títulos longos quando vendidos antecipadamente.</p></article>
      <article class="lesson"><b>05</b><h3>IR regressivo</h3><p>A alíquota diminui com o tempo. Em títulos com cupons, cada pagamento possui seu próprio momento de tributação.</p></article>
      <article class="lesson"><b>06</b><h3>IOF</h3><p>Existe incidência regressiva sobre o rendimento em resgates muito curtos, até o 29º dia.</p></article>
      <article class="lesson"><b>07</b><h3>Custódia</h3><p>A taxa da B3 reduz o resultado líquido e possui regras diferenciadas para Tesouro Selic, RendA+ e Educa+.</p></article>
      <article class="lesson"><b>08</b><h3>Cupons</h3><p>Receber juros semestrais cria fluxo de caixa, mas antecipa imposto e pode diminuir a capitalização se o dinheiro não for reinvestido.</p></article>
      <article class="lesson"><b>09</b><h3>Marcação a mercado</h3><p>O preço de um título existente se ajusta às novas taxas. Taxa sobe → preço tende a cair. Taxa cai → preço tende a subir.</p></article>
      <article class="lesson"><b>10</b><h3>Objetivo</h3><p>Liquidez, proteção contra inflação, previsibilidade nominal e geração de renda são objetivos diferentes. O título adequado depende do uso do dinheiro.</p></article>
    </section>

    <section class="panel disclaimer">
      <h3>Limites desta ferramenta</h3>
      <p>O aplicativo foi projetado para ensino. Não consulta taxas em tempo real, não reproduz todas as convenções de dias úteis, VNA, calendários de cupons, spreads de recompra ou curvas completas usadas na precificação oficial. Os módulos de cupons, RendA+/Educa+ e marcação a mercado são aproximações pedagógicas explicitamente sinalizadas. Para decisões reais, consulte as taxas, preços e regras oficiais vigentes.</p>
    </section>
  {/if}
</main>

<footer>
  <div><strong>Tesouro Educa</strong><span>Simulador educativo independente.</span></div>
  <p>Não afiliado ao Tesouro Nacional ou à B3. Não constitui recomendação de investimento.</p>
</footer>
