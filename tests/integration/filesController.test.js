import chai from 'chai'
import chaiHttp from 'chai-http'
import nock from 'nock'
import { before, describe, it } from 'mocha'
import app from '../../src/server.js'
import FilesServices from '../../src/services/filesServices.js'

const expect = chai.expect
chai.use(chaiHttp)

let server

describe('Integration Tests - FilesController', () => {
  const filesServices = new FilesServices()

  before((done) => {
    server = app.listen(8001, () => done())
  })

  it('GET /files/list should return files list', (done) => {
    nock(filesServices.BASE_URL)
      .get('/secret/files')
      .reply(200, { files: ['test1.csv', 'test2.csv'] })

    chai
      .request(server)
      .get('/files/list')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('files').that.includes('test1.csv')
        done()
      })
  })

  it('GET /files/data should return all files parsed', (done) => {
    nock(filesServices.BASE_URL)
      .get('/secret/files')
      .reply(200, { files: ['test.csv'] })

    const fakeCsv = `file,text,number,hex
test.csv,hello,123,a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`

    nock(filesServices.BASE_URL).get('/secret/file/test.csv').reply(200, fakeCsv)

    chai
      .request(server)
      .get('/files/data')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array')
        expect(res.body[0]).to.have.property('file', 'test.csv')
        expect(res.body[0].lines).to.be.an('array').with.lengthOf(1)
        done()
      })
  })

  it('GET /files/data?fileName=test.csv should return single file parsed', (done) => {
    const fakeCsv = `file,text,number,hex
test.csv,hello,123,a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`

    nock(filesServices.BASE_URL).get('/secret/file/test.csv').reply(200, fakeCsv)

    chai
      .request(server)
      .get('/files/data?fileName=test.csv')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array').with.lengthOf(1)
        expect(res.body[0]).to.have.property('file', 'test.csv')
        expect(res.body[0].lines).to.be.an('array').with.lengthOf(1)
        done()
      })
  })
})
