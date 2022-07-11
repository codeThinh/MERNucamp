const express = require("express");
const favoriteRouter = express.Router();
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const _ = require("passport-local-mongoose");

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          Favorite.create({
            user: req.user._id,
            campsites: req.body,
          }).then((favorite) => {
            console.log("favorite Created ", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else {
          const favoritedCampsites = favorite.campsites.reduce(
            (acc, campsite) => {
              return { ...acc, [campsite._id]: true };
            },
            {}
          );

          const filteredCampsites = req.body.filter(
            (campsite) => !favoritedCampsites[campsite._id]
          );

          favorite.campsites = [
            ...favorite.campsites,
            ...filteredCampsites.map((obj) => obj._id),
          ];
          favorite.save().then(() => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end("You do not have any favorites to delete");
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.favoriteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        if (favorite.campsites.includes(req.params.campsiteId)) {
          res.end("That campsite is already in the list of favorites!");
        } else {
          favorite.campsites.push(req.params.campsiteId);
        }
        favorite.save().then(() => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        });
      } else {
        Favorite.create({
          user: req.user._id,
          campsites: [req.params.campsiteId],
        }).then((favorite) => {
          console.log("favorite Created ", favorite);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.favoriteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        if (favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites = favorite.campsites.filter(
            (campsite) => campsite.toString() !== req.params.campsiteId
          );
          favorite
            .save()
            .then((favorite) => {
              console.log("favorite Deleted ", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end("That campsite is not in the list of favorites");
        }
      } else {
        res.setHeader("Content-Type", "text/plain");
        res.end("There are no favorites to delete!");
      }
    });
  });

favoriteRouter.route("/:favoriteId");

module.exports = favoriteRouter;
