const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON("../api/movies/_test/documents/movies-get-document.json");
const returnOfTheKing = movieDocuments.find(m => m.title === "The Lord of the Rings: The Return of the King");

afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

test("NamesById returns movie, character name and race for a valid movieId and characterName", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");

    const req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Aragorn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.movie).toBe("The Lord of the Rings: The Return of the King");
    expect(body.name).toBe("Aragorn");
    expect(body.race).toBe("Man");
});

test("NamesById character name lookup is case-insensitive", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");

    const req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "aragorn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.name).toBe("Aragorn");
});

test("NamesById returns 404 when movieId is not a valid ObjectId", async () => {
    const MovieModel = require("../models/movie");

    const req = { params: { movieId: "not-a-valid-id", characterName: "Aragorn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("NamesById returns 404 when movie is not found", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(null, "findOne");

    const req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Aragorn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("NamesById returns 404 when character is not found in the movie", async () => {
    const MovieModel = require("../models/movie");
    mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");

    const req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Luke Skywalker" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No character found" });
});

test("NamesById returns 500 when database error occurs", async () => {
    const MovieModel = require("../models/movie");
    MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Aragorn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
