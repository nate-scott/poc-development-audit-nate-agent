const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

afterEach(() => {
  jest.restoreAllMocks();
});

test("MoviesDelete returns 204 when all movies are deleted", async () => {
  const MovieModel = require("../models/movie");
  jest.spyOn(MovieModel, "deleteMany").mockResolvedValue({ deletedCount: 6 });

  const req = {};
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(MovieModel.deleteMany).toHaveBeenCalledWith({});
});

test("MoviesDelete returns 500 when database error occurs", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.deleteMany = jest.fn().mockRejectedValue(new Error("Database connection failed"));

  const req = {};
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
