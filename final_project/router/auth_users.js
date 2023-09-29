const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        username: username,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  if (review) {
    let selectedBook = books[isbn];
    const previousReviews = selectedBook.reviews;
    let tempObj = {};
    tempObj[req.user] = review;
    books[isbn].reviews = { ...previousReviews, ...tempObj };
    return res
      .status(200)
      .json({ message: "Review has been added/updated", book: books[isbn] });
  } else {
    return res.status(400).json({ message: "Please provide the Review" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let selectedBook = books[isbn];
  let previousReviews = selectedBook.reviews;
  delete previousReviews[req.user];
  books[isbn].reviews = { ...previousReviews };
  return res
    .status(200)
    .json({
      message: `Review has been deleted for the book isbn ${isbn}`,
      book: books[isbn],
    });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
