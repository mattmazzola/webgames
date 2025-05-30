import { test, expect, Locator } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { 
  createDirectories, 
  loadTasksFromJsonl, 
  createScreenshotHandler, 
  getTaskImages,
  getXYOffset
} from '../helpers'

// Create directories and get paths
const { 
  screenshotDir, 
  datasetImagesDir, 
  datasetJsonlPath 
} = createDirectories('ladybird')

type LadybirdDatasetItem = {
    taskIndex: number
    images: string[]
    start_pos: { row: number, col: number }
    end_pos: { row: number, col: number }
    paths: { row: number, col: number }[]
    actions: {
        action: string,
        direction?: string,
        x_offset: number,
        y_offset: number,
    }[]
    password: string
}

type TaskData = {
    start_pos: { row: number, col: number }
    end_pos: { row: number, col: number }
    movesSequence: string
    password: string
}

// Load tasks from the JSONL file
const tasksFilePath = path.join(process.cwd(), 'webgames', 'public', 'data', 'ladybird', 'tasks.jsonl')
const tasks = loadTasksFromJsonl<TaskData>(tasksFilePath)

tasks.forEach((task, lineIndex) => {
    test(`Ladybird game task #${lineIndex}`, async ({ page }) => {
        // Set viewport to include full game area
        await page.setViewportSize({ width: 650, height: 1052 })

        // Navigate to the ladybird game with the specific lineIndex
        await page.goto(`http://localhost:5173/ladybird-custom?lineIndex=${lineIndex}`)

        // Wait for the page to load completely
        await page.waitForSelector('h1:has-text("LadyBird Planner")')

        const takeScreenshotAndCopy = createScreenshotHandler(page, screenshotDir, datasetImagesDir, lineIndex)

        // Take a screenshot of the initial game state
        await takeScreenshotAndCopy('initial')

        // Get buttons for navigation
        const downButton = page.getByRole('button', { name: '⬇️' })
        const rightButton = page.getByRole('button', { name: '➡️' })
        const upButton = page.getByRole('button', { name: '⬆️' })
        const leftButton = page.getByRole('button', { name: '⬅️' })

        const dataItem: LadybirdDatasetItem = {
            taskIndex: lineIndex,
            images: [],
            start_pos: task.start_pos,
            end_pos: task.end_pos,
            paths: [],
            actions: [],
            password: '',
        }
        dataItem.paths.push(dataItem.start_pos)

        // Split the sequence into chunks of emoji length
        const chunkSize = "⬇️".length
        const moves: string[] = []
        for (let i = 0; i < task.movesSequence.length; i += chunkSize) {
            moves.push(task.movesSequence.slice(i, i + chunkSize))
        }

        // Execute the moves in the sequence
        for (const action of moves) {
            const currentCell = dataItem.paths.at(-1)!

            let direction: string
            let buttonToClick: Locator
            let rowColChanges = [0, 0]

            switch (action) {
                case '⬇️':
                    direction = 'down'
                    buttonToClick = downButton
                    rowColChanges = [1, 0]
                    break
                case '➡️':
                    direction = 'right'
                    buttonToClick = rightButton
                    rowColChanges = [0, 1]
                    break
                case '⬆️':
                    direction = 'up'
                    buttonToClick = upButton
                    rowColChanges = [-1, 0]
                    break
                case '⬅️':
                    direction = 'left'
                    buttonToClick = leftButton
                    rowColChanges = [0, -1]
                    break
                default:
                    throw new Error(`Unknown action: ${action}`)
            }

            await buttonToClick.click()
            let [rowChange, colChange] = rowColChanges
            const nextCell = {
                row: currentCell.row + rowChange,
                col: currentCell.col + colChange,
            }
            dataItem.paths.push(nextCell)

            const { x_offset, y_offset } = await getXYOffset(buttonToClick)
            const actionItem = {
                action: "click",
                direction,
                x_offset,
                y_offset,
            }
            dataItem.actions.push(actionItem)
        }

        // Take a screenshot of the input sequence before submitting
        await takeScreenshotAndCopy('sequence')

        // Submit the solution
        const submitButton = page.getByRole('button', { name: 'Submit' })
        await submitButton.click()
        const { x_offset, y_offset } = await getXYOffset(submitButton)
        const actionItem = {
            action: "click",
            x_offset,
            y_offset,
        }
        dataItem.actions.push(actionItem)

        // Take a screenshot of the result after submitting
        await takeScreenshotAndCopy('result')

        // Check for success message or password display
        const passwordElement = page.locator('.password')
        await expect(passwordElement).toBeVisible({ timeout: 1000 })
        const passwordText = await passwordElement.textContent() ?? ''
        await expect(passwordText).toBe(task.password)

        dataItem.images = getTaskImages(datasetImagesDir, lineIndex)
        dataItem.password = passwordText.trim()

        // Append game data to dataset.jsonl file
        await fs.promises.appendFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
        console.log(`Data for task #${lineIndex} written to ${datasetJsonlPath}`)
    })
})
