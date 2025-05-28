import { test, expect, Locator } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const datetimeStr = new Date().toISOString().slice(0, -4).replaceAll('-', '').replaceAll(':', '').replaceAll('.', '')
const screenshotDir = `test-screenshots/ladybird/${datetimeStr}`
const datasetDir = `datasets/ladybird/ladybird_${datetimeStr}`
const datasetImagesDir = `${datasetDir}/images`
const datasetJsonlPath = path.join(datasetDir, 'dataset.jsonl')

// Create directories for screenshots and dataset images
fs.mkdirSync(screenshotDir, { recursive: true })
fs.mkdirSync(datasetImagesDir, { recursive: true })

// Create an empty dataset.jsonl file
fs.writeFileSync(datasetJsonlPath, '')

type LadybirdDatasetItem = {
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
const tasksContent = fs.readFileSync(tasksFilePath, 'utf8')
const tasks: TaskData[] = tasksContent
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('//'))
    .map((line, index) => {
        try {
            return JSON.parse(line)
        } catch (error) {
            console.error(`Error parsing line ${index}: ${error}`)
            return null
        }
    })
    .filter(task => task !== null)

tasks.forEach((task, lineIndex) => {
    test(`Ladybird game task #${lineIndex}`, async ({ page }) => {
        // Reset imageIndex for each test
        let imageIndex = 1

        // Set viewport to include full game area
        await page.setViewportSize({ width: 650, height: 1052 })

        // Navigate to the ladybird game with the specific lineIndex
        await page.goto(`http://localhost:5173/ladybird-custom?lineIndex=${lineIndex}`)

        // Wait for the page to load completely
        await page.waitForSelector('h1:has-text("LadyBird Planner")')

        async function takeScreenshotAndCopy(imageName: string) {
            const lineIndexStr = lineIndex.toString().padStart(2, '0')
            const imageIndexStr = imageIndex.toString().padStart(2, '0')
            const screenshotPath = `${screenshotDir}/task_${lineIndexStr}_${imageIndexStr}_${imageName}.png`
            const datasetImagePath = `${datasetImagesDir}/task_${lineIndexStr}_${imageIndexStr}_${imageName}.png`
            await page.screenshot({ path: screenshotPath, fullPage: false })
            await fs.promises.copyFile(screenshotPath, datasetImagePath)

            imageIndex += 1
        }

        async function getXYOffset(element: any) {
            const boundingBox = await element.boundingBox()
            const x_offset = boundingBox.x + boundingBox.width / 2
            const y_offset = boundingBox.y + boundingBox.height / 2

            return { x_offset, y_offset }
        }

        // Take a screenshot of the initial game state
        await takeScreenshotAndCopy('initial')

        // Get buttons for navigation
        const downButton = page.getByRole('button', { name: '⬇️' })
        const rightButton = page.getByRole('button', { name: '➡️' })
        const upButton = page.getByRole('button', { name: '⬆️' })
        const leftButton = page.getByRole('button', { name: '⬅️' })

        const dataItem: LadybirdDatasetItem = {
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

        // Get only this task's images
        const lineIndexStr = lineIndex.toString().padStart(2, '0')
        const taskPattern = `task_${lineIndexStr}_`
        const imagePaths = fs.readdirSync(datasetImagesDir)
            .filter(file => file.includes(taskPattern))
            .map(file => path.join('images', file))

        // Include images and password in the data item
        dataItem.images = imagePaths
        dataItem.password = passwordText.trim()

        // Append game data to shared dataset.jsonl file
        await fs.promises.appendFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
    })
})
