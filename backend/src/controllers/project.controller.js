// controllers/project.controller.js
import { Project } from "../models/project.model.js";

export const createProject = async (req, res) => {
  try {
    console.log("📥 RECEIVED PAYLOAD:", JSON.stringify(req.body, null, 2));

    const {
      title,
      client,
      clientName,
      startDate,
      endDate,
      description = "",
      budget,
      projectType = "Fixed Fee",
      billingMethod = "Milestone",
      autoInvoice = true,
      color = "bg-cyan-500",
      milestones = [],
      teamMembers = [],
    } = req.body;

    if (!client) {
      return res.status(400).json({ success: false, message: "Client is required" });
    }
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }

    // Safe transformation
    const formattedTeamMembers = Array.isArray(teamMembers) 
      ? teamMembers.map(name => ({
          name: (name || "Team Member").trim(),
          email: "",
          role: "Member"
        }))
      : [];

    const projectData = {
      title: title.trim(),
      client,
      clientName: clientName || "",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      dueDate: endDate ? new Date(endDate) : null,
      description,
      budget: Number(budget) || 0,
      billed: 0,
      progress: 0,
      status: "ACTIVE",
      projectType,
      billingMethod,
      autoInvoice: Boolean(autoInvoice),
      color,
      icon: "folder",
      teamMembers: formattedTeamMembers,
      members: formattedTeamMembers.length,
      milestones: Array.isArray(milestones) 
        ? milestones
            .filter(m => m?.title?.trim())
            .map(m => ({
              title: m.title.trim(),
              dueDate: m.dueDate ? new Date(m.dueDate) : null,
              amount: Number(m.amount) || 0,
              status: m.status || "scheduled",
            }))
        : [],
    };

    const newProject = await Project.create(projectData);

    const populatedProject = await Project.findById(newProject._id)
      .populate("client", "name email phone");

    console.log("✅ PROJECT CREATED:", newProject._id);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("❌ CREATE PROJECT FAILED:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid Client ID" });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error" 
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { clientId } = req.query;
    const query = clientId ? { client: clientId } : {};

    const projects = await Project.find(query)
      .populate("client", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const createMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const milestone = {
      title: req.body.title,
      dueDate: new Date(req.body.dueDate),
      amount: Number(req.body.amount),
      status: req.body.status || "scheduled",
    };

    project.milestones.push(milestone);

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("client", "name email phone");

    res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Create Milestone Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const { projectId, milestoneIndex } = req.params;
    const { title, dueDate, amount, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const index = parseInt(milestoneIndex);
    if (isNaN(index) || index < 0 || index >= project.milestones.length) {
      return res.status(400).json({ success: false, message: "Invalid milestone index" });
    }

    // Update the milestone
    project.milestones[index] = {
      ...project.milestones[index],
      title: title || project.milestones[index].title,
      dueDate: dueDate ? new Date(dueDate) : project.milestones[index].dueDate,
      amount: Number(amount) || project.milestones[index].amount,
      status: status || project.milestones[index].status,
    };

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("client", "name email phone");

    res.json({
      success: true,
      message: "Milestone updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update Milestone Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};