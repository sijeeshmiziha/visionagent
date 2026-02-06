/**
 * Example 08: Figma to Code Analysis
 *
 * Run with: npm run example:08
 *
 * Demonstrates the new code-oriented Figma analysis functions that return
 * structured JSON data for code generation tools.
 *
 * Requires: OPENAI_API_KEY environment variable
 * Note: Place PNG/JPG images in examples/figma-screens/
 */

import {
  analyzeFigmaForCode,
  identifyScreens,
  extractComponents,
  generateAPIEndpoints,
  validateFigmaFolder,
} from '../src/index';
import { getsetfitAdmin } from './figma-screens/index';

async function main() {
  const folderPath = getsetfitAdmin;

  console.log('='.repeat(70));
  console.log('FIGMA TO CODE ANALYSIS');
  console.log('='.repeat(70));
  console.log();

  // Validate folder
  const validation = validateFigmaFolder(folderPath);

  if (!validation.isValid) {
    console.log('✗ No valid images found in:', folderPath);
    console.log('\nTo test Figma-to-Code analysis:');
    console.log('1. Add PNG/JPG screenshots to:', folderPath);
    console.log('2. Run this example again\n');
    return;
  }

  console.log(`✓ Found ${validation.imageCount} images to analyze\n`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('✗ OPENAI_API_KEY environment variable is required');
    return;
  }

  // Example 1: All-in-one analysis
  console.log('─'.repeat(70));
  console.log('1. COMPREHENSIVE ANALYSIS (All-in-One)');
  console.log('─'.repeat(70));
  console.log();

  const result = await analyzeFigmaForCode({
    apiKey,
    provider: 'openai',
    images: folderPath,
    maxImages: 5,
    detail: 'high',
  });

  console.log('📱 Screens Identified:', result.screens.length);
  result.screens.forEach((screen, i) => {
    console.log(`\n  ${i + 1}. ${screen.screenName}`);
    console.log(`     Type: ${screen.screenType}`);
    console.log(`     User: ${screen.userType}`);
    console.log(`     Purpose: ${screen.purpose}`);
  });

  console.log('\n🧩 Components Extracted:', result.components.length, 'screens');
  result.components.forEach(extraction => {
    console.log(`\n  Screen: ${extraction.screenName}`);
    console.log(`  Components (${extraction.components.length}):`);
    extraction.components.slice(0, 5).forEach(comp => {
      console.log(`    - ${comp.name} (${comp.type})`);
      console.log(`      Props: ${comp.props.join(', ')}`);
    });
    if (extraction.components.length > 5) {
      console.log(`    ... and ${extraction.components.length - 5} more`);
    }
  });

  console.log('\n🔌 API Endpoints Generated:', result.apiEndpoints.endpoints.length);
  result.apiEndpoints.endpoints.slice(0, 10).forEach((endpoint, i) => {
    console.log(`\n  ${i + 1}. ${endpoint.method} ${endpoint.path}`);
    console.log(`     ${endpoint.description}`);
    console.log(`     Auth Required: ${endpoint.authentication ? 'Yes' : 'No'}`);
    console.log(`     Related Screen: ${endpoint.relatedScreen}`);
  });
  if (result.apiEndpoints.endpoints.length > 10) {
    console.log(`\n  ... and ${result.apiEndpoints.endpoints.length - 10} more`);
  }

  console.log('\n📝 Requirements (markdown): Available');
  console.log(`   Length: ${result.requirements.length} characters`);

  // Example 2: Individual function usage
  console.log('\n\n' + '─'.repeat(70));
  console.log('2. INDIVIDUAL FUNCTION USAGE');
  console.log('─'.repeat(70));
  console.log();

  console.log('Using individual functions for more control...\n');

  // Just screens
  console.log('Getting screens only...');
  const screens = await identifyScreens({
    apiKey,
    provider: 'openai',
    images: folderPath,
    maxImages: 2,
  });
  console.log(`✓ Found ${screens.length} screens`);

  // Just components
  console.log('\nGetting components only...');
  const components = await extractComponents({
    apiKey,
    provider: 'openai',
    model: 'gpt-4o-mini', // Using cheaper model
    images: folderPath,
    maxImages: 2,
  });
  const totalComponents = components.reduce<number>((sum, c) => sum + c.components.length, 0);
  console.log(`✓ Found ${totalComponents} components`);

  // Just API endpoints
  console.log('\nGetting API endpoints only...');
  const apiEndpoints = await generateAPIEndpoints({
    apiKey,
    provider: 'openai',
    images: folderPath,
    maxImages: 2,
  });
  console.log(`✓ Generated ${apiEndpoints.endpoints.length} endpoints`);

  // Example 3: Using with different providers
  console.log('\n\n' + '─'.repeat(70));
  console.log('3. USING DIFFERENT PROVIDERS');
  console.log('─'.repeat(70));
  console.log();

  if (process.env.ANTHROPIC_API_KEY) {
    console.log('Using Anthropic Claude...');
    const claudeScreens = await identifyScreens({
      apiKey: process.env.ANTHROPIC_API_KEY,
      provider: 'anthropic',
      images: folderPath,
      maxImages: 2,
    });
    console.log(`✓ Claude identified ${claudeScreens.length} screens`);
  }

  if (process.env.GOOGLE_API_KEY) {
    console.log('\nUsing Google Gemini...');
    const geminiScreens = await identifyScreens({
      apiKey: process.env.GOOGLE_API_KEY,
      provider: 'google',
      images: folderPath,
      maxImages: 2,
    });
    console.log(`✓ Gemini identified ${geminiScreens.length} screens`);
  }

  // Example 4: Export JSON for code generators
  console.log('\n\n' + '─'.repeat(70));
  console.log('4. EXPORTING FOR CODE GENERATORS');
  console.log('─'.repeat(70));
  console.log();

  console.log('Complete analysis as JSON:');
  console.log();
  console.log(
    JSON.stringify(
      {
        screens: result.screens,
        components: result.components,
        apiEndpoints: result.apiEndpoints.endpoints,
      },
      null,
      2
    )
  );

  console.log('\n' + '='.repeat(70));
  console.log('ANALYSIS COMPLETE');
  console.log('='.repeat(70));
}

main().catch(console.error);
