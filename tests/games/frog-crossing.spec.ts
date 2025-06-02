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
}

function getFrogPosition(gameState: { grid: string[][], gridSize: number, carRows: number[] }) {
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
function identifyCarRowsFromGrid(gameState: { grid: string[][], gridSize: number, carRows: number[] }) {
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
function getCars(gameState: { grid: string[][], gridSize: number, carRows: number[] }) {
    const grid = gameState.grid;
    const cars: { x: number, y: number }[] = []
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 'C') {
                cars.push({ x, y })
            }
        }
    }
    return cars
}

// Helper function to print the game state for debugging
function printGameState(gameState: { grid: string[][], gridSize: number, carRows: number[] }) {
    const grid = gameState.grid;
    const frogPos = getFrogPosition(gameState)
    const carRows = gameState.carRows

    const gridSize = gameState.gridSize
    
    console.log("\nGame Grid State: (Size: " + gridSize + "x" + gridSize + ")")
    console.log("Car Rows: [" + carRows.join(", ") + "]")
    console.log("  " + Array.from({ length: grid[0].length }, (_, i) => i).join(" "))

    for (let y = 0; y < grid.length; y++) {
        let rowStr = y + " " + grid[y].join(" ")
        rowStr += carRows.includes(y) ? " (Car Row)" : ""
        if (y === frogPos.y) {
            rowStr += " <- Frog at (" + frogPos.x + "," + frogPos.y + ")"
        }
        console.log(rowStr)
    }
    console.log("")
}

// Game constants
const CARS_PER_ROW = 3
const MOVE_INTERVAL = 400 // Same as in the game

// Load tasks from the JSONL file
const tasksFilePath = path.join(process.cwd(), 'webgames', 'public', 'data', 'frog-crossing', 'tasks.jsonl')
const tasks = loadTasksFromJsonl<TaskData>(tasksFilePath)

tasks.forEach((task, lineIndex) => {
    test(`Frog Crossing game task #${lineIndex}`, async ({ page }) => {
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
                
                // First pass: identify car rows by finding car emojis
                const tempCarRows: number[] = [];
                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        const index = y * gridSize + x;
                        const cell = cells[index];
                        const hasCar = cell.textContent?.includes('🚙') || cell.textContent?.includes('🚗');
                        
                        if (hasCar && !tempCarRows.includes(y)) {
                            tempCarRows.push(y);
                        }
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
                    carRows
                }
            })
        }

        // Function to decide the next move based on the current game state
        function decideNextMove(gameState: { grid: string[][], gridSize: number, carRows: number[] }) {
            // Get frog position from the grid
            const frogPos = getFrogPosition(gameState)
            const gridSize = gameState.gridSize
            const carRows = gameState.carRows

            // If we're at the top row, we've won
            if (frogPos.y === 0) {
                return null
            }

            // Calculate safe moves
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

                return true
            })

            // Prioritize moving up if it's safe
            const upMove = possibleMoves.find(move => move.key === 'ArrowUp')
            if (upMove && !carRows.includes(upMove.newPos.y)) {
                return upMove.key
            }

            // If we're on a car row, try to move to a safe position
            if (carRows.includes(frogPos.y)) {
                // Try side moves
                const sideMoves = possibleMoves.filter(move =>
                    move.key === 'ArrowLeft' || move.key === 'ArrowRight')

                if (sideMoves.length > 0) {
                    // Choose randomly between side moves
                    return sideMoves[Math.floor(Math.random() * sideMoves.length)].key
                }
            }

            // If we can move up, do so even if it's onto a car row
            if (upMove) {
                return upMove.key
            }

            // If no good moves, just try any valid move
            if (possibleMoves.length > 0) {
                return possibleMoves[Math.floor(Math.random() * possibleMoves.length)].key
            }

            // No valid moves
            return null
        }

        // Wait a moment for the game to initialize
        await page.waitForTimeout(1000)

        // Take screenshot after initialization
        await takeScreenshotAndCopy('started')

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

            // Wait for the game to process the move - give it more time to detect collisions
            await page.waitForTimeout(300)

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

            // Add a small delay between moves to allow for car movement
            await page.waitForTimeout(MOVE_INTERVAL / 2)
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
