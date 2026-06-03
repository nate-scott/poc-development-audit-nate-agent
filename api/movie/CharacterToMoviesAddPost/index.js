const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { movies, characterToAdd } = req.body || {};

    if (
      !characterToAdd ||
      !characterToAdd.id ||
      !characterToAdd.name ||
      !characterToAdd.race
    ) {
      return res.status(406).json({ error: "Your character can not be added." });
    }

    for (const movieId of (Array.isArray(movies) ? movies : [])) {
      if (!mongoose.Types.ObjectId.isValid(movieId)) continue;

      const movie = await MovieModel.findById(movieId);
      if (!movie) continue;

      const alreadyExists = movie.characters.some(
        c => c._id && c._id.toString() === characterToAdd.id
      );

      if (!alreadyExists) {
        const charId = mongoose.Types.ObjectId.isValid(characterToAdd.id)
          ? new mongoose.Types.ObjectId(characterToAdd.id)
          : new mongoose.Types.ObjectId();

        movie.characters.push({ _id: charId, name: characterToAdd.name, race: characterToAdd.race });
        await movie.save();
      }
    }

    return res.status(201).send();
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
