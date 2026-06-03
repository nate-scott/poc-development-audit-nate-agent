const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { movieId, characterId, characterName } = req.params;

    if (characterName.length < 3) {
      return res.status(406).json({ error: "Character Name is not valid. It must be at least three characters." });
    }

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(404).json({ error: "Movie not found for id >" });
    }

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found for id >" });
    }

    const character = movie.characters.find(
      c => c._id && c._id.toString() === characterId
    );
    if (!character) {
      return res.status(404).json({ error: "Character not found for id >" });
    }

    character.name = characterName;
    await movie.save();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
