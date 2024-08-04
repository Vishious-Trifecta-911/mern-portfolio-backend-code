import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Timeline } from "../models/timelineSchema.js";

export const addTimelineEvent = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body;
  const timelineEvent = await Timeline.create({
    title,
    description,
    timeline: { from, to },
  });

  res.status(200).json({
    success: true,
    message: "Timeline event added successfully",
    timelineEvent,
  });
});

export const getAllTimelineEvents = catchAsyncErrors(async (req, res, next) => {
  const timelineEvents = await Timeline.find();

  res.status(200).json({ success: true, timelineEvents });
});

export const deleteTimelineEvent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const timeline = await Timeline.findById(id);

  if (!timeline) {
    return next(new ErrorHandler("Timeline not found", 404));
  }

  await timeline.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Timeline deleted successfully" });
});
