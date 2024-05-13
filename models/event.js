import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: String,
    date: Date,
    assignTo: String,
    note: String,
    comments: [
        {
            commentId: {
                type: mongoose.Schema.ObjectId,
            },
            name: String,
            comment: String
        }
    ]
})

export default mongoose.model("events", schema);