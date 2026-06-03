const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { _id, characters } = req.body || {};

      if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).json({ error: "No movie found" });
      }

      const movie = await MovieModel.findById(_id);
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      const resultCharacters = [];

      for (const inChar of characters || []) {
        const existing = movie.characters.find(
          (c) => c._id && c._id.toString() === inChar._id,
        );

        if (!existing) {
          const charId = mongoose.Types.ObjectId.isValid(inChar._id)
            ? new mongoose.Types.ObjectId(inChar._id)
            : new mongoose.Types.ObjectId();
          movie.characters.push({
            _id: charId,
            name: inChar.name,
            race: inChar.race,
          });
          resultCharacters.push({ ...inChar, status: "ADDED" });
        } else if (
          existing.name === inChar.name &&
          existing.race === inChar.race
        ) {
          resultCharacters.push({ ...inChar, status: "NOT ADDED" });
        } else {
          existing.name = inChar.name;
          existing.race = inChar.race;
          resultCharacters.push({ ...inChar, status: "UPDATED" });
        }
      }

      await movie.save();

      return res.status(200).json({ _id, characters: resultCharacters });
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
