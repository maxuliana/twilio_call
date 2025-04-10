const Twilio = require('twilio');

exports.handler = async (event, context) => {
  // Validate HTTP method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse incoming request
    const { accountSid, authToken } = JSON.parse(event.body);

    // Validate credentials format
    if (!accountSid?.startsWith('AC') || !authToken || authToken.length < 32) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid Twilio credentials format' })
      };
    }

    // Generate random client identifier (safe for Twilio)
    const clientIdentity = `agent_${Math.random().toString(36).substr(2, 8)}`;

    // Create Voice token (expires in 1 hour)
    const token = new Twilio.jwt.ClientToken({
      ttl: 3600,
      identity: clientIdentity
    });

    // Add Voice grant (outbound calls only)
    const voiceGrant = new Twilio.jwt.ClientToken.VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_APP_SID, // Optional for custom TwiML
      incomingAllow: false // Disable incoming calls for security
    });
    token.addGrant(voiceGrant);

    // Test credentials by initializing Twilio client
    const testClient = new Twilio(accountSid, authToken);
    await testClient.api.accounts(accountSid).fetch(); // Throws if invalid

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.toJwt(),
        identity: clientIdentity,
        expiresIn: 3600
      })
    };

  } catch (error) {
    console.error('Token generation error:', error);

    // Specific error messages for common cases
    let userMessage = 'Failed to generate token';
    if (error.message.includes('Authentication Error')) {
      userMessage = 'Invalid Twilio credentials';
    } else if (error.message.includes('not found')) {
      userMessage = 'Account SID not found';
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
