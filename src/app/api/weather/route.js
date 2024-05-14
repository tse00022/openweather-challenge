import { NextResponse } from 'next/server';

export async function GET(request, context) {
  const { searchParams } = new URL(request.url);
  //the request url is /api/weather/lat=${latitude}&lon=${longitude}
  // get the latitude and longitude query parameters
  const LATITUDE = searchParams.get('lat');
  const LONGITUDE = searchParams.get('lon');

  //each method function will get passed the request object
  const API_KEY = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric&formatted=0`
  //each method should return a response object
  //we can do a fetch call to another api from here
  let resp = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    next: { revalidate: 300 },
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
