const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const charId = "6a15b4f20a41fb7270ce2f3e";
const movieId = "69efd1c1b2f8c7327f029fae";

const mockMovie = {
    _id: movieId,
    title: "The Lord of the Rings: The Two Towers",
    releaseYear: 2002,
    characters: [
        { _id: charId, name: "Gollum", race: "Hobbit (Corrupted)" },
        { _id: "6a15b4f20a41fb7270ce2f3f", name: "Aragorn", race: "Man" }
    ]
};

afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

test("CharacterNameByParamsPut returns 204 when character name is updated successfully", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(mockMovie, "findOne");
    jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

    const req = { params: { movieId, characterId: charId, characterName: "Smeagol" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
});

test("CharacterNameByParamsPut returns 406 when characterName has less than three characters", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { params: { movieId, characterId: charId, characterName: "Al" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Character Name is not valid. It must be at least three characters." });
});

test("CharacterNameByParamsPut returns 404 when movieId is not a valid ObjectId", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { params: { movieId: "not-valid", characterId: charId, characterName: "Smeagol" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Movie not found for id >" });
});

test("CharacterNameByParamsPut returns 404 when movie is not found in database", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(null, "findOne");

    const req = { params: { movieId, characterId: charId, characterName: "Smeagol" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Movie not found for id >" });
});

test("CharacterNameByParamsPut returns 404 when character is not found in the movie", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(mockMovie, "findOne");

    const req = { params: { movieId, characterId: "000000000000000000000000", characterName: "Smeagol" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Character not found for id >" });
});

test("CharacterNameByParamsPut returns 500 when database error occurs", async () => {
    const MovieModel = require("../../movies/models/movie");
    MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = { params: { movieId, characterId: charId, characterName: "Smeagol" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
