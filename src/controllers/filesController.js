import FilesServices from "../services/filesServices.js";

export default class FilesController {
  constructor() {
    this.filesServices = new FilesServices();
  }
  getData = async (req, res, next) => {
    try {
      const { fileName } = req.query;
      let files = []
      if (fileName && fileName?.trim() != "") {
        files = [fileName]
      } else {
        const filesList = await this.filesServices.getFilesList();
        files = filesList.files || []
      }
      const response = [];
      for (const fileName of files) {
        const fileStream = await this.filesServices.downloadFile(fileName);
        if (fileStream) {
          const fileData = await this.filesServices.parseCsv(fileStream);
          response.push({ file: fileName, lines: fileData });
        }
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  listFiles = async (req, res, next) => {
    try {
      const response = await this.filesServices.getFilesList();
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
