import express from 'express';
import mongoose from 'mongoose';
import User from '../models/users.mjs';

const usersRouter = new express.Router();

// https://httpstatuses.com/
usersRouter.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

usersRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

// The findById method will throw an error if the id you pass it is improperly formatted so you should see a 500 error most of the time.
// However, if you pass in an id that is validly formatted, but does not exist in the database then you will get the 404 sent back.
usersRouter.get('/users/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(404).send('Invalid id.');

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('No user found.');
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

usersRouter.patch('/users/:id', async (req, res) => {
  const updateFields = Object.keys(req.body);
  // Feature improvement: Dynamically fetching fields from the Mongoose model
  const allowedUpdateFields = ['name', 'age', 'email', 'password'];
  const isValidUpdateField = updateFields.every((update) =>
    allowedUpdateFields.includes(update)
  );

  if (!isValidUpdateField) return res.status(400).send('Invalid update field.');

  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(404).send('Invalid id.');

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).send('No user found.');
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

usersRouter.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('No user found.');
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

export default usersRouter;
