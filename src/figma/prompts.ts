/**
 * Prompts for Figma design analysis
 */

/**
 * System prompt for Figma analysis
 */
export const figmaSystemPrompt = `You are a senior product analyst and UX expert with extensive experience in analyzing application designs and extracting product requirements.

Your task is to analyze Figma design images and extract comprehensive product requirements that can be used to build the application.

Guidelines:
- Be thorough and specific in your analysis
- Identify all visible UI elements and their purposes
- Consider the user experience and flow between screens
- Note any patterns or reusable components
- Identify potential data models based on what's displayed
- Consider edge cases and error states that might be needed

Format your response in clear markdown sections for easy parsing.`;

/**
 * Analysis prompt for extracting requirements from Figma designs
 */
export const figmaAnalysisPrompt = `Analyze these Figma design images and extract comprehensive requirements for building this application.

For each screen/component visible, identify:

1. **USER TYPE** - Who would use this screen? (e.g., Admin, Customer, Guest, Authenticated User)

2. **USER STORIES** - What can users accomplish here?
   Format: "As a [user type], I want [action] so that [benefit]"

3. **USER FLOW** - Which flow does this screen belong to? (e.g., Authentication, Onboarding, Checkout, Profile Management)

4. **DATA REQUIREMENTS** - What data is being displayed or collected?
   - List entities with their attributes (e.g., User: name, email, avatar)
   - Note any relationships between entities

5. **FEATURES** - What specific features/functionality are visible?
   - Core features vs. secondary features
   - Interactive elements and their behaviors

6. **UI COMPONENTS** - What reusable components can be identified?
   - Buttons, cards, forms, modals, etc.
   - Navigation patterns
   - Layout structures

Structure your response with these sections:

## 1. User Types (Actors)
List all identified user types with brief descriptions.

## 2. User Stories
Group by user type, list all user stories.

## 3. User Flows
Describe the main flows visible in the designs.

## 4. Features
List all features with descriptions and acceptance criteria.

## 5. Data Entities
Define the data models with attributes and relationships.

## 6. UI Components
List reusable components with their variations and states.

## 7. Additional Observations
Any other insights, potential improvements, or considerations.`;

/**
 * Shorter prompt for quick analysis
 */
export const figmaQuickAnalysisPrompt = `Analyze these Figma designs and provide a brief summary:

1. **Overview** - What is this application about?
2. **Main Features** - List the key features visible
3. **User Types** - Who are the target users?
4. **Key Screens** - Describe the main screens
5. **Data** - What data does the app work with?

Keep the response concise but comprehensive.`;

/**
 * Prompt for analyzing a single screen
 */
export const figmaSingleScreenPrompt = `Analyze this single Figma design screen:

1. **Purpose** - What is this screen for?
2. **User Actions** - What can users do here?
3. **UI Elements** - List all visible elements
4. **Data Displayed** - What information is shown?
5. **Navigation** - Where can users go from here?
6. **States** - What states might this screen have? (loading, empty, error, etc.)`;
