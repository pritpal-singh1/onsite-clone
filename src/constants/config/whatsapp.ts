/**
 * WhatsApp Configuration Constants
 */

export const WHATSAPP_CONFIG = {
  MESSAGE_TEMPLATE: (partyName: string, amount: string, material: string, project: string) =>
    `Hi ${partyName},\n\nThis is a reminder regarding the pending payment:\n\nAmount: ${amount}\nMaterial: ${material}\nProject: ${project}\n\nPlease arrange the payment at your earliest convenience.\n\nThank you!`,

  BASE_URL: 'https://wa.me/',

  formatMessage: (template: string) => encodeURIComponent(template),
} as const;
