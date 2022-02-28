import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/tasks.mjs';
import auth from '../middleware/auth.mjs';

const tasksRouter = new express.Router();

tasksRouter.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// The find method grabs all the specified documents in a collection, but it won't populate its reference fields if there are any in the schema.
// You need use the populate method if you want to populate those fields.
tasksRouter.get('/tasks', auth, async (req, res) => {
  const filter = { owner: req.user._id };

  // Need to convert "req.query.completed" into a boolean value.
  // if (req.query.completed === 'true') filter.completed = true;
  // if (req.query.completed !== 'true') filter.completed = false;
  if (req.query.completed) {
    filter.completed = req.query.completed === 'true';
  }

  try {
    const tasks = await Task.find(filter);
    if (tasks.length === 0) return res.status(404).send('No task found.');
    res.send(tasks);
  } catch (e) {
    res.status(500).send();
  }
});

tasksRouter.get('/tasks/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(404).send('Invalid id.');

  try {
    // the first id is to make sure this task exists
    // the owner id is to test whether the logged user is the owner of that task.
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send('No task found.');
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

tasksRouter.patch('/tasks/:id', auth, async (req, res) => {
  const updateFields = Object.keys(req.body);
  // Feature improvement: Dynamically fetching fields from the Mongoose model
  const allowedUpdateFields = ['description', 'completed'];
  const isValidUpdate = updateFields.every((update) =>
    allowedUpdateFields.includes(update)
  );

  if (!isValidUpdate) return res.status(400).send('Invalid update field.');

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).send('No task found.');
    updateFields.forEach(
      (updateField) => (task[updateField] = req.body[updateField])
    );
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

tasksRouter.delete('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });
  try {
    if (!task) return res.status(404).send('No task found.');
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

export default tasksRouter;
