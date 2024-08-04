import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { senderName, subject, message } = req.body;

  if (!senderName || !subject || !message) {
    return next(new errorHandler("All fields are required"), 400);
  }

  const data = await Message.create({ senderName, subject, message });

  return res
    .status(200)
    .json({ success: true, message: "Message sent successfully", data });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();

  return res.status(200).json({ success: true, messages });
});

export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const message = await Message.findById(id);

  if (!message) {
    return next(new errorHandler("Message not found", 400));
  }

  await message.deleteOne();

  return res
    .status(200)
    .json({ success: true, message: "Message deleted successfully" });
});
