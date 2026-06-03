const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);
const returnOfTheKing = movieDocuments.find(
  (m) => m.title === "The Lord of the Rings: The Return of the King",
);

afterEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MovieByIdGet returns a movie when a valid id is provided", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");

  const req = { params: { id: "69efd1c1b2f8c7327f029faf" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.title).toBe("The Lord of the Rings: The Return of the King");
  expect(body.releaseYear).toBe(2003);
});

test("MovieByIdGet returns 400 when no id is provided", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "An id is required" });
});

test("MovieByIdGet returns 404 when id is not a valid ObjectId", async () => {
  const MovieModel = require("../models/movie");

  const req = { params: { id: "not-a-valid-id" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieByIdGet returns 404 when no movie is found with the given id", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(null, "findOne");

  const req = { params: { id: "69efd1c1b2f8c7327f029faf" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieByIdGet returns 500 when database error occurs", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = { params: { id: "69efd1c1b2f8c7327f029faf" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
