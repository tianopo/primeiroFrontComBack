export type StatementExportItem = {
  timestamp?: string;
  amount?: number;
  currency?: string;
  operation?: string;
  description?: string;
  balance?: number;
  transactionType?: string;
  method?: string;
  status?: string;
  direction?: string;
  identifier?: string;
  endToEndId?: string;
  orderId?: string;
  code?: string;
  transactionId?: string;

  payer?: {
    name?: string;
    document?: string;
    bankCode?: string;
    bankName?: string;
    branch?: string;
    account?: string;
    pixKey?: string;
  };

  payee?: {
    name?: string;
    document?: string;
    bankCode?: string;
    bankName?: string;
    branch?: string;
    account?: string;
    pixKey?: string;
  };

  raw?: any;
};

export type StatementExportResume = {
  startDate: string;
  endDate: string;
  balance?: number;
  entradas?: number;
  saidas?: number;
  taxas?: number;
};
