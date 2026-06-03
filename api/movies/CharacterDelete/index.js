const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { movieId, characterId } = req.body || {};

    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(404).json({ error: "No movie found" });
    }

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    if (!characterId || !mongoose.Types.ObjectId.isValid(characterId)) {
      return res.status(404).json({ error: "No Character found" });
    }

    const charIndex = movie.characters.findIndex(
      c => c._id && c._id.toString() === characterId
    );

    if (charIndex === -1) {
      return res.status(404).json({ error: "No Character found" });
    }

    movie.characters.splice(charIndex, 1);
    await movie.save();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
