const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON("../api/movies/_test/documents/movies-get-document.json");
const hobbit = movieDocuments.find(m => m.title === "The Hobbit: An Unexpected Journey");

afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

test("CharactersByMovieId returns array of character name objects for a valid movieId", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(hobbit, "findOne");

    const req = { params: { movieId: "69efd1c1b2f8c7327f029fb0" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(6);
    expect(body[0]).toEqual({ name: "Bilbo Baggins" });
    expect(body[2]).toEqual({ name: "Thorin Oakenshield" });
});

test("CharactersByMovieId returns only name field for each character", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(hobbit, "findOne");

    const req = { params: { movieId: "69efd1c1b2f8c7327f029fb0" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    const body = res.json.mock.calls[0][0];
    body.forEach(c => {
        expect(Object.keys(c)).toEqual(["name"]);
    });
});

test("CharactersByMovieId returns 404 when movieId is not a valid ObjectId", async () => {
    const MovieModel = require("../models/movie");

    const req = { params: { movieId: "not-a-valid-id" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharactersByMovieId returns 404 when movie is not found", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(null, "findOne");

    const req = { params: { movieId: "69efd1c1b2f8c7327f029fb0" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharactersByMovieId returns 500 when database error occurs", async () => {
    const MovieModel = require("../models/movie");
    MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = { params: { movieId: "69efd1c1b2f8c7327f029fb0" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
