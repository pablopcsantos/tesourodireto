export type TreasuryType =
  | 'selic'
  | 'prefixado'
  | 'prefixado-cupom'
  | 'ipca'
  | 'ipca-cupom';

export interface SimulationInputs {
  initial: number;
  monthlyContribution: number;
  years: number;
  selic: number;
  inflation: number;
  selicSpread: number;
  prefixRate: number;
  ipcaRealRate: number;
  custodyEnabled: boolean;
  incomeTaxEnabled: boolean;
  reinvestCoupons: boolean;
}

export interface ProjectionPoint {
  month: number;
  invested: number;
  gross: number;
  realGross: number;
}

export interface SimulationResult {
  type: TreasuryType;
  label: string;
  invested: number;
  gross: number;
  incomeTax: number;
  iof: number;
  custody: number;
  net: number;
  realNet: number;
  nominalReturnPct: number;
  realReturnPct: number;
  annualRate: number;
  couponsNet: number;
  explanation: string;
  projection: ProjectionPoint[];
}

export interface MarkToMarketResult {
  initialPrice: number;
  estimatedPrice: number;
  changePct: number;
  duration: number;
  direction: 'up' | 'down' | 'flat';
}
