const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON("../api/movies/_test/documents/movies-get-document.json");
const fellowship = movieDocuments.find(m => m.title === "The Lord of the Rings: The Fellowship of the Ring");

afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

test("CharacterByParamsAddPost returns 200 with updated movie when valid params are provided", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(fellowship, "findOne");
    jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

    const req = { params: { movie_id: "69efd1c1b2f8c7327f029fad", mainCharacterName: "Olwyn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.name).toBe("The Lord of the Rings: The Fellowship of the Ring");
    const addedChar = body.characters.find(c => c.name === "Olwyn");
    expect(addedChar).toBeDefined();
});

test("CharacterByParamsAddPost returns 404 when movie_id is not a valid ObjectId", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { params: { movie_id: "not-a-valid-id", mainCharacterName: "Olwyn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterByParamsAddPost returns 406 when mainCharacterName has less than three characters", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { params: { movie_id: "69efd1c1b2f8c7327f029fad", mainCharacterName: "Al" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Main Character Name is not valid. It must be at least three characters." });
});

test("CharacterByParamsAddPost returns 404 when movie is not found in database", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(null, "findOne");

    const req = { params: { movie_id: "69efd1c1b2f8c7327f029fad", mainCharacterName: "Olwyn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterByParamsAddPost returns 500 when database error occurs", async () => {
    const MovieModel = require("../../movies/models/movie");
    MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = { params: { movie_id: "69efd1c1b2f8c7327f029fad", mainCharacterName: "Olwyn" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
