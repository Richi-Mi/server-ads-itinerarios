import * as nodemailer from 'nodemailer'

export interface SendEmailOptions {
    to: string | string[],
    subject : string,
    htmlBody : string,
    attachments?: Attachment[]
}
export interface Attachment {
    filename : string,
    path : string
}

export class EmailService {

    static instance : EmailService | null = null;

    public static getInstance() : EmailService {
        if( this.instance === null ) {
            this.instance = new EmailService();
        }
        return this.instance;
    }
    
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: Bun.env.MAILER_EMAIL,
            pass: Bun.env.MAILER_SECRET_KEY
        },
        debug: true
    })

    async sendEmail( options : SendEmailOptions ) : Promise<boolean> {
        // TODO: change this with resend
        const { to, subject, htmlBody, attachments = [] } = options
        try {
            await this.transporter.sendMail({
                to,
                subject,
                html: htmlBody,
                attachments
            })
            return true
        } catch( err ) {
            console.error("Error al enviar el correo:", err)
            return false
        }
    }
    async sendEmailForVerification(to : string) : Promise<boolean> {
        const subject = 'SharePath - Verifica tu dirección de correo electrónico';

        const htmlBody = `
            <h1> SharePath </h1>
            <p> Gracias por registrarte en SharePath. Por favor, haz clic en el siguiente enlace para verificar tu dirección de correo electrónico:</p>
            <h3> Verificación de correo electrónico </h3>
            <a href="${Bun.env.HOST}/auth/verify-email?email=${to}">Verificar correo electrónico</a>
            `

        return this.sendEmail({
            to,
            subject,
            htmlBody
        })
    }

}
