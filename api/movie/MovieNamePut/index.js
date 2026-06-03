const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { movieId, movieName } = req.body || {};

    if (!movieName || movieName.length < 3) {
      return res.status(406).json({ error: "Movie Name is not valid. It must be at least three characters." });
    }

    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(404).json({ error: "No movie found" });
    }

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    movie.title = movieName;
    await movie.save();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
