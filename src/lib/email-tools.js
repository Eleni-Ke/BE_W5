import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendsPostEmail = async (recipientAdress) => {
  console.log(recipientAdress);
  const msg = {
    to: recipientAdress,
    from: process.env.SENDER_EMAIL_ADDRESS,
    subject: "First email sent!",
    text: "bla bla bla",
    html: "<strong>bla bla bla but in bold</strong>",
  };
  await sgMail.send(msg);
};
