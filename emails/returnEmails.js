function getRecoverEmailTemplate(appName, recoveryLink) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Recovery</title>
        <style>
            /* Email Body */
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }
            /* Email Wrapper */
            .email-wrapper {
                max-width: 600px;
                margin: auto;
                padding: 20px;
            }
            /* Email Header */
            .email-header {
                text-align: center;
                margin-bottom: 20px;
            }
            /* Email Content */
            .email-content {
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 8px;
            }
            /* Button Style */
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-header">
                <h1>Password Recovery</h1>
            </div>
            <div class="email-content">
                <p>Hello,</p>
                <p>You have requested to reset your password. Please click the button below to reset it:</p>
                <a href="${recoveryLink}" class="button">Reset Password</a>
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>Thank you,</p>
                <p>${appName}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
function getWelcomeEmailTemplate(appName, username) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${appName}!</title>
        <style>
            /* Email Body */
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            /* Email Wrapper */
            .email-wrapper {
                max-width: 600px;
                margin: auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }
            /* Email Header */
            .email-header {
                text-align: center;
                margin-bottom: 20px;
            }
            /* Email Content */
            .email-content {
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 8px;
            }
            /* Button Style */
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-header">
                <h1>Welcome to ${appName}!</h1>
            </div>
            <div class="email-content">
                <p>Hi ${username},</p>
                <p>We’re excited to have you on board. You’re now part of a community that values innovation and excellence.</p>
                <p>If you have any questions, feel free to reach out.</p>
                <p>Best Regards,</p>
                <p>The ${appName} Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = { getRecoverEmailTemplate, getWelcomeEmailTemplate };
