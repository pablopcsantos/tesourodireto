# Tesouro Educa

*Leia isto em outros idiomas: [Português](README.md)*

---

Educational web application designed to explain the factors that influence the results of investments in Brazilian Tesouro Direto government bonds. The project was designed for static deployment on GitHub Pages and does not require a backend.

## What's included

- Comparison between Tesouro Selic, Tesouro Prefixado, and Tesouro IPCA+.
- Semiannual-interest versions of Tesouro Prefixado and Tesouro IPCA+.
- Initial investment and monthly contributions.
- Selic-rate and inflation scenarios.
- Gross value, net value, and equivalent value in today's purchasing power.
- Regressive income tax and IOF for short holding periods.
- Estimated B3 custody fee, including a simplified exemption for the first R$ 10,000 invested in Tesouro Selic.
- Demonstration of coupon effects and reinvestment.
- Nominal and real-value charts.
- Mark-to-market laboratory.
- Educational module for Tesouro RendA+ and Tesouro Educa+.
- Concepts guide.
- Responsive layout.
- GitHub Pages-ready workflow.

## Important

This project is a financial education tool. Some routines are deliberately simplified to make learning easier, especially:

- pricing for early sale;
- coupon schedule and pricing;
- RendA+ and Educa+;
- business-day conventions, VNA, and market curves;
- current bond rates and prices.

The application does not retrieve real-time data and does not constitute investment advice.

## Technologies

- Svelte 5
- TypeScript
- Vite
- Native SVG for charts

## Run locally

```bash
npm install
npm run dev
```

## Checks

```bash
npm run check
npm run build
```

## Publish on GitHub Pages

1. Create a repository on GitHub and push these files to the `main` branch.
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions**.
4. The `.github/workflows/deploy.yml` workflow will build and publish the project automatically on every push to `main`.

The `vite.config.ts` file uses `base: './'`, making assets compatible with projects published in GitHub Pages subdirectories.

## Architecture

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

The financial calculations are kept in `src/lib/finance.ts`, separate from the interface.

## Recommended conceptual sources

For rule validation and future updates, always consult the official Tesouro Direto and B3 pages, especially the rules and regulations, bond characteristics, historical prices and rates, and pricing materials.

## 👤 Authorship and development

**Tesouro Educa** is an educational web application independently developed by **Pablo Phillipe Cândido dos Santos**, intended to support the simulation and understanding of the factors that influence the results of investments in Tesouro Direto bonds. The application allows users to compare different bond types, explore economic scenarios, and observe the effects of variables such as interest rates, inflation, investment horizon, taxation, costs, and mark-to-market pricing.

Generative artificial intelligence tools were used as auxiliary resources during development, while responsibility for the project's conception, implementation, integration, and verification remained with the author.

Lattes CV: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
