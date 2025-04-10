const Twilio = require('twilio');

exports.handler = async (event) => {
  try {
    const { accountSid, authToken, twilioNumber, toNumber } = JSON.parse(event.body);

    // Validate input
    if (!accountSid || !authToken || !twilioNumber || !toNumber) {
      throw new Error('Missing required fields.');
    }

    // Initialize Twilio client
    const client = new Twilio(accountSid, authToken);

    // Make the call
    const call = await client.calls.create({
      url: 'https://handler.twilio.com/twiml/EH3eed4a5e8a8681d6d71f2197760a8a34', // Default TwiML (replace with your own)
      to: toNumber,
      from: twilioNumber,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, callSid: call.sid }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
