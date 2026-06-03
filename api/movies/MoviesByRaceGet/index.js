const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { race } = req.params;

    if (!race) {
      return res.status(400).json({ error: "A race is required" });
    }

    const raceRegex = new RegExp(`^${race}$`, "i");
    const movies = await MovieModel.find({ "characters.race": raceRegex });

    if (!movies || movies.length === 0) {
      return res.status(404).json({ error: `No movie(s) with characters of the ${race} race were found` });
    }

    const result = movies.map(m => ({
      _id: m._id,
      title: m.title,
      releaseYear: m.releaseYear,
      characters: m.characters.filter(c => raceRegex.test(c.race))
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
