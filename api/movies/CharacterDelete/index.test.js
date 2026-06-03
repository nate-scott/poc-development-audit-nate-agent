const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

const movieId = "69efd1c1b2f8c7327f029fad";
const charId = "6a15b1d58291c3d1a98c2ac1";

afterEach(() => {
  jest.restoreAllMocks();
});

function makeMockMovie(characters = []) {
  const chars = characters.map(c => ({ ...c, _id: { toString: () => c._id } }));
  return {
    characters: chars,
    save: jest.fn().mockResolvedValue(undefined)
  };
}

test("CharacterDelete returns 204 when character is successfully deleted", async () => {
  const MovieModel = require("../models/movie");
  const mockMovie = makeMockMovie([{ _id: charId, name: "Frodo", race: "Hobbit" }]);
  // splice needs a real array-like, so use actual array with proper splice
  mockMovie.characters = [{ _id: { toString: () => charId }, name: "Frodo", race: "Hobbit" }];
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = { body: { movieId, characterId: charId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
});

test("CharacterDelete returns 404 when movieId is not a valid ObjectId", async () => {
  const MovieModel = require("../models/movie");

  const req = { body: { movieId: "not-valid", characterId: charId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterDelete returns 404 when movie is not found", async () => {
  const MovieModel = require("../models/movie");
  jest.spyOn(MovieModel, "findById").mockResolvedValue(null);

  const req = { body: { movieId, characterId: charId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterDelete returns 404 when characterId is not a valid ObjectId", async () => {
  const MovieModel = require("../models/movie");
  const mockMovie = makeMockMovie([]);
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = { body: { movieId, characterId: "not-valid" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No Character found" });
});

test("CharacterDelete returns 404 when character is not found in movie", async () => {
  const MovieModel = require("../models/movie");
  const differentCharId = "6a15b1d58291c3d1a98c2ac2";
  const mockMovie = makeMockMovie([{ _id: differentCharId, name: "Aragorn", race: "Man" }]);
  mockMovie.characters = [{ _id: { toString: () => differentCharId }, name: "Aragorn", race: "Man" }];
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = { body: { movieId, characterId: charId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No Character found" });
});

test("CharacterDelete returns 500 when database error occurs", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

  const req = { body: { movieId, characterId: charId } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
