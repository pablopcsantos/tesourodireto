# Tesouro Educa

Aplicação web educativa para explicar os fatores que influenciam o resultado dos títulos do Tesouro Direto. O projeto foi pensado para publicação estática no GitHub Pages e não exige backend.

## O que está incluído

- Comparação entre Tesouro Selic, Tesouro Prefixado e Tesouro IPCA+.
- Versões com juros semestrais para Prefixado e IPCA+.
- Investimento inicial e aportes mensais.
- Cenários de Selic e inflação.
- Valor bruto, líquido e equivalente em poder de compra de hoje.
- IR regressivo e IOF para prazos curtos.
- Estimativa de taxa de custódia B3, incluindo isenção simplificada dos primeiros R$ 10 mil no Tesouro Selic.
- Demonstração do efeito dos cupons e do reinvestimento.
- Gráficos nominais e reais.
- Laboratório de marcação a mercado.
- Módulo educativo para Tesouro RendA+ e Tesouro Educa+.
- Guia de conceitos.
- Layout responsivo.
- Workflow pronto para GitHub Pages.

## Importante

Este projeto é uma ferramenta de educação financeira. Algumas rotinas são deliberadamente simplificadas para facilitar o aprendizado, principalmente:

- precificação de venda antecipada;
- calendário e precificação de cupons;
- RendA+ e Educa+;
- convenções de dias úteis, VNA e curvas de mercado;
- taxas e preços correntes dos títulos.

O aplicativo não consulta dados em tempo real e não constitui recomendação de investimento.

## Tecnologias

- Svelte 5
- TypeScript
- Vite
- SVG nativo para gráficos

## Executar localmente

```bash
npm install
npm run dev
```

## Verificações

```bash
npm run check
npm run build
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos para a branch `main`.
2. No GitHub, acesse **Settings → Pages**.
3. Em **Build and deployment**, selecione **GitHub Actions**.
4. O workflow `.github/workflows/deploy.yml` fará o build e a publicação automaticamente em cada push para `main`.

O `vite.config.ts` usa `base: './'`, tornando os assets compatíveis com projetos publicados em subpastas do GitHub Pages.

## Arquitetura

```text
src/
├── components/
│   ├── InfoTip.svelte
│   └── LineChart.svelte
├── lib/
│   ├── finance.ts
│   ├── format.ts
│   └── types.ts
├── App.svelte
├── app.css
└── main.ts
```

A matemática fica em `src/lib/finance.ts`, separada da interface.

## Fontes conceituais recomendadas

Para validação de regras e atualização futura, consulte sempre as páginas oficiais do Tesouro Direto e da B3, especialmente regras e regulamento, características dos títulos, histórico de preços e taxas e materiais de precificação.

## 👤 Autoria e desenvolvimento

O **Tesouro Educa** é uma aplicação web educacional desenvolvida de forma independente por **Pablo Phillipe Cândido dos Santos**, destinada à simulação e compreensão dos fatores que influenciam os resultados de investimentos em títulos do Tesouro Direto. A aplicação permite comparar diferentes modalidades, explorar cenários econômicos e observar os efeitos de variáveis como taxas de juros, inflação, prazo, tributação, custos e marcação a mercado.

O desenvolvimento contou com a utilização de ferramentas de inteligência artificial generativa como recurso auxiliar no processo de desenvolvimento, mantendo-se sob responsabilidade do autor a concepção, implementação, integração e verificação do projeto.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)