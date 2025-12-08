import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/graphql",
  headers: {
    "Content-Type": "application/json",
    "x-user-role": "admin"  // important!
  }
});
