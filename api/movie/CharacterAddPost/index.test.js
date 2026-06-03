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

test("CharacterAddPost returns 200 with updated movie when valid data is provided", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");
    jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

    const req = { body: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Helm Hammerhand" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.name).toBe("The Lord of the Rings: The Return of the King");
    expect(body.releaseYear).toBe(2003);
    const addedChar = body.characters.find(c => c.name === "Helm Hammerhand");
    expect(addedChar).toBeDefined();
});

test("CharacterAddPost returns 404 when movieId is missing or invalid", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { body: { characterName: "Helm Hammerhand" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterAddPost returns 404 when movie is not found in database", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(null, "findOne");

    const req = { body: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Helm Hammerhand" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterAddPost returns 404 when characterName is missing", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { body: { movieId: "69efd1c1b2f8c7327f029faf" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No Main Character Name Provided" });
});

test("CharacterAddPost returns 406 when characterName has less than three characters", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { body: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Al" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Character Name is not valid. It must be at least three characters." });
});

test("CharacterAddPost returns 500 when database error occurs", async () => {
    const MovieModel = require("../../movies/models/movie");
    MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = { body: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Helm Hammerhand" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
