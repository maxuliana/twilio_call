const Twilio = require('twilio');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Use environment variables (set in Netlify) or fallback to empty
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    // Validate required environment variables
    if (!accountSid || !apiKey || !apiSecret) {
      throw new Error('Missing Twilio environment variables');
    }

    const client = new Twilio(apiKey, apiSecret, { accountSid });

    // Create a Voice token (expires in 1 hour)
    const token = new Twilio.jwt.ClientToken({
      ttl: 3600,
      identity: 'user_' + Math.random().toString(36).substr(2, 9) // Random user ID
    });

    // Grant voice capabilities
    const voiceGrant = new Twilio.jwt.ClientToken.VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_APP_SID, // Optional: Your TwiML App SID
      incomingAllow: true // Allow incoming calls
    });
    token.addGrant(voiceGrant);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.toJwt(),
        identity: token.identity,
        twilioNumber
      })
    };

  } catch (error) {
    console.error('Token generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Failed to generate token' 
      })
    };
  }
};
