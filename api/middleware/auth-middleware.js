const Users = require("../model");

const validate = (req, res, next) => {
  try {
    if (!req.body.username || !req.body.username.trim() || !req.body.password || !req.body.password.trim()) {
      next({ status: 401, message: "username and password required" });
    } else {
      req.body.username = req.body.username.trim();
      next();
    }
  } catch (err) {
    next(err);
  }
};
const usernameExists = async (req, res, next) => {
  try {
    const user = await Users.findBy(req.body.username);

    if (!user) {
      next({ status: 401, message: "invalid credentials" });
    } else {
      req.user = user;
      next();
    }
  } catch (err) {
    next(err);
  }
};

const usernameTaken = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await Users.findBy(username);

    if (user) {
      next({ status: 422, message: "username taken" });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validate,
  usernameExists,
  usernameTaken,
};
