import express from 'express'
import FilesController from '../controllers/filesController.js'

export default class FilesRouter {
  constructor () {
    this.router = express.Router()
    this.filesController = new FilesController()
    this.initializeRoutes()
  }

  initializeRoutes () {
    this.router.get('/data', this.filesController.getData)
    this.router.get('/list', this.filesController.listFiles)
  }

  getRouter () {
    return this.router
  }
}
