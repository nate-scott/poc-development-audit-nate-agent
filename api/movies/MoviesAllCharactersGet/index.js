const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const movies = await MovieModel.find();
    const sorted = (movies || []).sort((a, b) => a.releaseYear - b.releaseYear);

    const seen = new Set();
    const characters = [];

    for (const movie of sorted) {
      for (const char of movie.characters) {
        if (!seen.has(char.name)) {
          seen.add(char.name);
          characters.push({ name: char.name, race: char.race });
        }
      }
    }

    return res.status(200).json(characters);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
