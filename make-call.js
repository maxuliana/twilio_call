const Twilio = require('twilio');

exports.handler = async (event) => {
  try {
    // Use environment variables (set in Netlify)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const { toNumber } = JSON.parse(event.body);

    if (!accountSid || !authToken || !toNumber) {
      throw new Error('Missing credentials or phone number.');
    }

    const client = new Twilio(accountSid, authToken);

    // Use your TwiML Bin URL here (replace with yours)
    const call = await client.calls.create({
      url: 'https://handler.twilio.com/twiml/YOUR_TWIML_BIN_ID',
      to: toNumber,
      from: process.env.TWILIO_PHONE_NUMBER, // Add this to Netlify env vars
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, callSid: call.sid }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
