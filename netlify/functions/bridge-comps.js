exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const { lat, lng } = params;

  if (!lat || !lng) {
    return { statusCode: 400, body: JSON.stringify({ error: 'lat and lng required' }) };
  }

  const BRIDGE_TOKEN = '2fe926ca00e82d66f42662f571225a37';
  const BASE = 'https://api.bridgedataoutput.com/api/v2/OData/imls';

  const ninetyDaysAgo = new Date(Date.now() - 90*24*60*60*1000).toISOString().split('T')[0];
  const latDelta = 0.0145;
  const lngDelta = 0.0175;

  const url = `${BASE}/Property?access_token=${BRIDGE_TOKEN}` +
    `&$filter=MlsStatus eq 'Closed'` +
    ` and CloseDate ge ${ninetyDaysAgo}` +
    ` and Latitude ge ${(parseFloat(lat) - latDelta).toFixed(6)}` +
    ` and Latitude le ${(parseFloat(lat) + latDelta).toFixed(6)}` +
    ` and Longitude ge ${(parseFloat(lng) - lngDelta).toFixed(6)}` +
    ` and Longitude le ${(parseFloat(lng) + lngDelta).toFixed(6)}` +
    `&$select=ClosePrice,LivingArea,CloseDate&$top=50&$orderby=CloseDate desc`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Bridge API error: ${res.status}`);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://weisko.com'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
