import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../middlewares/error.js";
import { Project } from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !Object.keys(req.files).length === 0) {
    return next(new errorHandler("No files were uploaded.", 400));
  }

  const { projectBanner } = req.files;
  const {
    title,
    description,
    gitRepoURL,
    projectLink,
    technologies,
    stack,
    deployed,
  } = req.body;

  if (
    !title ||
    !description ||
    !gitRepoURL ||
    !projectLink ||
    !technologies ||
    !stack ||
    !deployed
  ) {
    return next(new errorHandler("All fields are required.", 400));
  }

  const result = await cloudinary.uploader.upload(projectBanner.tempFilePath, {
    folder: "PROJECTS",
  });

  if (!result || result.error) {
    console.error(
      "Cloudinary Error: ",
      result.error || "Unknown error occurred while uploading svg."
    );
  }

  const project = await Project.create({
    title,
    description,
    gitRepoURL,
    projectLink,
    technologies,
    stack,
    deployed,
    projectBanner: { public_id: result.public_id, url: result.secure_url },
  });

  res.status(201).json({
    success: true,
    message: "Project added successfully",
    project,
  });
});

export const getProjectById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    return next(new errorHandler("Project not found", 404));
  }

  res.status(200).json({ success: true, project });
});

export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find();

  res.status(200).json({ success: true, projects });
});

export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const newProjectData = {
    title: req.body.title,
    description: req.body.description,
    gitRepoURL: req.body.gitRepoURL,
    projectLink: req.body.projectLink,
    technologies: req.body.technologies,
    stack: req.body.stack,
    deployed: req.body.deployed,
  };
  if (req.files && req.files.projectBanner) {
    const projectBanner = req.files.projectBanner;
    const project = await Project.findById(req.params.id);
    const projectBannerID = project.projectBanner.public_id;

    await cloudinary.uploader.destroy(projectBannerID);

    const result = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PROJECTS",
      }
    );
    newProjectData.projectBanner = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    newProjectData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    updatedProject,
  });
});

export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    return next(new errorHandler("Project not found", 404));
  }

  await project.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Project deleted successfully" });
});
