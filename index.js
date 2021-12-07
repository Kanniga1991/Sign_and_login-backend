import express from "express";
import cors from "cors";
import mongo from "mongodb";
import dotenv from "dotenv";
import bcryptjs from "bcrypt";

const app = express();
dotenv.config();
const mongoClient = mongo.MongoClient;
const url = process.env.DB;
const port = process.env.PORT || 3001;

app.use(
	cors({
		origin: "*",
	})
);
app.use(express.json());

app.get("/data", async (req, res) => {
	try {
		res.send("login successful");
	} catch (error) {
		res.status(404).json({
			message: "Something went wrong",
			code: false,
		});
	}
});

app.post("/register", async function (req, res) {
	try {
		let client = await mongoClient.connect(url);

		let db = client.db("registration");

		let salt = bcryptjs.genSaltSync(10);

		let hash = bcryptjs.hashSync(req.body.pwd, salt);

		req.body.pwd = hash;

		let data = await db.collection("users").insertOne(req.body);

		await client.close();

		res.json({
			message: "User Registered",
			id: data._id,
			code: true,
		});
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong",
			code: false,
		});
	}
});

app.post("/signin", async function (req, res) {
	try {
		let client = await mongoClient.connect(url);

		let db = client.db("registration");

		let user = await db
			.collection("users")
			.findOne({ mail: req.body.mail });

		if (user) {
			let matchPassword = bcryptjs.compareSync(req.body.pwd, user.pwd);
			if (matchPassword) {
				
				res.json({
					message: true,
					code: true,
				});
				
			} else {
				res.status(404).json({
					message: "Username/Password is incorrect",
					code: false,
				});
			}
		} else {
			res.status(404).json({
				message: "Username/Password is incorrect",
				code: false,
			});
		}
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong",
			code: false,
		});
	}
});

app.put("/forgot", async function (req, res) {
	try {
		let client = await mongoClient.connect(url);

		let db = client.db("registration");

		let salt = bcryptjs.genSaltSync(10);

		let hash = bcryptjs.hashSync(req.body.pwd, salt);

		req.body.pwd = hash;

		let data = await db
			.collection("users")
			.findOneAndUpdate(
				{ mail: req.body.mail },
				{ $set: { pwd: req.body.pwd } }
			);

		await client.close();

		res.json({
			message: "Password Changed",
			code: true,
		});
	} catch (error) {
		res.status(500).json({
			message: "Something Went Wrong",
			code: false,
		});
	}
});

app.listen(port, () => {
	console.log("The Server is Listening in", port);
});
