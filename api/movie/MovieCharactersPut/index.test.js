const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

const movieId = "69efd1c1b2f8c7327f029fad";
const charId1 = "6a1e03d0a7e982d8b6bc2a82";
const charId2 = "6a1e03d6c1b6526312a05de1";

afterEach(() => {
  jest.restoreAllMocks();
});

function makeMockMovie(characters) {
  return {
    characters,
    save: jest.fn().mockResolvedValue(undefined)
  };
}

test("MovieCharactersPut returns 200 with ADDED status for new characters", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = makeMockMovie([]);
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = {
    body: {
      _id: movieId,
      characters: [{ _id: charId1, name: "Frodo Baggins", race: "Hobbit" }]
    }
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("ADDED");
});

test("MovieCharactersPut returns 200 with NOT ADDED status when character is unchanged", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = makeMockMovie([
    { _id: { toString: () => charId2 }, name: "Gandalf the Grey", race: "Maia (Wizard)" }
  ]);
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = {
    body: {
      _id: movieId,
      characters: [{ _id: charId2, name: "Gandalf the Grey", race: "Maia (Wizard)" }]
    }
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("NOT ADDED");
});

test("MovieCharactersPut returns 200 with UPDATED status when character name or race changes", async () => {
  const MovieModel = require("../../movies/models/movie");
  const existingChar = { _id: { toString: () => charId1 }, name: "Aragorn", race: "Man" };
  const mockMovie = makeMockMovie([existingChar]);
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = {
    body: {
      _id: movieId,
      characters: [{ _id: charId1, name: "Aragorn 2", race: "Man" }]
    }
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("UPDATED");
});

test("MovieCharactersPut handles mixed ADDED, UPDATED and NOT ADDED in same request", async () => {
  const MovieModel = require("../../movies/models/movie");
  const existingChar = { _id: { toString: () => charId2 }, name: "Gandalf the Grey", race: "Maia (Wizard)" };
  const mockMovie = makeMockMovie([existingChar]);
  jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovie);

  const req = {
    body: {
      _id: movieId,
      characters: [
        { _id: charId1, name: "Frodo Baggins", race: "Hobbit" },       // ADDED (new)
        { _id: charId2, name: "Gandalf the Grey", race: "Maia (Wizard)" } // NOT ADDED (no change)
      ]
    }
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("ADDED");
  expect(body.characters[1].status).toBe("NOT ADDED");
});

test("MovieCharactersPut returns 404 when movieId is not a valid ObjectId", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = { body: { _id: "not-valid", characters: [] } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersPut returns 404 when movie is not found in database", async () => {
  const MovieModel = require("../../movies/models/movie");
  jest.spyOn(MovieModel, "findById").mockResolvedValue(null);

  const req = { body: { _id: movieId, characters: [] } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersPut returns 500 when database error occurs", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

  const req = { body: { _id: movieId, characters: [] } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
