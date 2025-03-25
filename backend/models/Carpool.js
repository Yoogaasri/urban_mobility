const mongoose = require('mongoose');

const carpoolSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String,  },
    type:{type:String,required: true},
    seatsAvailable: { type: Number, required: true },
    date: { type: Date, required: true }, // Store the date
    time: { type: String, required: true }, // Store the time as a string (e.g., "10:00 AM")
    price:{
      type:Number, required:true
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    womendriver:{type:Boolean}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Carpool', carpoolSchema);
