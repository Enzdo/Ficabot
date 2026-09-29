import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'resend',

  mailers: {
    /**
     * L'API HTTP de Resend, et non son SMTP.
     *
     * Les envois partaient en `ETIMEDOUT` sur la connexion : l'hébergeur bloque
     * les ports SMTP sortants, comme la plupart. Rien ne le disait à l'écran —
     * l'échec était journalisé et l'appel rendait la main. Aucun e-mail n'a
     * jamais quitté la production par ce chemin.
     *
     * L'API passe par le port 443, qui n'est bloqué nulle part, et les envois
     * apparaissent dans le tableau de bord de Resend — le SMTP, lui, n'y était
     * pas listé, ce qui rendait toute vérification impossible.
     */
    resend: transports.resend({
      key: env.get('RESEND_API_KEY') || '',
      baseUrl: 'https://api.resend.com',
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
