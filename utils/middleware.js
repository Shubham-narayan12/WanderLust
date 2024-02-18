const Listing = require("../models/listing");
const Review = require("../models/review")

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "logged in first");
    return res.redirect("/login");
  }
  next();
};


//login k baad direct same page pe le jayega.
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.crntUser._id)) {
    req.flash("error", "Permission Denied");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//<% if(crntUser && crntUser._id.equals(thisData.owner._id)) { %>

module.exports.isReviewAuthor = async (req, res, next) => {
    let { reviewid,id } = req.params;
    let review= await Review.findById(reviewid);
    if (!review.author.equals(res.locals.crntUser._id)) {
      req.flash("error", "Permission Denied");
      return res.redirect(`/listings/${id}`);
    }
    next();
  };
