const Note = require('../Database/models/noteModel');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

exports.createNote = asyncHandler(async (req, res, next) => {
    const note = await Note.create({ title: req.body.title, content: req.body.content, user: req.user._id }).select('-__v -user');
    res.status(201).json({ data: note });
});

exports.getAllNotes = asyncHandler(async (req, res, next) => {
    const notes = await Note.find({ user: req.user._id }).select('-__v -user').sort({ createdAt: -1 });
    res.status(200).json({ data: notes });
});

exports.getSpecificNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).select('-__v -user');
    if (!note) {
        return next(new ApiError(`There is no Note found with this ID for the current user`, 404));
    }
    res.status(200).json({ data: note });
});

exports.updateSpecificNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { title: req.body.title, content: req.body.content },
        { new: true }
    ).select('-__v -user');

    if (!note) {
        return next(new ApiError(`There is no Note found with this ID for the current user`, 404));
    }

    res.status(200).json({ data: note });
});

exports.completionsStatus = asyncHandler(async (req, res, next) => {
    let note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
        return next(new ApiError(`There is no Note found with this ID for the current user`, 404));
    }

    note.isCompleted = !note.isCompleted;
    await note.save();

    res.status(200).json({ msg: "Completion status changed successfully" });
});

exports.deleteSpecificNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
        return next(new ApiError(`There is no Note found with this ID for the current user`, 404));
    }

    res.status(204).send();
});
