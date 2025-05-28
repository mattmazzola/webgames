const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

console.log('Script started at', new Date().toLocaleString("en-US", { }));

function loadGamesFromJsonl(filePath) {
  try {
    console.debug('Attempting to read file:', filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error(`Error parsing line:`, e);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error(`Error loading games from ${filePath}:`, error);
    return [];
  }
}

function filterGamesByTags(games, andTags = [], orTags = []) {
  return games.filter(game => {
    // AND condition: all tags must be present
    const andCondition = andTags.length === 0 || 
      andTags.every(tag => game.tags?.includes(tag));
    
    // OR condition: at least one tag must be present (only if OR tags specified)
    const orCondition = orTags.length === 0 || 
      orTags.some(tag => game.tags?.includes(tag));
    
    return andCondition && orCondition;
  });
}

function getDefaultDataFilePath() {
  const scriptsDir = path.dirname(__filename);
  const projectRoot = path.resolve(scriptsDir, '..');
  const filePath = path.join(projectRoot, 'data', 'webgames-v0-challenges.jsonl');
  console.log('Default data file path:', filePath);
  return filePath;
}

function getGamesByTags(jsonlPath, andTags = [], orTags = []) {
  const dataFilePath = jsonlPath || getDefaultDataFilePath();
  const allGames = loadGamesFromJsonl(dataFilePath);
  return filterGamesByTags(allGames, andTags, orTags);
}


const program = new Command();

program
  .name('getGamesByTags')
  .description('Filter games from a JSONL file by tags')
  .version('1.0.0')
  .option('-f, --file <path>', 'Path to JSONL file containing games data')
  .option('--and <tags...>', 'Tags that must ALL be present (AND condition)')
  .option('--or <tags...>', 'Tags where at least one must be present (OR condition)')
  .parse(process.argv);

const options = program.opts();
console.log('Command options:', options);

// Get tags from options
const andTags = options.and || [];
const orTags = options.or || [];
const filePath = options.file;

console.log('Loading games...');
console.log('AND tags:', andTags);
console.log('OR tags:', orTags);
console.log('Using file path:', filePath || 'default path');
const games = getGamesByTags(filePath, andTags, orTags);

// Output results
console.log(`Found ${games.length} games matching:`);
if (andTags.length > 0) {
  console.log(`- All tags: ${andTags.join(', ')}`);
}
if (orTags.length > 0) {
  console.log(`- Any tags: ${orTags.join(', ')}`);
}

console.log('\nMatching games:');
games.forEach(game => {
  console.log(`- ${game.title} (${game.path})`);
  console.log(`  Tags: ${game.tags?.join(', ') || 'None'}`);
  console.log(`  Difficulty: ${game.difficulty}`);
  console.log('');
});
