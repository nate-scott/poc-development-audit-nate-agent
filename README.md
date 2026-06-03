# Middle Earth Movies API

A REST API for querying and managing a collection of Middle Earth movies and their characters, built with Node.js, Express, and Mongoose against Azure Cosmos DB (MongoDB-compatible).

## Setup

```bash
npm install
```

Run with Node v20:

```bash
node server.js
# Listens on http://localhost:3750
```

Run tests (Node v20 required):

```bash
~/.nvm/versions/node/v20.20.2/bin/node ./node_modules/.bin/jest --no-coverage
```

---

## API Reference

- [GET Methods](#get-methods)
- [POST Methods](#post-methods)
- [PUT Methods](#put-methods)
- [DELETE Methods](#delete-methods)

---

## GET Methods

### Get All Movies

**`GET /api/movies`**

Returns an array of all movies sorted by release year ascending.

**Response `200`**

```json
[
  {
    "_id": { "$oid": "69efd1c1b2f8c7327f029fad" },
    "title": "The Lord of the Rings: The Fellowship of the Ring",
    "releaseYear": 2001,
    "characters": [...]
  }
]
```

---

### Get Movie by ID

**`GET /api/movies/id/{id}`**

Returns a single movie object matching the given `_id`.

**Path Parameters**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the movie |

**Response `200`**

```json
{
  "_id": { "$oid": "69efd1c1b2f8c7327f029faf" },
  "title": "The Lord of the Rings: The Return of the King",
  "releaseYear": 2003,
  "characters": [...]
}
```

**Error Responses**

| Status | Body                            | Condition                       |
| ------ | ------------------------------- | ------------------------------- |
| `404`  | `{ "error": "No movie found" }` | No movie with that `_id` exists |

---

### Get Movies by Release Year Range

**`GET /api/movies/between/{startReleaseYear}/and/{endReleaseYear}`**

Returns an array of movies whose `releaseYear` falls between the start and end years (inclusive).

**Path Parameters**

| Parameter          | Type   | Required | Description                       |
| ------------------ | ------ | -------- | --------------------------------- |
| `startReleaseYear` | number | Yes      | Starting release year (2000–2020) |
| `endReleaseYear`   | number | Yes      | Ending release year (2000–2020)   |

**Response `200`** — array of matching movie objects.

**Error Responses**

| Status | Body                                                                 | Condition                          |
| ------ | -------------------------------------------------------------------- | ---------------------------------- |
| `406`  | `{ "error": "Starting release year must be a number" }`              | `startReleaseYear` is not a number |
| `406`  | `{ "error": "Starting release year must be between 2000 and 2020" }` | `startReleaseYear` out of range    |
| `406`  | `{ "error": "Ending release year must be a number" }`                | `endReleaseYear` is not a number   |
| `406`  | `{ "error": "Ending release year must be between 1977 and 2020" }`   | `endReleaseYear` out of range      |
| `404`  | `{ "error": "No movies found" }`                                     | No movies match the year range     |

---

### Get Movies by Character Name

**`GET /api/movies/character/{characterName}/name`**

Returns an array of objects with `_id`, `title`, and `releaseYear` for every movie containing a character with the given name.

**Path Parameters**

| Parameter       | Type   | Required | Description                              |
| --------------- | ------ | -------- | ---------------------------------------- |
| `characterName` | string | Yes      | Full name of the character (URL-encoded) |

**Response `200`**

```json
[
  {
    "_id": { "$oid": "..." },
    "title": "The Lord of the Rings: The Fellowship of the Ring",
    "releaseYear": 2001
  }
]
```

**Error Responses**

| Status | Body                                                        | Condition                        |
| ------ | ----------------------------------------------------------- | -------------------------------- |
| `404`  | `{ "error": "No movie(s) with this Character were found" }` | No movies contain that character |

---

### Get Movies by Race

**`GET /api/movies/by-race/{race}`**

Returns an array of movies containing at least one character of the given race. Each result includes only the characters matching the requested race.

**Path Parameters**

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| `race`    | string | Yes      | Race name (case-insensitive, e.g. `dwarf`) |

**Response `200`**

```json
[
  {
    "_id": { "$oid": "..." },
    "title": "The Lord of the Rings: The Fellowship of the Ring",
    "releaseYear": 2001,
    "characters": [{ "name": "Gimli", "race": "Dwarf" }]
  }
]
```

**Error Responses**

| Status | Body                                                                       | Condition                              |
| ------ | -------------------------------------------------------------------------- | -------------------------------------- |
| `404`  | `{ "error": "No movie(s) with characters of the <race> race were found" }` | No movies have characters of that race |

---

### Get All Characters (Unique, Ordered)

**`GET /api/movies/all/characters`**

Returns a flat, deduplicated array of `{ name, race }` objects for every character across all movies. Characters are ordered by the release year of the earliest movie they appear in. Each character appears only once.

**Response `200`**

```json
[
  { "name": "Frodo Baggins", "race": "Hobbit" },
  { "name": "Gandalf the Grey", "race": "Maia (Wizard)" }
]
```

---

### Get Characters by Movie ID

**`GET /api/movies/movie-id/{movieId}/characters`**

Returns an array of `{ name }` objects for every character in the specified movie.

**Path Parameters**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `movieId` | string | Yes      | The MongoDB ObjectId of the movie |

**Response `200`**

```json
[{ "name": "Bilbo Baggins" }, { "name": "Thorin Oakenshield" }]
```

**Error Responses**

| Status | Body                            | Condition                       |
| ------ | ------------------------------- | ------------------------------- |
| `404`  | `{ "error": "No movie found" }` | No movie with that `_id` exists |

---

### Get Movie and Character Info by IDs

**`GET /api/movies/movie-id/{movieId}/character-name/{characterName}`**

Returns the movie title, character name, and character race for a specific character in a specific movie. The character name lookup is case-insensitive.

**Path Parameters**

| Parameter       | Type   | Required | Description                             |
| --------------- | ------ | -------- | --------------------------------------- |
| `movieId`       | string | Yes      | The MongoDB ObjectId of the movie       |
| `characterName` | string | Yes      | The character's name (case-insensitive) |

**Response `200`**

```json
{
  "movie": "The Lord of the Rings: The Return of the King",
  "name": "Aragorn",
  "race": "Man"
}
```

**Error Responses**

| Status | Body                                | Condition                                |
| ------ | ----------------------------------- | ---------------------------------------- |
| `404`  | `{ "error": "No movie found" }`     | No movie with that `_id` exists          |
| `404`  | `{ "error": "No character found" }` | No character with that name in the movie |

---

### Get Characters by Race (with Movies)

**`GET /api/movies/by/race/{raceName}`**

Returns an array of characters of the given race, each with a list of movie titles they appear in. Each character is listed only once. Characters are ordered by the release year of the first movie they appear in.

**Path Parameters**

| Parameter  | Type   | Required | Description                              |
| ---------- | ------ | -------- | ---------------------------------------- |
| `raceName` | string | Yes      | Race name (case-insensitive, e.g. `man`) |

**Response `200`**

```json
[
  {
    "name": "Aragorn",
    "movies": [
      "The Lord of the Rings: The Fellowship of the Ring",
      "The Lord of the Rings: The Two Towers",
      "The Lord of the Rings: The Return of the King"
    ]
  }
]
```

**Error Responses**

| Status | Body                                                               | Condition                                     |
| ------ | ------------------------------------------------------------------ | --------------------------------------------- |
| `404`  | `{ "error": "No character with that race was found in a movie." }` | No characters of that race exist in any movie |

---

## POST Methods

### Add a Movie

**`POST /api/movie/add`**

Adds a new movie with no characters.

**Request Body**

```json
{
  "movieName": "The Lord of the Rings: The War of the Rohirrim",
  "releaseYear": 2024
}
```

| Field         | Type   | Required | Description                                |
| ------------- | ------ | -------- | ------------------------------------------ |
| `movieName`   | string | Yes      | Name of the movie (more than 3 characters) |
| `releaseYear` | number | Yes      | Release year (1990 to current year)        |

**Response `200`**

```json
{
  "_id": { "$oid": "..." },
  "name": "The Lord of the Rings: The War of the Rohirrim",
  "releaseYear": 2024,
  "characters": []
}
```

**Error Responses**

| Status | Body                                  | Condition                                                             |
| ------ | ------------------------------------- | --------------------------------------------------------------------- |
| `406`  | `{ "error": "No movie name found" }`  | `movieName` is missing                                                |
| `406`  | `{ "error": "Invalid movie name" }`   | `movieName` is 3 characters or fewer                                  |
| `406`  | `{ "error": "Invalid release year" }` | `releaseYear` is not a valid number between 1990 and the current year |

---

### Add a Character to a Movie (Body)

**`POST /api/movie/character/add`**

Adds a new character to an existing movie. Movie and character are specified via the request body.

**Request Body**

```json
{
  "movieId": "690b9436fb29d9d76b2a0dc2",
  "characterName": "Helm"
}
```

| Field           | Type   | Required | Description                                   |
| --------------- | ------ | -------- | --------------------------------------------- |
| `movieId`       | string | Yes      | The MongoDB ObjectId of the movie             |
| `characterName` | string | Yes      | Name of the character (at least 3 characters) |

**Response `200`** — the full updated movie object.

**Error Responses**

| Status | Body                                                                                | Condition                                  |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| `404`  | `{ "error": "No movie found" }`                                                     | No movie with that `movieId` exists        |
| `404`  | `{ "error": "No Main Character Name Provided" }`                                    | `characterName` is missing                 |
| `406`  | `{ "error": "Character Name is not valid. It must be at least three characters." }` | `characterName` is fewer than 3 characters |

---

### Add a Character to a Movie (Params)

**`POST /api/movie/{movie_id}/character/{mainCharacterName}/add`**

Adds a new character to an existing movie. Movie ID and character name are specified via URL parameters.

**Path Parameters**

| Parameter           | Type   | Required | Description                                   |
| ------------------- | ------ | -------- | --------------------------------------------- |
| `movie_id`          | string | Yes      | The MongoDB ObjectId of the movie             |
| `mainCharacterName` | string | Yes      | Name of the character (at least 3 characters) |

**Response `200`** — the full updated movie object.

**Error Responses**

| Status | Body                                                                                     | Condition                                      |
| ------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `404`  | `{ "error": "No movie found" }`                                                          | No movie with that `movie_id` exists           |
| `406`  | `{ "error": "Main Character Name is not valid. It must be at least three characters." }` | `mainCharacterName` is fewer than 3 characters |

---

### Add Character to Multiple Movies

**`POST /api/movie/add/characters`**

Adds a character to one or more movies. Movies where the character already exists (matched by `id`) are silently skipped. Movies not found in the database are silently skipped.

**Request Body**

```json
{
  "movies": ["69efd1c1b2f8c7327f029fae", "69efd1c1b2f8c7327f029fb1"],
  "characterToAdd": {
    "id": "6a15b1d58291c3d1a98c2ac1",
    "name": "Dave Jones",
    "race": "Man"
  }
}
```

| Field                 | Type     | Required | Description                             |
| --------------------- | -------- | -------- | --------------------------------------- |
| `movies`              | string[] | Yes      | Array of movie ObjectIds                |
| `characterToAdd.id`   | string   | Yes      | The ObjectId to assign to the character |
| `characterToAdd.name` | string   | Yes      | Character's name                        |
| `characterToAdd.race` | string   | Yes      | Character's race                        |

**Response `201`** — no body.

**Error Responses**

| Status | Body                                              | Condition                                           |
| ------ | ------------------------------------------------- | --------------------------------------------------- |
| `406`  | `{ "error": "Your character can not be added." }` | `characterToAdd` is missing `id`, `name`, or `race` |

---

### Bulk Add Movies

**`POST /api/movies/add/all`**

Accepts an array of movies. Each movie is added if its `_id` does not already exist; otherwise it is skipped. Returns the original input array with a `status` field appended to each movie.

**Request Body** — array of movie objects, each with `_id`, `title`, `releaseYear`, and `characters`.

**Response `200`**

```json
[
  {
    "_id": "69efd1c1b2f8c7327f029fad",
    "title": "The Lord of the Rings: The Fellowship of the Ring",
    "releaseYear": 2001,
    "characters": [...],
    "status": "ADDED"
  },
  {
    "_id": "69efd1c1b2f8c7327f029fae",
    "title": "The Lord of the Rings: The Two Towers",
    "releaseYear": 2002,
    "characters": [...],
    "status": "NOT ADDED"
  }
]
```

| Status value | Meaning                                  |
| ------------ | ---------------------------------------- |
| `ADDED`      | `_id` was not found; movie was inserted  |
| `NOT ADDED`  | `_id` already existed; movie was skipped |

**Error Responses**

| Status | Body                                                      | Condition                    |
| ------ | --------------------------------------------------------- | ---------------------------- |
| `400`  | `{ "error": "Request body must be an array of movies." }` | Request body is not an array |

---

## PUT Methods

### Update Movie Name

**`PUT /api/movie/name/update`**

Updates the title of a movie.

**Request Body**

```json
{
  "movieId": "69efd1c1b2f8c7327f029fad",
  "movieName": "LOTR: The Fellowship"
}
```

| Field       | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `movieId`   | string | Yes      | The MongoDB ObjectId of the movie |
| `movieName` | string | Yes      | New title (at least 3 characters) |

**Response `204`** — no body.

**Error Responses**

| Status | Body                                                                            | Condition                                         |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| `404`  | `{ "error": "No movie found" }`                                                 | No movie with that `movieId` exists               |
| `406`  | `{ "error": "Movie Name is not valid. It must be at least three characters." }` | `movieName` is missing or fewer than 3 characters |

---

### Update Character Name (Params)

**`PUT /api/movie/{movieId}/character/{characterId}/name/{characterName}/update`**

Updates the name of a character in a movie. All values are supplied via URL parameters.

**Path Parameters**

| Parameter       | Type   | Required | Description                                       |
| --------------- | ------ | -------- | ------------------------------------------------- |
| `movieId`       | string | Yes      | The MongoDB ObjectId of the movie                 |
| `characterId`   | string | Yes      | The MongoDB ObjectId of the character subdocument |
| `characterName` | string | Yes      | New character name (at least 3 characters)        |

**Response `204`** — no body.

**Error Responses**

| Status | Body                                                                                | Condition                                         |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `404`  | `{ "error": "Movie not found for id >" }`                                           | No movie with that `movieId` exists               |
| `404`  | `{ "error": "Character not found for id >" }`                                       | No character with that `characterId` in the movie |
| `406`  | `{ "error": "Character Name is not valid. It must be at least three characters." }` | `characterName` is fewer than 3 characters        |

---

### Update Character Name (Body)

**`PUT /api/movie/character/update`**

Updates the name of a character in a movie. All values are supplied via the request body.

**Request Body**

```json
{
  "movieId": "69efd1c1b2f8c7327f029fae",
  "characterId": "6a15b4f20a41fb7270ce2f3e",
  "name": "Smeagol"
}
```

| Field         | Type   | Required | Description                                       |
| ------------- | ------ | -------- | ------------------------------------------------- |
| `movieId`     | string | Yes      | The MongoDB ObjectId of the movie                 |
| `characterId` | string | Yes      | The MongoDB ObjectId of the character subdocument |
| `name`        | string | Yes      | New character name (at least 3 characters)        |

**Response `204`** — no body.

**Error Responses**

| Status | Body                                                                                | Condition                                         |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `404`  | `{ "error": "Movie not found for id >" }`                                           | No movie with that `movieId` exists               |
| `404`  | `{ "error": "Character not found for id >" }`                                       | No character with that `characterId` in the movie |
| `406`  | `{ "error": "Character Name is not valid. It must be at least three characters." }` | `name` is fewer than 3 characters                 |

---

### Update Movie Characters (Upsert)

**`PUT /api/movie/characters/update`**

Accepts a movie `_id` and a list of characters. For each character:

- If the `_id` does not exist in the movie → **ADDED**
- If the `_id` exists and `name`/`race` differs → **UPDATED**
- If the `_id`, `name`, and `race` all match → **NOT ADDED**

Returns the input with a `status` field on each character.

**Request Body**

```json
{
  "_id": "69efd1c1b2f8c7327f029fad",
  "characters": [
    {
      "_id": "6a1e03d0a7e982d8b6bc2a82",
      "name": "Frodo Baggins",
      "race": "Hobbit"
    },
    { "_id": "6a1e03dc3c961cfb2829658d", "name": "Aragorn 2", "race": "Man" }
  ]
}
```

**Response `200`**

```json
{
  "_id": "69efd1c1b2f8c7327f029fad",
  "characters": [
    {
      "_id": "6a1e03d0a7e982d8b6bc2a82",
      "name": "Frodo Baggins",
      "race": "Hobbit",
      "status": "ADDED"
    },
    {
      "_id": "6a1e03dc3c961cfb2829658d",
      "name": "Aragorn 2",
      "race": "Man",
      "status": "UPDATED"
    }
  ]
}
```

**Error Responses**

| Status | Body                            | Condition                       |
| ------ | ------------------------------- | ------------------------------- |
| `404`  | `{ "error": "No movie found" }` | No movie with that `_id` exists |

---

## DELETE Methods

### Delete a Character from a Movie

**`DELETE /api/movies/character/delete`**

Removes a single character from a movie. Both IDs are passed via the request body.

**Request Body**

```json
{
  "movieId": "69efd1c1b2f8c7327f029fad",
  "characterId": "6a15b1d58291c3d1a98c2ac1"
}
```

| Field         | Type   | Required | Description                                       |
| ------------- | ------ | -------- | ------------------------------------------------- |
| `movieId`     | string | Yes      | The MongoDB ObjectId of the movie                 |
| `characterId` | string | Yes      | The MongoDB ObjectId of the character subdocument |

**Response `204`** — no body.

**Error Responses**

| Status | Body                                | Condition                                                    |
| ------ | ----------------------------------- | ------------------------------------------------------------ |
| `404`  | `{ "error": "No movie found" }`     | `movieId` is invalid or movie not found                      |
| `404`  | `{ "error": "No Character found" }` | `characterId` is invalid or character not found in the movie |

---

### Delete All Characters from a Movie

**`DELETE /api/movie/{movieId}/characters/delete`**

Removes all characters from the specified movie. The movie document itself is retained.

**Path Parameters**

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `movieId` | string | Yes      | The MongoDB ObjectId of the movie |

**Response `204`** — no body.

**Error Responses**

| Status | Body                            | Condition                               |
| ------ | ------------------------------- | --------------------------------------- |
| `404`  | `{ "error": "No movie found" }` | `movieId` is invalid or movie not found |

---

### Delete All Movies

**`DELETE /api/movies/delete`**

Removes every movie from the database. No parameters required.

**Response `204`** — no body.
