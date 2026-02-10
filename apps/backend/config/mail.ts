import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  /**
   * Default mailer to be used for sending emails
   */
  default: 'smtp',

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or the same transport with different
   * options.
   */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
      secure: env.get('SMTP_SECURE', false),
      auth: {
        user: env.get('SMTP_USERNAME'),
        pass: env.get('SMTP_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: env.get('SMTP_REJECT_UNAUTHORIZED', true),
      },
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
