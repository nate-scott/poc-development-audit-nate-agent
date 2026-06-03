const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { characterName } = req.params;

    if (!characterName) {
      return res.status(400).json({ error: "A character name is required" });
    }

    const movies = await MovieModel.find({ "characters.name": characterName });

    if (!movies || movies.length === 0) {
      return res.status(404).json({ error: "No movie(s) with this Character were found" });
    }

    const result = movies.map(m => ({
      _id: m._id,
      title: m.title,
      releaseYear: m.releaseYear
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
