const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
  title: {
    type: String,
    require: true,
  },

  description: String,
  image: {
     filename: String,
     url: String,
  },
  price: {
    type: Number,
  },
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref:"User",
  }
});

//post-middleware to also delete the review when listing is deleted.
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing.reviews.length){
    await Review.deleteMany({_id :{$in:listing.reviews}})
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
