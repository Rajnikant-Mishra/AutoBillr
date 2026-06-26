// services/projectService.js

import axios from "axios";

const API =
  "http://localhost:5000/api/projects";

export const createProject = (data) =>
  axios.post(API, data);

export const getProjects = () =>
  axios.get(API);