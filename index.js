'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./user-model');

const UserModel = mongoose.model('User');
const app = express();

mongoose.connect(process.env.DB_CONNECTION)
.catch(error => console.log(error));

app.use(bodyParser.json());

app.post('/users', async (req, res) => {
  const { name, amount } = req.body;
  const user = await UserModel.create({ name, amount });
  return res.json(user);
});

app.post('/users/transfer', async (req, res) => {
  const session = await mongoose.startSession();
  const now = new Date();
  try {
    const { fromId, toId, amount } = req.body;
    session.startTransaction();

    const fromUser = await UserModel.findOneAndUpdate(
      { _id: fromId },
      { 
        $inc: { amount: -amount },
        $set: { updated_at: now }, 
      },

      { session, new: true, lean: true }
    );

    if (fromUser.amount < 0) {
      throw new Error("Transfer can not be completed. Please check again.");
    }

    await UserModel.findByIdAndUpdate(
      { _id: toId },
      { 
        $inc: { amount },
        $set: { updated_at: now } 
      },
      { session, new: true, lean: true }
    );

    await session.commitTransaction();

    session.endSession();

    return res.json({ success: true, message: 'Transfer successed.' });
  }
  catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.json({ success: false, message: error.message || 'Transfer failed.' });
  }
});

app.listen(5000, () => console.log("App is running on port 5000"));