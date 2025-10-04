import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import FilesRouter from './routes/filesRouter.js'

const app = express()

const port = 8000

app.use(helmet())

app.use(
  cors({
    origin: '*'
  })
)

app.use(express.json())

app.use('/files', new FilesRouter().getRouter())

app.listen(port, () => {
  console.log(`TOOLBOX CHALLENGE API RUNNING ON PORT: ${port}`)
})

export default app
