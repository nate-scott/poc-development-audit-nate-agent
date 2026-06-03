const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { raceName } = req.params;
      const movies = await MovieModel.find();
      const sorted = (movies || []).sort(
        (a, b) => a.releaseYear - b.releaseYear,
      );

      const characterMap = new Map();

      for (const movie of sorted) {
        for (const char of movie.characters) {
          if (char.race.toLowerCase() === raceName.toLowerCase()) {
            if (!characterMap.has(char.name)) {
              characterMap.set(char.name, { name: char.name, movies: [] });
            }
            characterMap.get(char.name).movies.push(movie.title);
          }
        }
      }

      if (characterMap.size === 0) {
        return res
          .status(404)
          .json({ error: "No character with that race was found in a movie." });
      }

      return res.status(200).json(Array.from(characterMap.values()));
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
