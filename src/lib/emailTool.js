
import sgMail from "@sendgrid/mail";


sgMail.setApiKey(process.env.API_KEY)

export const sendAnEmail = async recipient => {
try {
    
    const msg = {
      to: recipient,
      from: process.env.SENDER_EMAIL,
      subject: "this is my first eamil",
      text: "bla bla bla",
      html: "<p>bla bla bla bla bla </p>",
    }
  const email = await sgMail.send(msg)

    // await sgMail.send(msg)

} catch (error) {
     console.log(error)
}
}