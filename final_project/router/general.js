const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const filterBooksBy = (key, query) => {
  return new Promise((resolve, reject) => {
    try {
      let res = [];
      for (let i in books) {
        const book = books[i];
        if (book[key] == query) {
          res.push({ isbn: i, ...book });
        }
      }
      setTimeout(() => {
        resolve(res);
      }, 1000);
    } catch (e) {
      reject("Exception Occured");
    }
  });
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({
        message: "Customer successfully registred. Now you can login",
      });
    } else {
      return res.status(404).json({ message: "Customer already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register Customer." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const getAllBooks = new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve(books);
      }, 1000);
    } catch (e) {
      reject("Exception Occured");
    }
  });
  getAllBooks.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          resolve(books[isbn]);
        }, 1000);
      } catch (e) {
        reject("Exception Occured");
      }
    });
  };
  const isbn = req.params.isbn;
  getBookByISBN(isbn).then((book) => {
    res.send(JSON.stringify(book, null, 4));
  });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const authorVal = req.params.author;
  filterBooksBy("author", authorVal).then((books) => {
    res.status(200).json({ booksByAuthor: books });
  });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const titleVal = req.params.title;
  filterBooksBy("title", titleVal).then((books) => {
    res.status(200).json({ booksByTitle: books });
  });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
