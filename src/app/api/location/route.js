import requestIp from 'request-ip'

export async function GET(request, context) {

  let ip = requestIp.getClientIp(request)
  if (!ip) {
    ip = "76.66.143.79"
  }
  console.log("detectedIp", ip);

  //each method function will get passed the request object
  const API_KEY = process.env.API_KEY;
  const url = `https://ipinfo.io/${ip}?token=${process.env.IPINFO_API_KEY}`
  //each method should return a response object
  //we can do a fetch call to another api from here
  let resp = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    next: { revalidate: 6000 },
    //we can set the results as valid for 60 seconds
  });
  // check resp status
  if (!resp.ok) return new Response(resp.statusText, { status: resp.status });

  const data = await resp.json();
  // work with the json response
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-methods": "GET,HEAD",
      "access-control-allow-origin": "*",
    },
    status: 200,
  });
}

export async function HEAD(request) {
  return new Response(null, {
    headers: {
      "content-type": "application/json",
      "content-length": 868,
      "access-control-allow-methods": "GET,HEAD",
      "access-control-allow-origin": "*",
    },
    status: 200,
  });
}
