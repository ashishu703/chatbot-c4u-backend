async function sendEmail(host, port, email, pass, html, subject, from, to) {
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === "465",
      auth: { user: email, pass },
    });

    const info = await transporter.sendMail({
      from: `${from || "Email From"} <${email}>`,
      to,
      subject: subject || "Email",
      html,
    });

    return { success: true, info };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, err: err.toString() || "Invalid Email" };
  }
}



module.exports = { sendEmail };