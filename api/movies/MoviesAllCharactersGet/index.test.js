const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);

afterEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MoviesAllCharactersGet returns flat array of unique {name, race} objects ordered by movie release year", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = {};
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];

  expect(Array.isArray(body)).toBe(true);
  // Each item has only name and race
  body.forEach((c) => {
    expect(c).toHaveProperty("name");
    expect(c).toHaveProperty("race");
    expect(c._id).toBeUndefined();
  });
});

test("MoviesAllCharactersGet deduplicates characters that appear in multiple movies", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = {};
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  // Count occurrences of each name — should be exactly 1
  const nameCounts = {};
  body.forEach((c) => {
    nameCounts[c.name] = (nameCounts[c.name] || 0) + 1;
  });
  Object.values(nameCounts).forEach((count) => expect(count).toBe(1));
});

test("MoviesAllCharactersGet shows characters from earliest movie first", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = {};
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  // First character should be from Fellowship (2001) — Frodo Baggins
  expect(body[0].name).toBe("Frodo Baggins");
  expect(body[0].race).toBe("Hobbit");
});

test("MoviesAllCharactersGet returns empty array when no movies exist", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn([], "find");

  const req = {};
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([]);
});

test("MoviesAllCharactersGet returns 500 when database error occurs", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {};
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
