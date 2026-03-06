const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transport from environment variables.
 * Supports any SMTP provider (Gmail, SendGrid, Mailgun, etc.)
 *
 * Required env vars:
 *   EMAIL_HOST   — SMTP host  (e.g. smtp.gmail.com)
 *   EMAIL_PORT   — SMTP port  (e.g. 587 for TLS, 465 for SSL)
 *   EMAIL_USER   — SMTP login (your full email address)
 *   EMAIL_PASS   — SMTP password or App Password
 *   EMAIL_FROM   — Display name + address, e.g. "QBus <you@gmail.com>"
 */
const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // true for SSL, false for TLS/STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends a professional HTML booking confirmation email.
 *
 * @param {Object} opts
 * @param {string}  opts.to        - Recipient email address
 * @param {string}  opts.userName  - Passenger name
 * @param {Object}  opts.booking   - Saved Booking document
 * @param {Object}  opts.bus       - Bus document (source, destination, times, etc.)
 */
const sendBookingConfirmation = async ({ to, userName, booking, bus }) => {
  const transporter = createTransport();

  const seatList = booking.seatNumbers.join(', ');
  const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation — QBus</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6; }
    .wrapper { padding: 40px 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { font-size: 26px; font-weight: 800; letter-spacing: 3px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .body { padding: 32px 40px; }
    .greeting { font-size: 16px; color: #1f2937; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
    .ticket { border: 2px dashed #d1d5db; border-radius: 10px; overflow: hidden; }
    .ticket-header { background: #f59e0b; color: #1c1917; padding: 10px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .ticket-body { padding: 4px 0; }
    .ticket-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .ticket-row:last-child { border-bottom: none; }
    .ticket-label { color: #6b7280; font-weight: 500; width: 40%; }
    .ticket-value { color: #111827; font-weight: 600; text-align: right; width: 58%; word-break: break-all; }
    .status-pill { display: inline-block; background: #d1fae5; color: #065f46; padding: 3px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .cta-section { text-align: center; margin: 28px 0 8px; }
    .cta-btn { display: inline-block; background: #2563eb; color: #ffffff; padding: 13px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; }
    .note { font-size: 12px; color: #9ca3af; margin-top: 24px; line-height: 1.6; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 40px; text-align: center; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>&#x1F68C; QBus</h1>
        <p>Your booking is confirmed!</p>
      </div>
      <div class="body">
        <p class="greeting">Hi <strong>${userName}</strong>,</p>
        <p class="subtitle">Thank you for booking with QBus. Here are your travel details.</p>

        <div class="ticket">
          <div class="ticket-header">&#x1F3AB; Booking Details</div>
          <div class="ticket-body">
            <div class="ticket-row">
              <span class="ticket-label">Booking ID</span>
              <span class="ticket-value" style="font-family:monospace;font-size:12px">${booking._id}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Route</span>
              <span class="ticket-value">${bus.source} &#x2192; ${bus.destination}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Route #</span>
              <span class="ticket-value">${booking.busId}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Departure</span>
              <span class="ticket-value">${bus.Depart_date} at ${bus.Depart_time}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Arrival</span>
              <span class="ticket-value">${bus.Arrive_date} at ${bus.Arrive_time}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Seat(s)</span>
              <span class="ticket-value">${seatList}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Total Paid</span>
              <span class="ticket-value" style="color:#16a34a">Rs. ${booking.totalPrice}.00</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Booked On</span>
              <span class="ticket-value">${bookingDate}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Status</span>
              <span class="ticket-value"><span class="status-pill">&#x2713; CONFIRMED</span></span>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-btn">View My Bookings</a>
        </div>

        <p class="note">
          Please carry a digital or printed copy of this confirmation when boarding.
          For assistance, reply to this email or visit our support page.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} QBus &mdash; Safe &amp; Comfortable Travel. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `QBus Tickets <${process.env.EMAIL_USER}>`,
    to,
    subject: `Booking Confirmed ✓ — Route ${booking.busId} | QBus`,
    html,
  });
};

module.exports = { sendBookingConfirmation };
