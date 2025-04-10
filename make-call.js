const Twilio = require('twilio');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { accountSid, authToken, twilioNumber, toNumber } = JSON.parse(event.body);

        // Validate input
        if (!accountSid || !authToken || !twilioNumber || !toNumber) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const client = new Twilio(accountSid, authToken);

        // Make the call
        const call = await client.calls.create({
            url: 'https://demo.twilio.com/docs/voice.xml', // Default TwiML (replace with your own later)
            to: toNumber,
            from: twilioNumber
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true,
                callSid: call.sid,
                message: `Call initiated to ${toNumber}`
            })
        };
    } catch (error) {
        console.error('Twilio error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false,
                error: error.message || 'Failed to initiate call'
            })
        };
    }
};
