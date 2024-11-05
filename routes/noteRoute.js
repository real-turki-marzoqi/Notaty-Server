
const express = require('express')
const {createNote,getAllNotes,getSpecificNote,updateSpecificNote,completionsStatus ,deleteSpecificNote} = require('../Services/noteServices')
const {createNoteValidator,checkIdValidator,updateNoteValidator} =require('../utils/Validators/noteValidators')

const {protect} = require('../Services/authServices')

const router = express.Router()

router
.route('/')
.post(protect,createNoteValidator,createNote)
.get(protect,getAllNotes)

router
.route('/:id')
.get(protect,checkIdValidator,getSpecificNote)
.put(protect,updateNoteValidator,updateSpecificNote)
.delete(protect,checkIdValidator,deleteSpecificNote)

router
.route('/changeStauts/:id')
.put(protect,checkIdValidator,completionsStatus)

module.exports = router