import type { MarkToMarketResult, SimulationInputs, SimulationResult, TreasuryType } from './types';

export const B3_CUSTODY = 0.002;
export const SELIC_CUSTODY_EXEMPTION = 10_000;

const IOF_TABLE = [
  0, 96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50,
  46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3, 0
];

export function annualToMonthly(ratePct: number): number {
  return Math.pow(1 + ratePct / 100, 1 / 12) - 1;
}

export function combineRates(aPct: number, bPct: number): number {
  return ((1 + aPct / 100) * (1 + bPct / 100) - 1) * 100;
}

export function incomeTaxRate(days: number): number {
  if (days <= 180) return 0.225;
  if (days <= 360) return 0.20;
  if (days <= 720) return 0.175;
  return 0.15;
}

export function iofRate(days: number): number {
  if (days <= 0 || days >= 30) return 0;
  return IOF_TABLE[days] / 100;
}

function titleLabel(type: TreasuryType): string {
  return {
    selic: 'Tesouro Selic',
    prefixado: 'Tesouro Prefixado',
    'prefixado-cupom': 'Prefixado c/ juros semestrais',
    ipca: 'Tesouro IPCA+',
    'ipca-cupom': 'IPCA+ c/ juros semestrais'
  }[type];
}

function titleRate(type: TreasuryType, i: SimulationInputs): number {
  if (type === 'selic') return i.selic + i.selicSpread;
  if (type.startsWith('prefixado')) return i.prefixRate;
  return combineRates(i.inflation, i.ipcaRealRate);
}

function custodyForMonth(type: TreasuryType, balance: number): number {
  const monthlyCustody = Math.pow(1 + B3_CUSTODY, 1 / 12) - 1;
  if (type === 'selic') return Math.max(0, balance - SELIC_CUSTODY_EXEMPTION) * monthlyCustody;
  return balance * monthlyCustody;
}

function simulateCore(type: TreasuryType, i: SimulationInputs): SimulationResult {
  const months = Math.max(1, Math.round(i.years * 12));
  const annualRate = titleRate(type, i);
  const monthlyRate = annualToMonthly(annualRate);
  const monthlyInflation = annualToMonthly(i.inflation);
  const isCoupon = type.endsWith('cupom');
  const nominalCouponAnnual = type === 'prefixado-cupom' ? 10 : type === 'ipca-cupom' ? 6 : 0;
  const halfYearCoupon = Math.pow(1 + nominalCouponAnnual / 100, 0.5) - 1;

  let balance = i.initial;
  let invested = i.initial;
  let custody = 0;
  let couponsNet = 0;
  let inflationIndex = 1;
  const projection = [];

  for (let month = 1; month <= months; month++) {
    balance *= 1 + monthlyRate;
    inflationIndex *= 1 + monthlyInflation;

    if (i.custodyEnabled) {
      const fee = custodyForMonth(type, balance);
      balance -= fee;
      custody += fee;
    }

    if (isCoupon && month % 6 === 0) {
      const couponBase = type === 'ipca-cupom' ? invested * inflationIndex : invested;
      const couponGross = couponBase * halfYearCoupon;
      const daysSinceStart = Math.round(month * 30.4375);
      const couponTax = i.incomeTaxEnabled ? couponGross * incomeTaxRate(daysSinceStart) : 0;
      const couponNet = Math.max(0, couponGross - couponTax);
      couponsNet += couponNet;
      balance = Math.max(0, balance - couponGross);
      if (i.reinvestCoupons) balance += couponNet;
    }

    if (i.monthlyContribution > 0 && month < months) {
      balance += i.monthlyContribution;
      invested += i.monthlyContribution;
    }

    if (month === 1 || month % 6 === 0 || month === months) {
      projection.push({
        month,
        invested,
        gross: balance,
        realGross: balance / inflationIndex
      });
    }
  }

  const days = Math.round(i.years * 365.25);
  const taxableProfit = Math.max(0, balance - invested);
  const iof = i.incomeTaxEnabled ? taxableProfit * iofRate(days) : 0;
  const incomeTax = i.incomeTaxEnabled ? Math.max(0, taxableProfit - iof) * incomeTaxRate(days) : 0;
  const netBalance = Math.max(0, balance - iof - incomeTax);
  const net = netBalance + (i.reinvestCoupons ? 0 : couponsNet);
  const realNet = net / inflationIndex;
  const nominalReturnPct = invested > 0 ? ((net / invested) - 1) * 100 : 0;
  const realReturnPct = invested > 0 ? ((realNet / invested) - 1) * 100 : 0;

  const explanations: Record<TreasuryType, string> = {
    selic: 'A projeção acompanha a Selic informada, acrescida do pequeno ágio/deságio configurado. A baixa oscilação de preço tende a reduzir o efeito da marcação a mercado no curto prazo.',
    prefixado: 'A taxa nominal é conhecida na compra. Se o título for levado ao vencimento, a taxa contratada determina o retorno nominal; a inflação é o principal fator que altera o ganho em poder de compra.',
    'prefixado-cupom': 'Além da taxa contratada, há fluxo semestral. Cupons antecipam imposto e podem reduzir o efeito dos juros compostos quando não são reinvestidos.',
    ipca: 'O retorno combina a inflação observada no cenário com uma taxa real contratada. O poder de compra é protegido no vencimento, mas o preço pode oscilar bastante antes dele.',
    'ipca-cupom': 'Combina correção pelo IPCA, taxa real e pagamentos semestrais. Os cupons criam fluxo de caixa, mas também antecipam tributação e reduzem capitalização quando consumidos.'
  };

  return {
    type,
    label: titleLabel(type),
    invested,
    gross: balance,
    incomeTax,
    iof,
    custody,
    net,
    realNet,
    nominalReturnPct,
    realReturnPct,
    annualRate,
    couponsNet,
    explanation: explanations[type],
    projection
  };
}

export function simulateAll(i: SimulationInputs): SimulationResult[] {
  return (['selic', 'prefixado', 'ipca', 'prefixado-cupom', 'ipca-cupom'] as TreasuryType[])
    .map((type) => simulateCore(type, i));
}

export function markToMarket(
  yearsToMaturity: number,
  contractedRatePct: number,
  marketRatePct: number,
  inflationLinked: boolean,
  inflationPct: number
): MarkToMarketResult {
  const maturity = Math.max(0.1, yearsToMaturity);
  const contracted = contractedRatePct / 100;
  const market = marketRatePct / 100;
  const initialPrice = 1000 / Math.pow(1 + contracted, maturity);
  const estimatedPrice = 1000 / Math.pow(1 + market, maturity);
  const inflationFactor = inflationLinked ? Math.pow(1 + inflationPct / 100, Math.min(1, maturity)) : 1;
  const adjustedEstimated = estimatedPrice * inflationFactor;
  const changePct = ((adjustedEstimated / initialPrice) - 1) * 100;
  const duration = maturity / (1 + market);

  return {
    initialPrice,
    estimatedPrice: adjustedEstimated,
    changePct,
    duration,
    direction: changePct > 0.05 ? 'up' : changePct < -0.05 ? 'down' : 'flat'
  };
}

export function retirementIncome(
  initial: number,
  monthlyContribution: number,
  accumulationYears: number,
  inflationPct: number,
  realRatePct: number,
  payoutYears: number
) {
  const nominalAnnual = combineRates(inflationPct, realRatePct);
  const r = annualToMonthly(nominalAnnual);
  const months = Math.round(accumulationYears * 12);
  let balance = initial;
  let invested = initial;

  for (let m = 1; m <= months; m++) {
    balance *= 1 + r;
    if (monthlyContribution > 0 && m < months) {
      balance += monthlyContribution;
      invested += monthlyContribution;
    }
  }

  const payoutMonths = payoutYears * 12;
  const realMonthly = annualToMonthly(realRatePct);
  const realBalance = balance / Math.pow(1 + inflationPct / 100, accumulationYears);
  const monthlyRealIncome = realMonthly === 0
    ? realBalance / payoutMonths
    : realBalance * (realMonthly * Math.pow(1 + realMonthly, payoutMonths)) /
      (Math.pow(1 + realMonthly, payoutMonths) - 1);

  return {
    invested,
    nominalBalance: balance,
    realBalance,
    monthlyRealIncome,
    payoutMonths,
    nominalAnnual
  };
}
