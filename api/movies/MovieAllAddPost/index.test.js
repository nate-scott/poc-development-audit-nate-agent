const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

const validId1 = "69efd1c1b2f8c7327f029fad";
const validId2 = "69efd1c1b2f8c7327f029fae";

const sampleMovies = [
  { _id: validId1, title: "The Lord of the Rings: The Fellowship of the Ring", releaseYear: 2001, characters: [{ name: "Frodo Baggins", race: "Hobbit" }] },
  { _id: validId2, title: "The Lord of the Rings: The Two Towers", releaseYear: 2002, characters: [{ name: "Aragorn", race: "Man" }] }
];

afterEach(() => {
  jest.restoreAllMocks();
});

test("MovieAllAddPost returns 200 with ADDED status when movie does not exist", async () => {
  const MovieModel = require("../models/movie");
  jest.spyOn(MovieModel, "findById").mockResolvedValue(null);
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

  const req = { body: [sampleMovies[0]] };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("ADDED");
  expect(body[0]._id).toBe(validId1);
});

test("MovieAllAddPost returns 200 with NOT ADDED status when movie already exists", async () => {
  const MovieModel = require("../models/movie");
  jest.spyOn(MovieModel, "findById").mockResolvedValue({ _id: validId1, title: "exists" });

  const req = { body: [sampleMovies[0]] };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("NOT ADDED");
});

test("MovieAllAddPost handles mixed ADDED and NOT ADDED in same request", async () => {
  const MovieModel = require("../models/movie");
  jest.spyOn(MovieModel, "findById")
    .mockResolvedValueOnce({ _id: validId1 }) // first movie exists
    .mockResolvedValueOnce(null);             // second does not
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

  const req = { body: sampleMovies };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("NOT ADDED");
  expect(body[1].status).toBe("ADDED");
});

test("MovieAllAddPost marks movie as NOT ADDED when _id is invalid", async () => {
  const MovieModel = require("../models/movie");

  const req = { body: [{ _id: "not-valid", title: "Bad Movie", releaseYear: 2000, characters: [] }] };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("NOT ADDED");
});

test("MovieAllAddPost returns 400 when body is not an array", async () => {
  const MovieModel = require("../models/movie");

  const req = { body: { _id: validId1, title: "Some Movie" } };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "Request body must be an array of movies." });
});

test("MovieAllAddPost returns 500 when database error occurs", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database error"));

  const req = { body: [sampleMovies[0]] };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
