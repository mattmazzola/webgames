import { test, expect, Locator } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const datetimeStr = new Date().toISOString().slice(0, -4).replaceAll('-', '').replaceAll(':', '').replaceAll('.', '')
const screenshotDir = `test-screenshots/ladybird/${datetimeStr}`
const datasetDir = `datasets/ladybird/ladybird_${datetimeStr}`
const datasetImagesDir = `${datasetDir}/images`

let imageIndex = 1
type LadybirdDatasetItem = {
    images: string[]
    start_pos: { row: number, col: number }
    end_pos: { row: number, col: number }
    paths: { row: number, col: number }[]
    actions: { direction: string, x_offset: number, y_offset: number }[]
    password: string
}

test('Ladybird game navigation and submission', async ({ page }) => {
    // Create directories for screenshots and dataset images
    await fs.promises.mkdir(screenshotDir, { recursive: true })
    await fs.promises.mkdir(datasetImagesDir, { recursive: true })

    // Set viewport to include full game area
    await page.setViewportSize({ width: 650, height: 800 })

    // Navigate to the ladybird game
    await page.goto('http://localhost:5173/ladybird-custom')

    // Wait for the page to load completely
    await page.waitForSelector('h1:has-text("LadyBird Planner")')

    async function takeScreenshotAndCopy(imageName: string) {
        const imageIndexStr = imageIndex.toString().padStart(2, '0')
        const screenshotPath = `${screenshotDir}/${imageIndexStr}_${imageName}.png`
        const datasetImagePath = `${datasetImagesDir}/${imageIndexStr}_${imageName}.png`
        await page.screenshot({ path: screenshotPath, fullPage: true })
        await fs.promises.copyFile(screenshotPath, datasetImagePath)

        imageIndex += 1
    }

    async function getXYOffset(element: any) {
        const x_offset = await element.evaluate(el => {
            const rect = el.getBoundingClientRect()
            return rect.left + rect.width / 2
        })

        const y_offset = await element.evaluate(el => {
            const rect = el.getBoundingClientRect()
            return rect.top + rect.height / 2
        })

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
        start_pos: { col: 4, row: 0 },
        end_pos: { col: 8, row: 8 },
        paths: [
        ],
        actions: [
        ],
        password: '',
    }
    dataItem.paths.push(dataItem.start_pos)

    // Execute actions
    const movesSequence = "⬇️⬇️⬇️➡️⬇️⬇️➡️➡️⬆️➡️➡️➡️⬇️⬇️⬇️⬇️⬅️⬅️"
    // Split the sequence into chunks of emoji length
    const chunkSize = "⬇️".length
    const moves: string[] = []
    for (let i = 0; i < movesSequence.length; i += chunkSize) {
        moves.push(movesSequence.slice(i, i + chunkSize))
    }

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

    // Take a screenshot of the result after submitting
    await takeScreenshotAndCopy('result')

    // Check for success message or password display
    const passwordElement = page.locator('.password')
    await expect(passwordElement).toBeVisible({ timeout: 1000 })
    const passwordText = await passwordElement.textContent() ?? ''

    // Get image path relative to datasetDir
    const imagePaths = fs.readdirSync(datasetImagesDir).map(file => path.join('images', file))

    dataItem.images = imagePaths
    dataItem.password = passwordText.trim()

    // Write game data to dataset.jsonl file
    const datasetJsonlPath = path.join(datasetDir, 'dataset.jsonl')
    await fs.promises.writeFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
})
