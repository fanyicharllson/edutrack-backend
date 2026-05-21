import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { register as promRegister, collectDefaultMetrics } from 'prom-client'
import authRoutes from './modules/auth/routes'
import { errorHandler } from './middleware/errorHandler'
import { initializeNotificationListeners } from './modules/notifications/listener'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

// Initialize notification listeners
initializeNotificationListeners()

// Prometheus metrics
collectDefaultMetrics()

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduTrack API',
      version: '1.0.0',
      description: 'Student Finance Tracker API',
    },
    servers: [
      {
        url: 'http://104.248.250.176:30080',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EduTrack API is running' })
})

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: 'http://104.248.250.176:30080/api-docs.json',
  },
}))

app.get('/metrics', (req, res) => {
  res.set('Content-Type', promRegister.contentType)
  res.end(promRegister.metrics())
})

app.use('/api/v1/auth', authRoutes)

app.use(errorHandler)

export default app
