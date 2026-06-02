export interface BankfulTokenizeArgs {
  cardholderName?: string;
  billingPostalCode?: string;
}
export interface BankfulTokenizeResult {
  token: string;
}
export interface BankfulFieldStyle {
  base?: Record<string, string>;
  invalid?: Record<string, string>;
  placeholder?: Record<string, string>;
}
export interface BankfulHostedFields {
  mount(opts: {
    fields: {
      cardNumber: { selector: string; placeholder?: string };
      expiry: { selector: string; placeholder?: string };
      cvv: { selector: string; placeholder?: string };
    };
    styles?: BankfulFieldStyle;
    onFocus?: (field: string) => void;
    onBlur?: (field: string) => void;
    onValidityChange?: (field: string, error: string | null) => void;
    onReady?: () => void;
  }): void;
  tokenize(args: BankfulTokenizeArgs): Promise<BankfulTokenizeResult>;
  handleAction(threeDS: unknown): Promise<BankfulTokenizeResult>;
  destroy(): void;
}
export interface BankfulSDK {
  create(opts: { publishableKey: string; environment: string }): BankfulHostedFields;
}
declare global {
  interface Window {
    Bankful?: BankfulSDK;
  }
}
export {};
