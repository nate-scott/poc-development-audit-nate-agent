const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { startReleaseYear, endReleaseYear } = req.params;

    const start = Number(startReleaseYear);
    if (isNaN(start)) {
      return res.status(406).json({ error: "Starting release year must be a number" });
    }
    if (start < 2000 || start > 2020) {
      return res.status(406).json({ error: "Starting release year must be between 2000 and 2020" });
    }

    const end = Number(endReleaseYear);
    if (isNaN(end)) {
      return res.status(406).json({ error: "Ending release year must be a number" });
    }
    if (end < 2000 || end > 2020) {
      return res.status(406).json({ error: "Ending release year must be between 1977 and 2020" });
    }

    const movies = await MovieModel.find({ releaseYear: { $gte: start, $lte: end } });

    if (!movies || movies.length === 0) {
      return res.status(404).json({ error: "No movies found" });
    }

    const sorted = movies.sort((a, b) => a.releaseYear - b.releaseYear);
    return res.status(200).json(sorted);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
