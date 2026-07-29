import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_OMDB_BASE_URL,
  params: { apikey: import.meta.env.VITE_OMDB_KEY },
  timeout: 8000,
});

export const ErrorKind = {
  OFFLINE: "offline",
  AUTH: "auth",
  RATE_LIMIT: "rate-limit",
  TOO_BROAD: "too-broad",
  NOT_FOUND: "not-found",
  SERVER: "server",
  UNKNOWN: "unknown",
};

// UI copy per kind — keeps OMDb's raw strings ("Movie not found!") off the screen
const FRIENDLY = {
  [ErrorKind.OFFLINE]: "No internet connection.",
  [ErrorKind.AUTH]: "The API key was rejected. Check your OMDb key.",
  [ErrorKind.RATE_LIMIT]: "Daily request limit reached. Try again later.",
  [ErrorKind.TOO_BROAD]: "Too many results — try a more specific title.",
  [ErrorKind.NOT_FOUND]: "No movies matched that search.",
  [ErrorKind.SERVER]: "OMDb is having trouble. Try again shortly.",
  [ErrorKind.UNKNOWN]: "Something went wrong. Please try again.",
};

export class OmdbError extends Error {
  constructor(kind, message = FRIENDLY[kind]) {
    super(message);
    this.name = "OmdbError";
    this.kind = kind;
  }
}

function kindFromMessage(message = "") {
  const m = message.toLowerCase();

  if (m.includes("api key")) return ErrorKind.AUTH;
  if (m.includes("request limit")) return ErrorKind.RATE_LIMIT;
  if (m.includes("too many results")) return ErrorKind.TOO_BROAD;
  if (m.includes("not found")) return ErrorKind.NOT_FOUND;
  return ErrorKind.UNKNOWN;
}

function normalize(err) {
  if (err instanceof OmdbError) return err;

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return new OmdbError(ErrorKind.OFFLINE);
  }

  if (err.response) {
    const { status } = err.response;
    if (status === 401 || status === 403) return new OmdbError(ErrorKind.AUTH);
    if (status === 429) return new OmdbError(ErrorKind.RATE_LIMIT);
    return new OmdbError(ErrorKind.SERVER, `OMDb responded with ${status}.`);
  }

  // no response object at all: timeout or the request never left the browser
  if (err.code === "ECONNABORTED") {
    return new OmdbError(ErrorKind.OFFLINE, "The request timed out.");
  }
  return new OmdbError(ErrorKind.UNKNOWN);
}

async function request(params, { signal } = {}) {
  let data;

  try {
    ({ data } = await api.get("/", { params, signal }));
  } catch (err) {
    if (axios.isCancel(err)) throw err; // caller's cleanup swallows this
    throw normalize(err);
  }

  // OMDb answers 200 OK even for failures — the real status is in the body
  if (data.Response === "False") {
    throw new OmdbError(kindFromMessage(data.Error));
  }
  return data;
}

export function searchMovies(query, page = 1, opts) {
  return request({ s: query, page }, opts);
}

export function getMovieDetails(id, opts) {
  return request({ i: id, plot: "full" }, opts);
}
