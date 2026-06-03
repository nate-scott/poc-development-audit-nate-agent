const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);
const lotrMovies = movieDocuments.filter(
  (m) => m.releaseYear >= 2001 && m.releaseYear <= 2003,
);

afterEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MoviesByReleaseYearsGet returns movies between the start and end release years", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(lotrMovies, "find");

  const req = { params: { startReleaseYear: "2001", endReleaseYear: "2003" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.length).toBe(3);
});

test("MoviesByReleaseYearsGet returns movies sorted by releaseYear ascending", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn([...lotrMovies].reverse(), "find");

  const req = { params: { startReleaseYear: "2001", endReleaseYear: "2003" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  for (let i = 1; i < body.length; i++) {
    expect(body[i].releaseYear).toBeGreaterThanOrEqual(body[i - 1].releaseYear);
  }
});

test("MoviesByReleaseYearsGet returns 406 when starting release year is not a number", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: { startReleaseYear: "abc", endReleaseYear: "2003" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Starting release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns 406 when starting release year is less than 2000", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: { startReleaseYear: "1999", endReleaseYear: "2003" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Starting release year must be between 2000 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 406 when starting release year is greater than 2020", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: { startReleaseYear: "2021", endReleaseYear: "2022" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Starting release year must be between 2000 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 406 when ending release year is not a number", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: { startReleaseYear: "2001", endReleaseYear: "xyz" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Ending release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns 406 when ending release year is less than 2000", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: { startReleaseYear: "2001", endReleaseYear: "1999" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Ending release year must be between 1977 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 406 when ending release year is greater than 2020", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: { startReleaseYear: "2001", endReleaseYear: "2021" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Ending release year must be between 1977 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 404 when no movies are found in the range", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn([], "find");

  const req = { params: { startReleaseYear: "2006", endReleaseYear: "2010" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movies found" });
});

test("MoviesByReleaseYearsGet returns 500 when database error occurs", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = { params: { startReleaseYear: "2001", endReleaseYear: "2003" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
