import axios from "axios";

const api = axios.create({
  baseURL: "/api/web/v1", // Incluye la ruta completa después de /api
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Ambu-Public-Key": "AMBU-T-BXiqUTFtRg8PbWLc-57055915-n59AHW",
    "Ambu-Private-Key": "AMBU-fVN0VyresedITDPm7pvGrjnb2urUxlR0EKsS1qc86T4VEWP6-VFZ4N83UcrKS357V-T",
  },
});

export default api;