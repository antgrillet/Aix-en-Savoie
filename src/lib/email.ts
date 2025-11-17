import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined')
}

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactEmailData {
  nom: string
  prenom: string
  email: string
  telephone?: string
  message: string
  experience?: boolean
  niveau?: string
  positions?: string[]
}

export async function sendContactEmail(data: ContactEmailData) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const toEmail = 'contact@hbcaixensavoie.fr' // Email du club

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f97316;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .field {
            margin-bottom: 15px;
          }
          .label {
            font-weight: bold;
            color: #4b5563;
          }
          .value {
            margin-top: 5px;
            padding: 10px;
            background-color: white;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouveau message de contact</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Nom complet :</div>
              <div class="value">${data.prenom} ${data.nom}</div>
            </div>

            <div class="field">
              <div class="label">Email :</div>
              <div class="value">${data.email}</div>
            </div>

            ${data.telephone ? `
              <div class="field">
                <div class="label">Téléphone :</div>
                <div class="value">${data.telephone}</div>
              </div>
            ` : ''}

            ${data.experience !== undefined ? `
              <div class="field">
                <div class="label">Expérience en handball :</div>
                <div class="value">${data.experience ? 'Oui' : 'Non'}</div>
              </div>
            ` : ''}

            ${data.niveau ? `
              <div class="field">
                <div class="label">Niveau :</div>
                <div class="value">${data.niveau}</div>
              </div>
            ` : ''}

            ${data.positions && data.positions.length > 0 ? `
              <div class="field">
                <div class="label">Positions :</div>
                <div class="value">${data.positions.join(', ')}</div>
              </div>
            ` : ''}

            <div class="field">
              <div class="label">Message :</div>
              <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Nouveau message de ${data.prenom} ${data.nom}`,
      html: htmlContent,
      replyTo: data.email,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
