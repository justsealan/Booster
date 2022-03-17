import { Router } from "express";
require("dotenv").config();

const router = Router();

const { Pool } = require("pg");
const dbUrl = process.env.DATABASE_URL;

const pool = new Pool({
	connectionString: dbUrl,
	connectionTimeoutMillis: 5000,
	ssl: { rejectUnauthorized: false },
});

///=================POST REQUESTS==================///

//  ADD AN ENERGISER
router.post("/energiser", function (req, res) {
	const energiserTitle = req.body.title;
	const energiserDescription = req.body.description;
	const energiserInstructions = req.body.playing_instructions;
	const energiserLink = req.body.link;

	// Basic Url testing. it should be starting with "http" or "https" following://
	const validateUrl = /^(http|https):\/\/[^ "]+$/.test(energiserLink);
	if (energiserLink) {
		validateUrl;
		if (!validateUrl) {
			return res.status(400).send({ msg: "Please enter the correct URL !" });
		}
	} else {
		res.status(200);
	}

	if (!energiserTitle || !energiserDescription) {
		return res
			.status(400)
			.send({ msg: "Please fill in all the required fields" });
	}
	pool
		.query("SELECT title FROM energisers WHERE title = $1", [energiserTitle])
		.then((result) => {
			if (result.rows.length > 0) {
				return res
					.status(400)
					.send({ msg: `Energiser name: ${energiserTitle} already exist` });
			} else {

				let query = `INSERT INTO energisers(title, description, playing_instructions, link) VALUES ($1,$2,$3,$4)`;
				let params = [
					energiserTitle,
					energiserDescription,
					energiserInstructions,
					energiserLink,
				];
				pool
					.query(query, params)
					.then(() =>
						res.send({ msg: `Energiser: ${energiserTitle} added Successfully` })
					)
					.catch((error) => {
						console.error(error);
						res.status(500).json(error);
					});
			}
		});
});

///==================GET REQUESTS===================///

// GET ALL THE Energisers
router.get("/energisers", function (req, res) {
	pool
		.query(
			"SELECT id, title, description, playing_instructions, link, likes, dislikes FROM energisers"
		)
		.then((result) => res.json(result.rows))
		.catch((error) => {
			console.error(error);
			res.status(500).json(error);
		});
});

// GET ENERGISERS USING SEARCH
// Tested with: http://localhost:3100/api/energisers/search?term=test
router.get("/energisers/search", function (req, res) {
	let searchQuery = req.query.term;

	if (searchQuery.length) {
		pool
			.query(
				`SELECT id, title, description, playing_instructions, link, likes, dislikes  FROM energisers WHERE LOWER(title) LIKE LOWER('%${searchQuery}%') ORDER BY title`
			)
			.then((result) => res.json(result.rows))
			.catch((error) => {
				console.error(error);
				res.status(500).json(error);
			});
	} else {
		res.status(404).send({ msg: "No Such Energisers found" });
	}
});

// GET ENERGISER WITH AN ID
// Tested with: http://localhost:3100/api/energisers/3
router.get("/energiser/:energiserId", function (req, res) {
	let energiserId = req.params.energiserId;
	let query = `SELECT id, title, description, playing_instructions, link, likes, dislikes  FROM energisers WHERE id = $1`;
	const params = [energiserId];

	pool
		.query(query, params)
		.then((result) => {
			if (result.rows.length == 0) {
				return res
					.status(404)
					.send({ msg: `Energiser: ${energiserId} doesn't exist` });
			}
			res.json(result.rows);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json(error);
		});
});

///==================PUT REQUESTS===================///

// UPDATE AN ENERGISER's DETAILS

router.put("/energiser/:energiserId", function (req, res) {
	let energiserId = req.params.energiserId;
	const energiserNewTitle = req.body.title;
	const energiserNewDescription = req.body.description;
	const energiserNewInstructions = req.body.playing_instructions;
	const energiserNewLink = req.body.link;

	// Checking if the energiser with Id entered exist or not
	pool
		.query("SELECT id FROM energisers WHERE id = $1", [energiserId])
		.then((result) => {
			if (result.rows.length == 0) {
				return res
					.status(404)
					.send({ msg: `Energiser: ${energiserId} doesn't exist` });
			}
		});

	// First we select the energiser then we can update the changes else we will can return the old info
	pool
		.query(
			`SELECT id, title, description, playing_instructions, link  FROM energisers WHERE id = $1`,
			[energiserId]
		)
		.then((result) => {
			let originalEnergiser = result.rows[0];
			let updateQuery = `UPDATE energisers
        SET title = $2, description  = $3, playing_instructions = $4, link = $5
        WHERE id = $1`;
			let params = [
				energiserId,
				energiserNewTitle || originalEnergiser.title,
				energiserNewDescription || originalEnergiser.description,
				energiserNewInstructions || originalEnergiser.playing_instructions,
				energiserNewLink || originalEnergiser.link,
			];

			pool
				.query(updateQuery, params)
				.then(() => res.send(`Energiser:${energiserId} updated!`))
				.catch((error) => {
					console.error(error);
					res.status(500).json(error);
				});
		});
});

///==================DELETE REQUESTS===================///

router.delete("/energiser/:energiserId", (req, res) => {
	const energiserId = req.params.energiserId;
	pool
		.query("SELECT id FROM energisers WHERE id = $1", [energiserId])
		.then((result) => {
			if (result.rows.length === 0) {
				return res
					.status(400)
					.send({ msg: `Energiser:${energiserId} does not exist` })
					.catch((error) => {
						console.log(error);
						res.status(500).json(error);
					});
			} else {
				return pool
					.query("DELETE FROM energisers WHERE id = $1", [energiserId])
					.then(() => res.send({ msg: `Energiser:${energiserId} Deleted!` }))
					.catch((error) => {
						console.log(error);
						res.status(500).json(error);
					});
			}
		});
});

export default router;
