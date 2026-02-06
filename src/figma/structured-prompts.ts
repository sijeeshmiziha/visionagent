/**
 * Structured prompts for code-oriented Figma analysis
 * These prompts are designed to return JSON-parseable responses
 */

/**
 * System prompt for structured analysis
 */
export const structuredAnalysisSystemPrompt = `You are an expert UI/UX analyst and software architect specializing in converting design mockups into technical specifications.

Your task is to analyze UI design images and provide structured, JSON-formatted responses that can be used by code generation tools.

Guidelines:
- Analyze designs thoroughly and extract actionable technical details
- Use consistent naming conventions (PascalCase for components, camelCase for props)
- Be specific about component types and their purposes
- Identify realistic API endpoints based on data flows
- Consider authentication, validation, and error handling
- Format all responses as valid JSON

Always respond with valid JSON that matches the requested schema.`;

/**
 * Prompt for screen identification
 */
export const screenIdentificationPrompt = `Analyze these UI design images and identify each unique screen.

For each screen, provide:
1. A descriptive name (e.g., "Login Screen", "User Dashboard", "Product Details")
2. The screen type/category (e.g., "Authentication", "Data Display", "Form", "Navigation")
3. A detailed description of what the screen shows
4. The purpose/goal of the screen
5. The target user type (e.g., "Admin", "Customer", "Guest", "Authenticated User")

Respond with a JSON array following this exact schema:

{
  "screens": [
    {
      "screenName": "string",
      "screenType": "string",
      "description": "string",
      "purpose": "string",
      "userType": "string",
      "imagePath": "string"
    }
  ]
}

Important: The imagePath should be a placeholder like "image_1", "image_2", etc. corresponding to the order of images provided.

Provide only valid JSON in your response, no additional text.`;

/**
 * Prompt for component extraction
 */
export const componentExtractionPrompt = `Analyze these UI design images and extract all reusable UI components from each screen.

For each screen, identify:
1. Component name (PascalCase, descriptive, e.g., "LoginButton", "EmailInput", "UserCard")
2. Component type (e.g., "Button", "TextInput", "Card", "Modal", "Dropdown", "Table", "Navigation")
3. Component props/attributes (camelCase, e.g., ["label", "onClick", "disabled", "variant", "size"])
4. Brief description of the component's purpose

Respond with a JSON array following this exact schema:

{
  "extractions": [
    {
      "screenName": "string",
      "components": [
        {
          "name": "string",
          "type": "string",
          "props": ["string"],
          "description": "string"
        }
      ],
      "imagePath": "string"
    }
  ]
}

Guidelines for component identification:
- Look for interactive elements: buttons, inputs, forms, toggles
- Identify layout components: cards, containers, grids
- Note navigation elements: menus, tabs, breadcrumbs
- List data display components: tables, lists, charts
- Include feedback components: modals, toasts, alerts

The imagePath should be "image_1", "image_2", etc. corresponding to image order.

Provide only valid JSON in your response, no additional text.`;

/**
 * Prompt for API endpoint generation
 */
export const apiEndpointGenerationPrompt = `Analyze these UI design images and generate a list of backend API endpoints that would be needed to support the functionality visible in the designs.

For each endpoint, provide:
1. HTTP method (GET, POST, PUT, DELETE, PATCH)
2. Endpoint path following REST conventions (e.g., "/api/auth/login", "/api/users/:id")
3. Description of what the endpoint does
4. Example request body (for POST/PUT/PATCH) as JSON object
5. Example response body as JSON object
6. Whether authentication is required (true/false)
7. The related screen name where this endpoint would be used

Respond with a JSON object following this exact schema:

{
  "endpoints": [
    {
      "method": "string",
      "path": "string",
      "description": "string",
      "requestBody": {},
      "responseBody": {},
      "authentication": boolean,
      "relatedScreen": "string"
    }
  ]
}

Guidelines for API generation:
- Follow RESTful conventions
- Use plural nouns for collections (/api/users)
- Use path parameters for specific resources (/api/users/:id)
- POST for creating, PUT/PATCH for updating, DELETE for removing, GET for fetching
- Include typical CRUD operations for visible data entities
- Consider authentication endpoints (login, logout, register, refresh token)
- Include validation and error response examples
- Group related endpoints by resource

Provide only valid JSON in your response, no additional text.`;

/**
 * Prompt for comprehensive code analysis
 */
export const comprehensiveCodeAnalysisPrompt = `Analyze these UI design images and provide a complete technical specification for building this application.

Extract:
1. All unique screens with their purposes
2. All reusable UI components with their props
3. All backend API endpoints needed

Respond with a JSON object following this exact schema:

{
  "screens": [
    {
      "screenName": "string",
      "screenType": "string",
      "description": "string",
      "purpose": "string",
      "userType": "string",
      "imagePath": "string"
    }
  ],
  "components": [
    {
      "screenName": "string",
      "components": [
        {
          "name": "string",
          "type": "string",
          "props": ["string"],
          "description": "string"
        }
      ],
      "imagePath": "string"
    }
  ],
  "endpoints": [
    {
      "method": "string",
      "path": "string",
      "description": "string",
      "requestBody": {},
      "responseBody": {},
      "authentication": boolean,
      "relatedScreen": "string"
    }
  ]
}

Be thorough and specific. The imagePath values should be "image_1", "image_2", etc.

Provide only valid JSON in your response, no additional text.`;
