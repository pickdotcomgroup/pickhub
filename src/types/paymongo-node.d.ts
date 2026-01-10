declare module "paymongo-node" {
  interface PaymongoLink {
    id: string;
    checkout_url: string;
    amount: number;
    status: string;
    remarks?: string;
  }

  interface CreateLinkParams {
    amount: number;
    description: string;
    remarks?: string;
  }

  interface WebhookConstructEventParams {
    payload: string;
    signatureHeader: string;
    webhookSecretKey: string;
  }

  interface WebhookEvent {
    type: string;
    data: Record<string, unknown>;
  }

  interface PaymongoClient {
    links: {
      create: (params: CreateLinkParams) => Promise<PaymongoLink>;
      retrieve: (id: string) => Promise<PaymongoLink>;
    };
    webhooks: {
      constructEvent: (params: WebhookConstructEventParams) => WebhookEvent;
    };
  }

  function Paymongo(secretKey: string): PaymongoClient;
  export default Paymongo;
}
