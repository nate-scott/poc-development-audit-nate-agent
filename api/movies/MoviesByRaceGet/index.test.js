const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON("../api/movies/_test/documents/movies-get-document.json");
const dwarfMovies = movieDocuments.filter(m =>
    m.characters.some(c => c.race.toLowerCase() === "dwarf")
);

afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

test("MoviesByRaceGet returns movies with matching characters filtered by race", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(dwarfMovies, "find");

    const req = { params: { race: "dwarf" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.length).toBe(4);
    body.forEach(movie => {
        expect(movie.characters.every(c => c.race.toLowerCase() === "dwarf")).toBe(true);
    });
});

test("MoviesByRaceGet returns objects with _id, title, releaseYear and filtered characters", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(dwarfMovies, "find");

    const req = { params: { race: "Dwarf" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    const body = res.json.mock.calls[0][0];
    body.forEach(movie => {
        expect(movie).toHaveProperty("title");
        expect(movie).toHaveProperty("releaseYear");
        expect(movie).toHaveProperty("characters");
        movie.characters.forEach(c => {
            expect(c.race.toLowerCase()).toBe("dwarf");
        });
    });
});

test("MoviesByRaceGet race matching is case-insensitive", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(dwarfMovies, "find");

    const req = { params: { race: "DWARF" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.length).toBe(4);
});

test("MoviesByRaceGet returns 400 when no race is provided", async () => {
    const MovieModel = require("../models/movie");

    const req = { params: {} };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "A race is required" });
});

test("MoviesByRaceGet returns 404 when no movies have characters of the given race", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn([], "find");

    const req = { params: { race: "oompa loompa" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie(s) with characters of the oompa loompa race were found" });
});

test("MoviesByRaceGet returns 500 when database error occurs", async () => {
    const MovieModel = require("../models/movie");
    MovieModel.find = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = { params: { race: "Dwarf" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
