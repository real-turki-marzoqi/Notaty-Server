const mongoose = require('mongoose')

const noteSchema = mongoose.Schema(
    {
        title:{

            type:String,
            required:[true,'Note Title Is Required'],
            minlength:[2,'Too short note title'],
            maxlength:[30,'Too long note title'],
        },
        content:{
            type:String, 
            minlength:[2,'Too short note content'],
            maxlength:[100,'Too long note content'], 
        },
        isCompleted:{
            type:Boolean,
            default:false
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: [true, "note Must Belong To User"],
        }
    },
    {timestamps:true}
)

module.exports = mongoose.model('Note',noteSchema)