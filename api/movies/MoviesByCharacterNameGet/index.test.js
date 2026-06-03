const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON("../api/movies/_test/documents/movies-get-document.json");
const frodoMovies = movieDocuments.filter(m =>
    m.characters.some(c => c.name === "Frodo Baggins")
);

afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

test("MoviesByCharacterNameGet returns movies containing the character name", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(frodoMovies, "find");

    const req = { params: { characterName: "Frodo Baggins" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.length).toBe(3);
    expect(body[0].title).toBe("The Lord of the Rings: The Fellowship of the Ring");
    expect(body[0].releaseYear).toBe(2001);
    expect(body[0].characters).toBeUndefined();
});

test("MoviesByCharacterNameGet returns objects with only _id, title and releaseYear", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(frodoMovies, "find");

    const req = { params: { characterName: "Frodo Baggins" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    const body = res.json.mock.calls[0][0];
    body.forEach(movie => {
        expect(movie).toHaveProperty("title");
        expect(movie).toHaveProperty("releaseYear");
        expect(movie.characters).toBeUndefined();
    });
});

test("MoviesByCharacterNameGet returns 400 when no character name is provided", async () => {
    const MovieModel = require("../models/movie");

    const req = { params: {} };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "A character name is required" });
});

test("MoviesByCharacterNameGet returns 404 when no movies contain the character", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn([], "find");

    const req = { params: { characterName: "Luke Skywalker" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie(s) with this Character were found" });
});

test("MoviesByCharacterNameGet returns 500 when database error occurs", async () => {
    const MovieModel = require("../models/movie");
    MovieModel.find = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = { params: { characterName: "Frodo Baggins" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
