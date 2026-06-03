const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

const movieId = "69efd1c1b2f8c7327f029fae";

afterEach(() => {
  jest.restoreAllMocks();
});

test("MovieCharactersDelete returns 204 when all characters are cleared", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = {
    characters: [{ name: "Frodo" }, { name: "Aragorn" }],
    save: jest.fn().mockResolvedValue(undefined)
  };
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = { params: { movieId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(mockMovie.characters).toEqual([]);
  expect(mockMovie.save).toHaveBeenCalled();
});

test("MovieCharactersDelete returns 404 when movieId is not a valid ObjectId", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = { params: { movieId: "not-valid" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersDelete returns 404 when movie is not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  jest.spyOn(MovieModel, "findById").mockResolvedValue(null);

  const req = { params: { movieId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersDelete returns 500 when database error occurs", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

  const req = { params: { movieId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
