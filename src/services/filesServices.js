import axios from "axios";
import csv from "csv-parser";

export default class FilesServices {
  BASE_URL = "https://echo-serv.tbxnet.com/v1";
  API_KEY = "aSuperSecretKey";
  constructor() {}

  async getFilesList() {
    try {
      const { data } = await axios.get(`${this.BASE_URL}/secret/files`, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
      });
      if (!data.files || data.files.length === 0) {
        return null;
      }
      return data;
    } catch (error) {
      const err = new Error("Error getting files list");
      err["status"] = 400;
      throw err;
    }
  }

  async downloadFile(fileName) {
    try {
      const { data } = await axios.get(`${this.BASE_URL}/secret/file/${fileName}`, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
        responseType: "stream",
      });
      return data;
    } catch (error) {
      console.log("Error downloading file");
      return null;
    }
  }

  isValidRow(row) {
    const hex32Regex = /^[0-9a-fA-F]{32}$/;
    const validHex = hex32Regex.test(row.hex);
    if (!row.file || !row.text || !row.number || !row.hex || !validHex) return false;
    return true;
  }

  parseCsv(fileStream) {
    return new Promise((resolve, reject) => {
      const results = [];
      const csvParser = csv();

      fileStream.pipe(csvParser);

      csvParser.on("data", (row) => {
        if (!this.isValidRow(row)) return;
        const processedRow = {
          text: row.text,
          number: row.number,
          hex: row.hex,
        };
        results.push(processedRow);
      });

      csvParser.on("end", () => {
        resolve(results);
      });

      csvParser.on("error", (error) => {
        console.error("Error in CSV parsing:", error);
        reject(new Error("Erorr proccessing CSV."));
      });

      fileStream.on("error", (error) => {
        console.error("Error in download stream:", error);
        reject(new Error(`Error downloading file ${fileName}`));
      });
    });
  }
}
