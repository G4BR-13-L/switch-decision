export interface SwitchOption {
  id: string;
  name: string; // Ex: Switch v2 Novo Travado - Stop Games (site)
  model: 'OLED' | 'V2' | 'V1' | 'LITE';
  condition: 'NOVO' | 'SEMINOVO' | 'USADO';
  storageGb: 512 | 256 | 128 | 64 | 32;
  store: string; // Store ID
  cashPrice: number;
  installmentWithInterestPrice: number; // Total price with interest
  qtyInstallmentsWithInterest: number;
  installmentValueWithInterest: number; // Single installment value
  installmentWithoutInterestPrice: number; // Total price without interest
  qtyInstallmentsWithoutInterest: number;
  installmentValueWithoutInterest?: number; // Single installment value
  hasInstallmentWithInterest: boolean;
  hasInstallmentWithoutInterest: boolean;
  paymentMethod: 'PIX' | 'CREDITO' | 'BOLETO';
  warrantyDays: number; // Em dias, quanto maior melhor
  discountPercentage?: number;
  isUnlocked: boolean; // Desbloqueado > Bloqueado
}
