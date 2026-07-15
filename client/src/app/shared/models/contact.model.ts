export interface ContactMessagePayload {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface ContactMessageResponse {
  success: true;
  data: {
    messageId: string;
    email: {
      delivered: boolean;
      provider: 'resend' | 'dev-log';
    };
  };
}
