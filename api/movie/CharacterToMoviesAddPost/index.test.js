const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON("../api/movies/_test/documents/movies-get-document.json");
const twoTowers = movieDocuments.find(m => m.title === "The Lord of the Rings: The Two Towers");

const charId = "6a15b1d58291c3d1a98c2ac1";

afterEach(() => {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

test("CharacterToMoviesAddPost returns 201 and adds character to valid movies", async () => {
    const MovieModel = require("../../movies/models/movie");
    mockingoose(MovieModel).toReturn(twoTowers, "findOne");
    jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

    const req = {
        body: {
            movies: ["69efd1c1b2f8c7327f029fae"],
            characterToAdd: { id: charId, name: "Dave Jones", race: "Man" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalled();
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing id", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = {
        body: {
            movies: ["69efd1c1b2f8c7327f029fae"],
            characterToAdd: { name: "Dave Jones", race: "Man" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Your character can not be added." });
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing name", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = {
        body: {
            movies: ["69efd1c1b2f8c7327f029fae"],
            characterToAdd: { id: charId, race: "Man" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Your character can not be added." });
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing race", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = {
        body: {
            movies: ["69efd1c1b2f8c7327f029fae"],
            characterToAdd: { id: charId, name: "Dave Jones" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Your character can not be added." });
});

test("CharacterToMoviesAddPost silently ignores invalid movie IDs", async () => {
    const MovieModel = require("../../movies/models/movie");
    const findByIdSpy = jest.spyOn(MovieModel, "findById");

    const req = {
        body: {
            movies: ["not-a-valid-id"],
            characterToAdd: { id: charId, name: "Dave Jones", race: "Man" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(findByIdSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
});

test("CharacterToMoviesAddPost silently ignores movies not found in database", async () => {
    const MovieModel = require("../../movies/models/movie");
    jest.spyOn(MovieModel, "findById").mockResolvedValue(null);

    const req = {
        body: {
            movies: ["69efd1c1b2f8c7327f029fae"],
            characterToAdd: { id: charId, name: "Dave Jones", race: "Man" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
});

test("CharacterToMoviesAddPost does not add duplicate character (same id)", async () => {
    const MovieModel = require("../../movies/models/movie");
    const saveSpy = jest.fn().mockResolvedValue(undefined);
    const mockMovieWithChar = {
        characters: [
            { _id: { toString: () => charId }, name: "Dave Jones", race: "Man" }
        ],
        save: saveSpy
    };
    jest.spyOn(MovieModel, "findById").mockResolvedValue(mockMovieWithChar);

    const req = {
        body: {
            movies: ["69efd1c1b2f8c7327f029fae"],
            characterToAdd: { id: charId, name: "Dave Jones", race: "Man" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(saveSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
});

test("CharacterToMoviesAddPost returns 500 when database error occurs", async () => {
    const MovieModel = require("../../movies/models/movie");
    MovieModel.findById = jest.fn().mockRejectedValue(new Error("Database connection failed"));

    const req = {
        body: {
            movies: ["69efd1c1b2f8c7327f029fae"],
            characterToAdd: { id: charId, name: "Dave Jones", race: "Man" }
        }
    };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
