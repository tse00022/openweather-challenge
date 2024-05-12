export async function GET(request, context) {
  //each method function will get passed the request object
  const CITY = context.params.city;
  const API_KEY = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&formatted=0`
  //each method should return a response object
  //we can do a fetch call to another api from here
  let resp = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    next: { revalidate: 60 },
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
