import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TravelNest Backend API",
      version: "1.0.0",
      description: "API documentation for TravelNest (First Review Demo)"
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/*.ts"]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions as any);
