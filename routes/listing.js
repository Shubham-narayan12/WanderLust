const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../utils/middleware.js");
const multer = require("multer");
const { storage } = require("../coludConfig.js");
const upload = multer({ storage });

//middleware to protect from bad data.
const validation = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Listing route
router.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("index.ejs", { allListing });
  })
);

//Show Route
router.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const thisData = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if (!thisData) {
      req.flash("error", "Listing Does not Exist");
      res.redirect("/listings");
    }
    res.render("show.ejs", { thisData });
  })
);

//New Route
router.get("/newForm", isLoggedIn, (req, res) => {
  res.render("new.ejs");
});

//Getting Data From User Route
router.post(
  "/listings",
  upload.single("listing[image]"),
  validation,
  wrapAsync(async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

//getting Form For Edit
router.get(
  "/edit/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const newData = await Listing.findById(id);
    if (!newData) {
      req.flash("error", "Listing Does not Exist");
      res.redirect("/listings");
    }
    console.log(newData);
    res.render("edit.ejs", { newData });
  })
);

//Edit Route
router.patch(
  "/listings/:id/edit",
  isOwner,
  upload.single("listing[image]"),
  validation,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file != "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    req.flash("success", "Edit Successfull");
    res.redirect(`/listings/${id}`);
  })
);

//Delete route
router.delete(
  "/delete/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  })
);

//to Resever the hostel
router.get(
  "/reserve/:id", isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("reserve.ejs", { listing });
  })
);

//show booking status
router.get(
  "/booking",
  wrapAsync(async (req, res) => {
    res.render("bookingStatus.ejs")
  })
);

module.exports = router;
