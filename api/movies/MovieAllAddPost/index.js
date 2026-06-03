const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const movies = req.body;

    if (!Array.isArray(movies)) {
      return res.status(400).json({ error: "Request body must be an array of movies." });
    }

    const result = [];

    for (const movie of movies) {
      const { _id } = movie;

      if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
        result.push({ ...movie, status: "NOT ADDED" });
        continue;
      }

      const existing = await MovieModel.findById(_id);

      if (existing) {
        result.push({ ...movie, status: "NOT ADDED" });
      } else {
        const newMovie = new MovieModel({
          _id: new mongoose.Types.ObjectId(_id),
          title: movie.title,
          releaseYear: movie.releaseYear,
          characters: movie.characters || []
        });
        await newMovie.save();
        result.push({ ...movie, status: "ADDED" });
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
