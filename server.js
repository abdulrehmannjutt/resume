const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const bcrypt = require("bcrypt");
const { error } = require("console");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const PORT = 7000;

// Get users
app.get("/users", (req, res) => {
  fs.readFile("./users.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.send("Internal Server Error");
    }
    const users = JSON.parse(data);
    res.json(users);
  });
});

// Create user
app.post("/createusers", upload.single("profilePicture"), (req, res) => {
  fs.readFile("./users.json", (err, data) => {
    let users = JSON.parse(data);

    const { firstName, lastName, email, password } = req.body;

    const emailExists = users.some((user) => user.email === req.body.email);

    if (emailExists) {
      return res
        .status(400)
        .send("This email is not avaliable use different email");
    }

    const newUserId = users.length > 0 ? users[users.length - 1].userId + 1 : 1;

    const userIdExists = users.some((user) => {
      user.userId === newUserId;
    });

    if (userIdExists) {
      return res.status(400).send("This user Id already exists");
    }

    bcrypt.hash(password, 10, function (err, hashed) {
      if (err) {
        console.error("error", err);
      }
      const newUser = {
        userId: newUserId,
        profilePicture: req.file
          ? `/uploads/${req.file.filename}`
          : `/uploads/default_picture.png`,
        firstName,
        lastName,
        email,
        password: hashed,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);

      fs.writeFile("./users.json", JSON.stringify(users), (err) => {
        if (err) {
          console.error(err);
          return res.send("Error saving user.");
        }
        res.json(newUser);
      });
    });
  });
});

// Update
app.patch("/users/:userId", upload.single("profilePicture"), (req, res) => {
  const userId = parseInt(req.params.userId);

  fs.readFile("./users.json", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading user data.");
    }

    let users;

    users = JSON.parse(data);

    const userIndex = users.findIndex((user) => user.userId === userId);
    if (userIndex === -1) {
      return res.send("User not found.");
    }

    const { firstName, lastName, email, password } = req.body;

    // console.log(users);

    const emailExists = users.some((user) => {
      if (user.userId === userId) {
        return false;
      } else {
        return user.email === req.body.email;
      }
    });

    if (emailExists) {
      return res
        .status(400)
        .send("This email is not avaliable use different email");
    }

    users[userIndex] = {
      userId: users[userIndex].userId,
      firstName,
      lastName,
      email,
      password,
      profilePicture: req.file
        ? `/uploads/${req.file.filename}`
        : users[userIndex].profilePicture,
      createdAt: users[userIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFile("./users.json", JSON.stringify(users), (err) => {
      if (err) {
        console.error(err);
        return res.send("Error saving user.");
      }
      res.send("User updated.");
    });
  });
});

// delete
app.delete("/users/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  fs.readFile("./users.json", (err, data) => {
    if (err) {
      console.error(err);
      return res.send("Error reading user data.");
    }

    let users;
    try {
      users = JSON.parse(data);
    } catch (e) {
      return res.send("Error parsing user data.");
    }

    const userIndex = users.findIndex((user) => user.userId === userId);
    if (userIndex === -1) {
      return res.send("User not found.");
    }

    users.splice(userIndex, 1);

    fs.writeFile("./users.json", JSON.stringify(users), (err) => {
      if (err) {
        console.error(err);
        return res.send("Error saving user.");
      }
      res.send("User deleted.");
    });
  });
});

app.delete("/deleteprofilepicture/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  fs.readFile("./users.json", (err, data) => {
    if (err) {
      console.error(err);
      return res.send("Error reading user data.");
    }

    let users;
    try {
      users = JSON.parse(data);
    } catch (e) {
      return res.send("Error parsing user data.");
    }

    const userIndex = users.findIndex((user) => user.userId === userId);
    if (userIndex === -1) {
      return res.send("User not found.");
    }

    users[userIndex].profilePicture = "/uploads/default_picture.png";
    fs.writeFile("./users.json", JSON.stringify(users), (err) => {
      if (err) {
        console.error(err);
        return res.send("Error saving user.");
      }
      res.send("User deleted.");
    });
  });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
