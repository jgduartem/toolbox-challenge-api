import { describe, it, afterEach } from "mocha";
import chai from "chai";
import nock from "nock";
import FilesServices from "../../src/services/filesServices.js";

const expect = chai.expect;

describe("Unit Tests - FilesServices", () => {
  const filesServices = new FilesServices();

  afterEach(() => {
    nock.cleanAll();
  });

  it("getFilesList() should return files list", async () => {
    nock(filesServices.BASE_URL)
      .get("/secret/files")
      .reply(200, { files: ["test1.csv", "test2.csv"] });

    const result = await filesServices.getFilesList();
    expect(result).to.have.property("files").that.includes("test1.csv");
  });

  it("getFilesList() should throw error when API fails", async () => {
    nock(filesServices.BASE_URL).get("/secret/files").reply(500);

    try {
      await filesServices.getFilesList();
      throw new Error("Should have thrown");
    } catch (err) {
      expect(err).to.have.property("status", 400);
      expect(err.message).to.equal("Error getting files list");
    }
  });

  it("downloadFile() should return CSV stream", async () => {
    const fakeCsv = `file,text,number,hex
test.csv,hello,123,a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`;

    nock(filesServices.BASE_URL)
      .get("/secret/file/test.csv")
      .reply(200, fakeCsv);

    const fileStream = await filesServices.downloadFile("test.csv");
    const parsed = await filesServices.parseCsv(fileStream);

    expect(parsed).to.be.an("array").with.lengthOf(1);
    expect(parsed[0]).to.deep.equal({
      text: "hello",
      number: "123",
      hex: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    });
  });

  it("isValidRow() should validate correctly", () => {
    const validRow = {
      file: "test.csv",
      text: "txt",
      number: "123",
      hex: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    };
    const invalidRow = { file: "test.csv", text: "txt" };

    expect(filesServices.isValidRow(validRow)).to.be.true;
    expect(filesServices.isValidRow(invalidRow)).to.be.false;
  });
});
