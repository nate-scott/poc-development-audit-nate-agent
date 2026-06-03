const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

function toMovieResponse(movie) {
  return {
    _id: movie._id,
    name: movie.title,
    releaseYear: movie.releaseYear,
    characters: movie.characters
  };
}

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { movieName, releaseYear } = req.body || {};

    if (!movieName) {
      return res.status(406).json({ error: "No movie name found" });
    }

    if (movieName.length <= 3) {
      return res.status(406).json({ error: "Invalid movie name" });
    }

    const year = Number(releaseYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1990 || year > currentYear) {
      return res.status(406).json({ error: "Invalid release year" });
    }

    const newMovie = new MovieModel({
      _id: new mongoose.Types.ObjectId(),
      title: movieName,
      releaseYear: year,
      characters: []
    });

    await newMovie.save();

    return res.status(200).json(toMovieResponse(newMovie));
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
