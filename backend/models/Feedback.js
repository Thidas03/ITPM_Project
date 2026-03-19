const mongoos = require('mongoose')

const FeedbackSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Scema.types.ObjectId,
      ref: 'Session',
      required: true,
      required: true,
    },
    studentId: {
      type: mongoose.Scema.types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutorId: {
      type: mongoose.Scema.types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating']
      min: 1,
      max: 5,  
    },
   reviewText: {
      tyoe: String,
      trim: true,
      maxlength: 1000,
      defualt: '',
   },
   status: {
     type: String,
     enum: ['approved', 'hidden', 'flagged'],
     defualt: 'approved',
   },
   createAt: {
     type: Date,
     defualt: Date.now,
   },
  },
     {timestamps: true,
     }
);

module.exports = mongoose.model('Feedbacj', FeedbackSchema);
