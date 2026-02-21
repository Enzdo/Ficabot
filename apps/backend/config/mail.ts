import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'resend',

  mailers: {
    resend: transports.smtp({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: env.get('RESEND_API_KEY'),
      },
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
