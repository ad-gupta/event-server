import express from "express";
import dotenv from "dotenv";
import Events from "./models/event.js";
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();

const app = express();

const connectToDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, { dbName: "event-management" })
    .then(() => {
      console.log("connected to db");
    })
    .catch((err) => console.log(err));
};

app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());

app.get("/getAllEvents", async (req, res) => {
  const events = await Events.find();
  res.status(200).json(events);
});

app.post("/book", async (req, res) => {
  const { name, date, assignTo, note } = req.body;

  const newEvent = await Events.create({
    name,
    date,
    assignTo,
    note,
  });

  res.status(201).json(newEvent);
});

app.get("/get/:id", async (req, res) => {
  const event = await Events.findById(req.params.id);

  res.status(200).json({
    message: event
  })
})

app.put("/update-event/:id", async (req, res) => {
  try {
    let event = await Events.findById(req.params.id);

    if (!event) return res.status(404).json({ error: "no event found" });

    event = await Events.findByIdAndUpdate(event._id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.json(event).status(200);
  } catch (error) {
    return res.status(500).send("something went wrong!");
  }
});

app.delete("/delete-event/:id", async (req, res) => {
  try {
    let event = await Events.findById(req.params.id);

    if (!event) return res.status(404).json({ error: "no event found" });

    event = await Events.findByIdAndDelete(event._id);
    res.json(event).status(200);
  } catch (error) {
    return res.status(500).send("something went wrong!");
  }
});

app.post("/add-comment/:id", async (req, res) => {
  try {
    const { name, comment } = req.body;
    let event = await Events.findById(req.params.id);

    event.comments.push({
      name,
      comment,
    });
    await event.save({ validateBeforeSave: false });

    res.status(201).json({
      message: "comment added",
    });
  } catch (error) {
    res.status(500).json("something went wrong");
  }
});

app.put("/update-comment/:id", async (req, res) => {
  const { commentId, comment } = req.body;

  let event = await Events.findById(req.params.id);

  if (!event) return res.status(404).json({ error: "no event found" });

  event.comments.forEach((cmt) => {
    if (cmt._id.toString() === commentId.toString()) cmt.comment = comment;
  });
  await event.save();

  res.status(200).json({ message: "updated" });
});

app.delete("/delete-comment/:id", async (req, res) => {
    const { commentId } = req.body;
  
    try {
      let event = await Events.findById(req.params.id);
  
      if (!event) return res.status(404).json({ error: "No event found" });
      event.comments = event.comments.filter((cmt) => {
        return cmt._id.toString() !== commentId.toString();
      });
  
      await event.save();
  
      res.status(200).json({ message: "Deleted" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

const port = process.env.PORT;
app.listen(port, () => {
  connectToDB();
  console.log(`server is running on port ${port}`);
});
