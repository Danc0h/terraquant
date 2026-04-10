import axios from "axios";
import csvParser from "csv-parse/lib/sync"; // for parsing CSV if needed

// Example: fetch CSV from Verra (replace URL with real one)
const VERRA_CSV_URL = "https://registry.verra.org/projects.csv";

// Fetch projects from Verra and normalize to standard format
export const fetchRegistryProjectsFromVerra = async () => {
  try {
    const response = await axios.get(VERRA_CSV_URL, { responseType: "text" });

    // If CSV
    const records = csvParser(response.data, {
      columns: true,
      skip_empty_lines: true,
    });

    // Normalize fields to match syncRegistryProjects
    const projects = records.map((p) => ({
      id: p["Project ID"] || p["Project Identifier"],
      name: p["Project Name"],
      country: p["Country"],
      verification_body: "Verra",
      status: p["Project Status"] || "ACTIVE",
    }));

    return projects;
  } catch (err) {
    console.error("Error fetching Verra projects:", err.message);
    return [];
  }
};
