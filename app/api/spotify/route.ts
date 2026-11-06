type Track = {
  name: string;
  artists: { name: string }[];
  external_urls: { spotify: string };
};

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return null;
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

const format = (track: Track, playing: boolean) => ({
  playing,
  title: track.name,
  artist: track.artists.map((a) => a.name).join(", "),
  url: track.external_urls.spotify,
});

export async function GET() {
  const token = await getAccessToken();
  if (!token) return Response.json({ error: "unavailable" }, { status: 503 });
  const headers = { Authorization: `Bearer ${token}` };

  const now = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers },
  );
  if (now.status === 200) {
    const data = (await now.json()) as { is_playing: boolean; item: Track | null };
    if (data.item && data.is_playing) {
      return Response.json(format(data.item, true));
    }
  }

  const recent = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    { headers },
  );
  if (!recent.ok) return Response.json({ error: "unavailable" }, { status: 502 });
  const data = (await recent.json()) as { items: { track: Track }[] };
  const track = data.items[0]?.track;
  if (!track) return Response.json({ error: "empty" }, { status: 404 });
  return Response.json(format(track, false));
}
