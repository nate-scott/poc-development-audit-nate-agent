const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { movieId } = req.params;

    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(404).json({ error: "No movie found" });
    }

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    movie.characters = [];
    await movie.save();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
