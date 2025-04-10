exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial>
          <Client>your-browser-client-name</Client> <!-- Match the "Agent" param -->
        </Dial>
      </Response>`
  };
};
