const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON("../api/movies/_test/documents/movies-get-document.json");

afterEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MoviesNamesByRaceGet returns characters and their movies for a valid race", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { params: { raceName: "Man" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(Array.isArray(body)).toBe(true);
  // Each item has name and movies array
  body.forEach(item => {
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("movies");
    expect(Array.isArray(item.movies)).toBe(true);
  });
});

test("MoviesNamesByRaceGet is case-insensitive for raceName", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { params: { raceName: "hobbit" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.length).toBeGreaterThan(0);
  body.forEach(item => expect(item.movies.length).toBeGreaterThan(0));
});

test("MoviesNamesByRaceGet lists each character only once even if they appear in multiple movies", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { params: { raceName: "Hobbit" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];
  const names = body.map(c => c.name);
  const uniqueNames = [...new Set(names)];
  expect(names.length).toBe(uniqueNames.length);
});

test("MoviesNamesByRaceGet collects all movie titles for a character appearing in multiple films", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { params: { raceName: "Man" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];
  const aragorn = body.find(c => c.name === "Aragorn");
  expect(aragorn).toBeDefined();
  // Aragorn appears in all 3 LOTR films
  expect(aragorn.movies.length).toBe(3);
});

test("MoviesNamesByRaceGet returns 404 when no characters match the race", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { params: { raceName: "Vampire" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No character with that race was found in a movie." });
});

test("MoviesNamesByRaceGet returns 500 when database error occurs", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockRejectedValue(new Error("Database connection failed"));

  const req = { params: { raceName: "Man" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
