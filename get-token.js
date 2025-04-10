const Twilio = require('twilio');

exports.handler = async () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = new Twilio(accountSid, authToken);

  // Generate a capability token for browser calling
  const capability = new Twilio.jwt.ClientCapability({
    accountSid,
    authToken,
  });

  capability.addScope(
    new Twilio.jwt.ClientCapability.OutgoingClientScope({
      applicationSid: process.env.TWILIO_APP_SID // Create a TwiML App first
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ token: capability.toJwt() }),
  };
};
