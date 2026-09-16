const nodemailer = require('nodemailer');

let transporter = null;

// Initialize transporter
const initTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_USER && SMTP_PASS && SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('[Email Service]: Configured with SMTP host', SMTP_HOST);
  } else {
    // Generate an Ethereal test account for development/demo
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service]: Initialized Ethereal Test Mailer (${testAccount.user})`);
    } catch (err) {
      console.warn('[Email Service]: Failed to generate Ethereal account, falling back to simulated mailer:', err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log(`[Simulated Email Sent] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
          return { messageId: 'simulated-' + Date.now() };
        },
      };
    }
  }

  return transporter;
};

// Send Appointment Confirmation Email
const sendAppointmentConfirmation = async ({ patientEmail, patientName, doctorName, departmentName, appointmentDate, timeSlot, appointmentNumber }) => {
  try {
    const mailer = await initTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Medixia General Hospital" <noreply@medixia.com>',
      to: patientEmail,
      subject: `Appointment Confirmed: ${appointmentNumber} with ${doctorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #0369a1; margin: 0; font-size: 22px;">Medixia General Hospital</h1>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Excellence in Healthcare &bull; Compassionate Patient Care</p>
          </div>
          
          <p style="color: #1e293b; font-size: 15px;">Dear <strong>${patientName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your OPD consultation has been confirmed. Below are your appointment details:
          </p>

          <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 40%;">Appointment Token:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${appointmentNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Attending Doctor:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Department:</td>
                <td style="padding: 6px 0; color: #0f172a;">${departmentName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Date:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${appointmentDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">OPD Time Slot:</td>
                <td style="padding: 6px 0; color: #0284c7; font-weight: bold;">${timeSlot}</td>
              </tr>
            </table>
          </div>

          <p style="color: #475569; font-size: 13px; line-height: 1.5;">
            <strong>Important Patient Instructions:</strong> Please arrive 15 minutes prior to your time slot for registration & vitals screening at the OPD Reception Counter. Please carry any past medical prescriptions, health cards, or test reports.
          </p>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>Medixia General Hospital, Sector 18, Institutional Area, New Delhi &bull; 24/7 Helpline: +91 (011) 2658-8500 &bull; Emergency: 108</p>
          </div>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Preview]: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.error('[Email Notification Error]:', error.message);
  }
};

// Send Appointment Cancellation Email
const sendAppointmentCancellation = async ({ patientEmail, patientName, doctorName, appointmentDate, timeSlot, appointmentNumber, reason }) => {
  try {
    const mailer = await initTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Medixia General Hospital" <noreply@medixia.com>',
      to: patientEmail,
      subject: `Appointment Cancelled: ${appointmentNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #dc2626; margin-top: 0;">Appointment Cancellation Notice</h2>
          <p style="color: #1e293b;">Dear <strong>${patientName}</strong>,</p>
          <p style="color: #475569;">
            This email confirms that your appointment (<strong>${appointmentNumber}</strong>) with <strong>Dr. ${doctorName}</strong> on <strong>${appointmentDate} (${timeSlot})</strong> has been cancelled.
          </p>
          ${reason ? `<p style="color: #64748b; font-style: italic;">Reason: ${reason}</p>` : ''}
          <p style="color: #475569;">
            You can reschedule your appointment at any time by logging into your patient portal.
          </p>
        </div>
      `,
    };
    await mailer.sendMail(mailOptions);
  } catch (error) {
    console.error('[Email Cancellation Error]:', error.message);
  }
};

// Send EMR & Prescription Ready Email
const sendPrescriptionReadyEmail = async ({ patientEmail, patientName, doctorName, recordNumber, visitDate }) => {
  try {
    const mailer = await initTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Medixia General Hospital" <noreply@medixia.com>',
      to: patientEmail,
      subject: `Digital Medical Record & Prescription Available: ${recordNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0369a1; margin-top: 0;">Medical Record & Prescription Issued</h2>
          <p style="color: #1e293b;">Dear <strong>${patientName}</strong>,</p>
          <p style="color: #475569;">
            Dr. <strong>${doctorName}</strong> has finalized and published your digital consultation summary and prescription for your visit on <strong>${new Date(visitDate).toLocaleDateString()}</strong>.
          </p>
          <p style="color: #475569;">
            Record Reference: <strong>${recordNumber}</strong>
          </p>
          <p style="color: #475569;">
            You can securely view and download your full prescription with clinical advice directly from your Patient Dashboard.
          </p>
        </div>
      `,
    };
    await mailer.sendMail(mailOptions);
  } catch (error) {
    console.error('[Email EMR Error]:', error.message);
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendPrescriptionReadyEmail,
};
