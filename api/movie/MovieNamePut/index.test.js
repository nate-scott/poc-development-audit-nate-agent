const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);
const fellowship = movieDocuments.find(
  (m) => m.title === "The Lord of the Rings: The Fellowship of the Ring",
);

afterEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MovieNamePut returns 204 when movie name is updated successfully", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose(MovieModel).toReturn(fellowship, "findOne");
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

  const req = {
    body: {
      movieId: "69efd1c1b2f8c7327f029fad",
      movieName: "LOTR: Fellowship",
    },
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
});

test("MovieNamePut returns 406 when movieName is missing", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = { body: { movieId: "69efd1c1b2f8c7327f029fad" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie Name is not valid. It must be at least three characters.",
  });
});

test("MovieNamePut returns 406 when movieName has less than three characters", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieId: "69efd1c1b2f8c7327f029fad", movieName: "AB" },
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie Name is not valid. It must be at least three characters.",
  });
});

test("MovieNamePut returns 404 when movieId is not a valid ObjectId", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = { body: { movieId: "not-valid", movieName: "LOTR: Fellowship" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieNamePut returns 404 when movie is not found in database", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose(MovieModel).toReturn(null, "findOne");

  const req = {
    body: {
      movieId: "69efd1c1b2f8c7327f029fad",
      movieName: "LOTR: Fellowship",
    },
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieNamePut returns 500 when database error occurs", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    body: {
      movieId: "69efd1c1b2f8c7327f029fad",
      movieName: "LOTR: Fellowship",
    },
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
