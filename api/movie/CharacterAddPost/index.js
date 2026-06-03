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
    const { movieId, characterName } = req.body || {};

    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(404).json({ error: "No movie found" });
    }

    if (!characterName) {
      return res.status(404).json({ error: "No Main Character Name Provided" });
    }

    if (characterName.length < 3) {
      return res.status(406).json({ error: "Character Name is not valid. It must be at least three characters." });
    }

    const movie = await MovieModel.findById(movieId);

    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    movie.characters.push({ name: characterName });
    await movie.save();

    return res.status(200).json(toMovieResponse(movie));
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
