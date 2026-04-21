const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');

mongoose.connect('mongodb+srv://StuEdu_db:EiC0J6TkfP8iBDKh@cluster0.rii861o.mongodb.net/STUEDU')
  .then(async () => {
    const feedbacks = await Feedback.find();
    console.log("ALL FEEDBACKS:", JSON.stringify(feedbacks, null, 2));

    process.exit(0);
  })
  .catch(console.error);
