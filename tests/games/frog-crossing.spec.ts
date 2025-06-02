import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import {
    createDirectories,
    loadTasksFromJsonl,
    createScreenshotHandler,
    getTaskImages,
} from '../helpers'

// Create directories and get paths
const {
    screenshotDir,
    datasetImagesDir,
    datasetJsonlPath
} = createDirectories('frog-crossing')

type FrogCrossingDatasetItem = {
    taskIndex: number
    images: string[]
    seed: number
    initialFrogPos: { x: number, y: number }
    finalFrogPos: { x: number, y: number }
    actions: {
        action: string,
        key?: string,
        x_offset?: number,
        y_offset?: number,
    }[]
    password: string
}

type TaskData = {
    seed: number
    password: string
    mode: "static" | "dynamic" // Mode to control car movement (static or dynamic)
}

// Define our game state type
type GameState = {
    grid: string[][],
    gridSize: number,
    carRows: number[],
    rowDirections: Record<number, "left" | "right">
}

function getFrogPosition(gameState: GameState) {
    const grid = gameState.grid;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 'F') {
                return { x, y }
            }
        }
    }
    return { x: -1, y: -1 }
}

// Helper function to identify car rows - we don't need this anymore as car rows come from the DOM
// But keeping a modified version in case we need to calculate them from the grid
function identifyCarRowsFromGrid(gameState: GameState) {
    const grid = gameState.grid;
    const carRows: number[] = []
    for (let y = 0; y < grid.length; y++) {
        if (grid[y].some(cell => cell === 'C') && !carRows.includes(y)) {
            carRows.push(y)
        }
    }
    return carRows
}

// Helper function to find all car positions
function getCars(gameState: GameState) {
    const grid = gameState.grid;
    const cars: { x: number, y: number, direction: "left" | "right" }[] = []
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 'C') {
                cars.push({ 
                    x, 
                    y, 
                    direction: gameState.rowDirections[y] || "left" // Default to left if not known
                })
            }
        }
    }
    return cars
}

// Helper function to print the game state for debugging
function printGameState(gameState: GameState) {
    const grid = gameState.grid;
    const frogPos = getFrogPosition(gameState)
    const carRows = gameState.carRows
    const rowDirections = gameState.rowDirections

    const gridSize = gameState.gridSize
    
    console.log("\nGame Grid State: (Size: " + gridSize + "x" + gridSize + ")")
    console.log("Car Rows: [" + carRows.join(", ") + "]")
    console.log("  " + Array.from({ length: grid[0].length }, (_, i) => i).join(" "))

    for (let y = 0; y < grid.length; y++) {
        let rowStr = y + " " + grid[y].join(" ")
        
        if (carRows.includes(y)) {
            const direction = rowDirections[y];
            rowStr += ` (Car Row - ${direction === 'left' ? '←' : '→'})`;
        }
        
        if (y === frogPos.y) {
            rowStr += " <- Frog at (" + frogPos.x + "," + frogPos.y + ")"
        }
        console.log(rowStr)
    }
    console.log("")
}

// Game constants
const FROG_MOVE_INTERVAL = 200 // Move frog faster than cars to improve success rate

// Load tasks from the JSONL file
const tasksFilePath = path.join(process.cwd(), 'webgames', 'public', 'data', 'frog-crossing', 'tasks.jsonl')
const tasks = loadTasksFromJsonl<TaskData>(tasksFilePath)

tasks.forEach((task, lineIndex) => {
    // Format line index with leading zero for single digits (01, 02, etc.)
    const formattedLineIndex = lineIndex.toString().padStart(2, '0');
    test(`Frog Crossing game task #${formattedLineIndex}`, async ({ page }) => {
        // Set viewport to include full game area
        await page.setViewportSize({ width: 1024, height: 1024 })

        // Navigate to the frog crossing game with the specific lineIndex
        await page.goto(`http://localhost:5173/frog-crossing-custom?lineIndex=${lineIndex}`)

        // Wait for the page to load completely
        await page.waitForSelector('h1:has-text("Frog Crossing")')

        const takeScreenshotAndCopy = createScreenshotHandler(page, screenshotDir, datasetImagesDir, lineIndex)

        // Take a screenshot of the initial game state
        await takeScreenshotAndCopy('initial')

        // Get initial game state to determine grid size
        const initialState = await page.evaluate(() => {
            const gridContainer = document.querySelector('[class*="grid"]')
            if (!gridContainer) throw new Error('Grid container not found')
            
            // Calculate grid dimensions
            const gridStyle = window.getComputedStyle(gridContainer)
            const gridSize = gridStyle.getPropertyValue('grid-template-columns').split(' ').length
            return { gridSize }
        })

        // Create dataset item
        const dataItem: FrogCrossingDatasetItem = {
            taskIndex: lineIndex,
            images: [],
            seed: task.seed,
            initialFrogPos: {
                x: Math.floor(initialState.gridSize / 2),
                y: initialState.gridSize - 1
            },
            finalFrogPos: { x: 0, y: 0 }, // Will be updated later
            actions: [],
            password: ''
        }

        // Function to get the current grid state
        async function getGameState() {
            return page.evaluate(() => {
                // Get grid size by measuring the grid element
                const gridContainer = document.querySelector('[class*="grid"]')
                if (!gridContainer) throw new Error('Grid container not found')
                
                // Calculate grid dimensions from the container's style
                const gridStyle = window.getComputedStyle(gridContainer)
                const gridTemplateColumns = gridStyle.getPropertyValue('grid-template-columns').split(' ').length
                const gridTemplateRows = gridStyle.getPropertyValue('grid-template-rows').split(' ').length
                
                // Get the grid dimensions
                const gridSize = Math.max(gridTemplateColumns, gridTemplateRows)
                
                const grid: string[][] = []
                const cells = document.querySelectorAll('[class*="grid"] > div')
                
                // Identify car rows by checking which rows have "car" class elements
                const carRows: number[] = []
                
                // First pass: identify car rows and their directions by finding car emojis
                const tempCarRows: number[] = [];
                const rowDirections: Record<number, "left" | "right"> = {};
                
                for (let y = 0; y < gridSize; y++) {
                    let leftMovingCars = 0;
                    let rightMovingCars = 0;
                    
                    for (let x = 0; x < gridSize; x++) {
                        const index = y * gridSize + x;
                        const cell = cells[index];
                        const hasLeftCar = cell.textContent?.includes('🚙');
                        const hasRightCar = cell.textContent?.includes('🚗');
                        
                        if ((hasLeftCar || hasRightCar) && !tempCarRows.includes(y)) {
                            tempCarRows.push(y);
                        }
                        
                        // Count car directions
                        if (hasLeftCar) leftMovingCars++;
                        if (hasRightCar) rightMovingCars++;
                    }
                    
                    // Determine row direction based on majority of cars
                    if (leftMovingCars > 0 || rightMovingCars > 0) {
                        rowDirections[y] = leftMovingCars >= rightMovingCars ? "left" : "right";
                    }
                }
                
                // Second pass: build the grid with proper cell types
                for (let y = 0; y < gridSize; y++) {
                    const row: string[] = [];
                    const isCarRow = tempCarRows.includes(y);
                    
                    for (let x = 0; x < gridSize; x++) {
                        const index = y * gridSize + x;
                        const cell = cells[index];
                        const hasFrog = cell.textContent?.includes('🐸') ?? false;
                        const hasCar = cell.textContent?.includes('🚙') || cell.textContent?.includes('🚗');
                        
                        // Use single character codes for cell types
                        // F = frog, C = car, G = goal, S = start, R = road, O = open/safe
                        let cellChar: string;
                        if (hasFrog) {
                            cellChar = 'F'; // Frog
                        } else if (hasCar) {
                            cellChar = 'C'; // Car
                        } else if (y === 0) {
                            cellChar = 'G'; // Goal
                        } else if (y === gridSize - 1) {
                            cellChar = 'S'; // Start
                        } else {
                            // If we're in a known car row, all cells in that row are roads
                            cellChar = isCarRow ? 'R' : 'O'; // Road or Open/safe
                        }
                        
                        row.push(cellChar);
                    }
                    grid.push(row);
                    
                    // Add to official car rows list
                    if (isCarRow && !carRows.includes(y)) {
                        carRows.push(y);
                    }
                }
                
                return {
                    grid,
                    gridSize,
                    carRows,
                    rowDirections
                }
            })
        }

        // Function to decide the next move based on the current game state
        function decideNextMove(gameState: GameState) {
            // Get frog position from the grid
            const frogPos = getFrogPosition(gameState)
            const gridSize = gameState.gridSize
            const carRows = gameState.carRows
            const rowDirections = gameState.rowDirections
            const cars = getCars(gameState)
            const grid = gameState.grid
            const isStaticMode = gameMode === 'static'

            // If we're at the top row, we've won
            if (frogPos.y === 0) {
                return null
            }

            // Calculate all possible moves
            const possibleMoves = [
                { key: 'ArrowUp', newPos: { x: frogPos.x, y: frogPos.y - 1 } },
                { key: 'ArrowLeft', newPos: { x: frogPos.x - 1, y: frogPos.y } },
                { key: 'ArrowRight', newPos: { x: frogPos.x + 1, y: frogPos.y } }
            ].filter(move => {
                // Check if move is within grid bounds
                if (move.newPos.x < 0 || move.newPos.x >= gridSize ||
                    move.newPos.y < 0 || move.newPos.y >= gridSize) {
                    return false
                }
                
                // In static mode, also immediately filter out moves directly to car positions
                if (isStaticMode) {
                    const { x, y } = move.newPos;
                    if (grid[y][x] === 'C') {
                        return false;
                    }
                }
                
                return true
            })

            // For static mode, use a simpler algorithm focused on avoiding cars
            // and finding the shortest path to the goal
            if (isStaticMode) {
                // In static mode, we can just look for a direct path to the top
                console.log("Static mode: Using simplified path planning");
                
                // First, check if we can move up safely (no car directly above)
                const upMove = possibleMoves.find(move => move.key === 'ArrowUp');
                if (upMove) {
                    console.log("Moving up");
                    return 'ArrowUp';
                }
                
                // Next, try moving left or right to find a path
                const sideMoves = possibleMoves.filter(move => 
                    move.key === 'ArrowLeft' || move.key === 'ArrowRight');
                
                if (sideMoves.length > 0) {
                    // Choose the side move that gets us closer to the center
                    const center = Math.floor(gridSize / 2);
                    const sortedSideMoves = sideMoves.sort((a, b) => 
                        Math.abs(a.newPos.x - center) - Math.abs(b.newPos.x - center));
                    
                    console.log(`Moving ${sortedSideMoves[0].key === 'ArrowLeft' ? 'left' : 'right'} to avoid obstacle`);
                    return sortedSideMoves[0].key;
                }
                
                // If no moves are available, just pick any available move
                if (possibleMoves.length > 0) {
                    return possibleMoves[0].key;
                }
                
                return null;
            }
            
            // For dynamic mode, use the more complex algorithm with safety scores
            // Evaluate safety score for each possible move
            const scoredMoves = possibleMoves.map(move => {
                let safetyScore = 10; // Base score
                const { x, y } = move.newPos;
                
                // IMPROVEMENT 1: Consider car directions for better prediction
                if (carRows.includes(y)) {
                    // Moving onto a road is risky, reduce score significantly
                    safetyScore -= 5;
                    
                    // Check if there are nearby cars that could hit us
                    const rowDirection = rowDirections[y];
                    const carsInRow = cars.filter(car => car.y === y);
                    
                    for (const car of carsInRow) {
                        // Calculate horizontal distance to car
                        const distance = Math.abs(car.x - x);
                        
                        // If car is moving towards our position
                        if ((rowDirection === 'left' && car.x > x) || 
                            (rowDirection === 'right' && car.x < x)) {
                            // Closer cars are more dangerous
                            if (distance < 2) {
                                safetyScore -= 8; // Very dangerous
                            } else if (distance < 3) {
                                safetyScore -= 5; // Moderately dangerous
                            } else if (distance < 4) {
                                safetyScore -= 2; // Slightly dangerous
                            }
                        }
                    }
                }
                
                // IMPROVEMENT 2: Prefer positions with clear space around them
                let clearSpaceCount = 0;
                // Check for clear 3x3 grid area around target position
                for (let checkY = Math.max(0, y - 1); checkY <= Math.min(gridSize - 1, y + 1); checkY++) {
                    for (let checkX = Math.max(0, x - 1); checkX <= Math.min(gridSize - 1, x + 1); checkX++) {
                        // Skip the target position itself
                        if (checkX === x && checkY === y) continue;
                        
                        // If position is not a car, add to clear space count
                        if (grid[checkY][checkX] !== 'C') {
                            clearSpaceCount++;
                        }
                    }
                }
                safetyScore += clearSpaceCount;
                
                // Bonus for moving upward (toward goal)
                if (move.key === 'ArrowUp') {
                    safetyScore += 3;
                    
                    // Extra bonus if moving to a non-car-row (very safe)
                    if (!carRows.includes(y)) {
                        safetyScore += 5;
                    }
                }
                
                return { ...move, safetyScore };
            });
            
            // Sort moves by safety score (descending)
            scoredMoves.sort((a, b) => b.safetyScore - a.safetyScore);
            
            // Debug info about move options
            console.log("Move options (sorted by safety):");
            scoredMoves.forEach(move => {
                console.log(`${move.key} to (${move.newPos.x},${move.newPos.y}) - Safety: ${move.safetyScore}`);
            });
            
            // Choose the safest move
            if (scoredMoves.length > 0) {
                // If there are multiple relatively safe options with similar scores, 
                // pick from the top 2 to introduce some randomness
                const topMoves = scoredMoves.filter(move => 
                    move.safetyScore >= scoredMoves[0].safetyScore - 2);
                    
                if (topMoves.length > 1) {
                    return topMoves[Math.floor(Math.random() * Math.min(2, topMoves.length))].key;
                }
                return scoredMoves[0].key;
            }

            // No valid moves
            return null;
        }

        // Wait a moment for the game to initialize
        await page.waitForTimeout(1000)

        // Take screenshot after initialization
        await takeScreenshotAndCopy('started')
        
        // Check which mode we're running in
        const gameMode = task.mode
        console.log(`Running test in ${gameMode} mode (cars ${gameMode === 'static' ? "don't move" : "move"})`)
        
        // In static mode, we can be more aggressive with timing since cars won't move
        const moveIntervalToUse = gameMode === 'static' ? 50 : FROG_MOVE_INTERVAL

        // Game loop - continue until we reach the top or hit a car
        let maxMoves = 50 // Safety limit to prevent infinite loops
        let moveCount = 0
        let gameOver = false
        let success = false
        let passwordText = ''

        while (moveCount < maxMoves && !gameOver && !success) {
            // Get current state
            const gameState = await getGameState()

            // Get frog position
            const frogPos = getFrogPosition(gameState)

            // Print the current grid state for debugging
            console.log(`--- Move ${moveCount} ---`)
            printGameState(gameState)

            // Check if we've reached the top (success)
            if (frogPos.y === 0) {
                success = true
                break
            }

            // Decide next move
            const nextMove = decideNextMove(gameState)
            if (!nextMove) {
                break // No valid moves
            }

            // Execute the move
            await page.keyboard.press(nextMove)

            // Record the action
            dataItem.actions.push({
                action: "keypress",
                key: nextMove
            })

            // Wait for the game to process the move - give it just enough time to detect collisions
            // but not so much that cars move significantly
            await page.waitForTimeout(100)

            // Check game status
            const newGameState = await getGameState()

            // Get old and new frog positions
            const oldFrogPos = getFrogPosition(gameState)
            const newFrogPos = getFrogPosition(newGameState)

            // If frog position didn't change, we might have hit a car
            if (newFrogPos.x === oldFrogPos.x &&
                newFrogPos.y === oldFrogPos.y) {
                // Take a screenshot to see what happened
                await takeScreenshotAndCopy(`move_${moveCount}_failed`)

                // If position didn't change, explicitly check for game over
                const immediateGameOverCheck = await page.locator('#gameover').count()
                if (immediateGameOverCheck > 0) {
                    gameOver = true
                    console.log(`Game over detected after failed move ${moveCount}`)
                    break
                }
            } else {
                // Take a screenshot after successful move
                await takeScreenshotAndCopy(`move_${moveCount}_success`)
            }

            console.log(`Move ${moveCount}: Frog moved to (${newFrogPos.x}, ${newFrogPos.y})`)
            // Check for game over (we can detect this by looking for the game over text)
            const gameOverText = await page.locator('#gameover').count()
            if (gameOverText > 0) {
                gameOver = true
                console.log(`Game over detected at move ${moveCount}`)
                break
            }

            // Check for success (look for password display)
            // First check if the password element exists
            const passwordElementCount = await page.locator('#password').count()
            if (passwordElementCount > 0) {
                passwordText = (await page.locator('#password').textContent())?.trim() ?? ''
                if (passwordText && passwordText.length > 0) {
                    success = true
                    console.log(`Success detected at move ${moveCount} with password: ${passwordText}`)
                    break
                }
            }

            moveCount++

            // Use the appropriate movement interval based on the game mode
            // In static mode, we can move much faster since cars don't move
            await page.waitForTimeout(moveIntervalToUse)
        }

        // Take final screenshot regardless of outcome
        await takeScreenshotAndCopy('final')

        // Get final frog position
        const finalGameState = await getGameState()
        dataItem.finalFrogPos = getFrogPosition(finalGameState)

        if (success && passwordText) {
            // Verify the displayed password matches the expected one from tasks.jsonl
            expect(passwordText).toContain(task.password)
            dataItem.password = passwordText.trim()
        }

        // Add images to dataset
        dataItem.images = getTaskImages(datasetImagesDir, lineIndex)

        // Append game data to dataset.jsonl file
        await fs.promises.appendFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
        console.log(`Data for task #${lineIndex} written to ${datasetJsonlPath}`)

        // Fail the test if game over was detected
        if (gameOver) {
            // Using throw instead of test.fail() for immediate exit
            throw new Error("Game over - Frog hit a car")
        }

        // This test will pass if we reached success
        if (success) {
            console.log(`Successfully completed game with password: ${passwordText}`)
        }
    })
})
