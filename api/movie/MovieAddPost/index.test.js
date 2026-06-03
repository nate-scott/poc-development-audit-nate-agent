const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

afterEach(() => {
    jest.restoreAllMocks();
});

test("MovieAddPost returns 200 with new movie when valid data is provided", async () => {
    const MovieModel = require("../../movies/models/movie");
    jest.spyOn(MovieModel.prototype, "save").mockResolvedValue(undefined);

    const req = { body: { movieName: "The Lord of the Rings: The War of the Rohirrim", releaseYear: 2020 } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.name).toBe("The Lord of the Rings: The War of the Rohirrim");
    expect(body.releaseYear).toBe(2020);
    expect(body.characters).toEqual([]);
    expect(body._id).toBeDefined();
});

test("MovieAddPost returns 406 when movieName is missing", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { body: { releaseYear: 2020 } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie name found" });
});

test("MovieAddPost returns 406 when movieName has three characters or less", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { body: { movieName: "The", releaseYear: 2020 } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid movie name" });
});

test("MovieAddPost returns 406 when releaseYear is not a number", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { body: { movieName: "The Hobbit: A New Adventure", releaseYear: "abc" } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is before 1990", async () => {
    const MovieModel = require("../../movies/models/movie");

    const req = { body: { movieName: "The Hobbit: A New Adventure", releaseYear: 1989 } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is after the current year", async () => {
    const MovieModel = require("../../movies/models/movie");
    const futureYear = new Date().getFullYear() + 1;

    const req = { body: { movieName: "The Hobbit: A New Adventure", releaseYear: futureYear } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 500 when database error occurs", async () => {
    const MovieModel = require("../../movies/models/movie");
    jest.spyOn(MovieModel.prototype, "save").mockRejectedValue(new Error("Database connection failed"));

    const req = { body: { movieName: "The Hobbit: A New Adventure", releaseYear: 2020 } };
    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
