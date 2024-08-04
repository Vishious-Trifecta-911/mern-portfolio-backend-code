import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../middlewares/error.js";
import { SoftwareApp } from "../models/softwareAppSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addSoftwareApp = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new errorHandler("No files were uploaded.", 400));
  }

  const { svg } = req.files;
  const { name } = req.body;

  if (!name) {
    return next(new errorHandler("Name is required.", 400));
  }

  const result = await cloudinary.uploader.upload(svg.tempFilePath, {
    folder: "SOFTWARE_APPLICATIONS",
  });

  if (!result || result.error) {
    console.error(
      "Cloudinary Error: ",
      result.error || "Unknown error occurred while uploading svg."
    );
  }

  const softwareApp = await SoftwareApp.create({
    name,
    svg: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Software application added successfully.",
    softwareApp,
  });
});

export const getAllSoftwareApps = catchAsyncErrors(async (req, res, next) => {
  const softwareApps = await SoftwareApp.find();

  res.status(200).json({
    success: true,
    softwareApps,
  });
});

export const deleteSoftwareApp = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const softwareApp = await SoftwareApp.findById(id);

  if (!softwareApp) {
    return next(new errorHandler("Software application not found.", 404));
  }

  await cloudinary.uploader.destroy(softwareApp.svg.public_id);
  await softwareApp.deleteOne();

  res.status(200).json({
    success: true,
    message: "Software application deleted successfully.",
  });
});
