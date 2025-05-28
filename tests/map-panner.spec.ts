import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const datetimeStr = new Date().toISOString().slice(0, -4).replaceAll('-', '').replaceAll(':', '').replaceAll('.', '')
const screenshotDir = `test-screenshots/map-panner/${datetimeStr}`
const datasetDir = `datasets/map-panner/map_panner_${datetimeStr}`
const datasetImagesDir = `${datasetDir}/images`
const datasetJsonlPath = path.join(datasetDir, 'dataset.jsonl')

// Create directories for screenshots and dataset images
fs.mkdirSync(screenshotDir, { recursive: true })
fs.mkdirSync(datasetImagesDir, { recursive: true })

// Create an empty dataset.jsonl file
fs.writeFileSync(datasetJsonlPath, '')

type MapPannerDatasetItem = {
  images: string[]
  start_pos: { x: number, y: number }
  end_pos: { x: number, y: number }
  actions: {
    action: string,
    x_offset: number,
    y_offset: number,
  }[]
  password: string
}

test('Map Panner game - find treasure coordinates', async ({ page }) => {
  // Reset imageIndex for each test
  let imageIndex = 1

  // Set viewport size for the test
  await page.setViewportSize({ width: 1024, height: 768 })

  // Navigate to the map panner game
  await page.goto('http://localhost:5173/map-panner-custom')

  // Wait for the page to load completely
  await page.waitForSelector('h1:has-text("Map Panner")')

  async function takeScreenshotAndCopy(imageName: string) {
    const imageIndexStr = imageIndex.toString().padStart(2, '0')
    const screenshotPath = `${screenshotDir}/${imageIndexStr}_${imageName}.png`
    const datasetImagePath = `${datasetImagesDir}/${imageIndexStr}_${imageName}.png`
    await page.screenshot({ path: screenshotPath, fullPage: false })
    await fs.promises.copyFile(screenshotPath, datasetImagePath)

    imageIndex += 1
  }

  // Take initial screenshot
  await takeScreenshotAndCopy('initial')

  // Create dataset item
  const dataItem: MapPannerDatasetItem = {
    images: [],
    start_pos: { x: 0, y: 0 },
    end_pos: { x: 0, y: 0 },
    actions: [],
    password: ''
  }

  // Starting map position (this is an estimate as we don't know the exact map position)
  let mapX = 500
  let mapY = 400

  // Center of the screen for mouse
  const centerX = page.viewportSize()?.width! / 2
  const centerY = page.viewportSize()?.height! / 2

  // Target map position 
  const targetMapX = 1500 + 500
  const targetMapY = 1200

  const panSteps = 8

  // Calculate the distance to target
  const distanceToTargetX = targetMapX - mapX
  const distanceToTargetY = targetMapY - mapY

  // Calculate how much map movement we need per operation based on the distance
  const mapMovePerOperationX = distanceToTargetX / panSteps
  const mapMovePerOperationY = distanceToTargetY / panSteps

  console.log(`Distance to target: (${distanceToTargetX}, ${distanceToTargetY})`)
  console.log(`Each pan operation should move map by approximately: (${mapMovePerOperationX}, ${mapMovePerOperationY})`)
  console.log(`Starting pan: Map position (${mapX}, ${mapY}), target (${targetMapX}, ${targetMapY})`)
  console.log(`Mouse center: (${centerX}, ${centerY})`)

  // Record the initial position in the dataset
  dataItem.start_pos = { x: mapX, y: mapY }

  for (let i = 0; i < panSteps; i++) {
    await takeScreenshotAndCopy(`pan_${i + 1}_before`)

    // Move mouse to center of screen for each pan operation
    await page.mouse.move(centerX, centerX)
    dataItem.actions.push({
      action: 'mousemove',
      x_offset: centerX,
      y_offset: centerX
    })

    // Simulate mouse down to start panning
    await page.mouse.down()
    dataItem.actions.push({
      action: 'mousedown',
      x_offset: centerX,
      y_offset: centerY
    })

    // Move the map by dragging in opposite direction of the target
    const mouseEndX = centerX - mapMovePerOperationX
    const mouseEndY = centerY - mapMovePerOperationY

    await page.mouse.move(mouseEndX, mouseEndY, { steps: 10 })
    dataItem.actions.push({
      action: 'mousemove',
      x_offset: mouseEndX,
      y_offset: mouseEndY
    })

    // Update map position (moves in opposite direction of mouse)
    mapX += mapMovePerOperationX
    mapY += mapMovePerOperationY

    console.log(`Pan operation ${i + 1}: Mouse from (${centerX}, ${centerY}) to (${mouseEndX}, ${mouseEndY})`)
    console.log(`Map now at approximately: (${mapX}, ${mapY})`)

    // Release mouse and wait a moment between operations
    await page.mouse.up()
    dataItem.actions.push({
      action: 'mouseup',
      x_offset: mouseEndX,
      y_offset: mouseEndY
    })

    await takeScreenshotAndCopy(`pan_${i + 1}_after`)
    await page.waitForTimeout(500)
  }

  // Record the end map position (where we've panned to)
  dataItem.end_pos = { x: mapX, y: mapY }

  console.log(`Final map position: (${mapX}, ${mapY})`)
  console.log(`Target was: (${targetMapX}, ${targetMapY})`)

  // Take a screenshot to verify we've found the treasure
  await takeScreenshotAndCopy('found')

  const passwordElement = page.locator('#password')
  await expect(passwordElement).toBeVisible({ timeout: 1000 })

  // Get and check the password
  const passwordText = await passwordElement.textContent() ?? ''
  console.log(`Found password: ${passwordText}`)

  expect(passwordText).toContain('CARTOGRAPHER2024_CUSTOM') // The password from the source code

  // Store the password in the dataset item
  dataItem.password = passwordText

  // Get the image paths for the dataset
  dataItem.images = fs.readdirSync(datasetImagesDir)
    .map(file => path.join('images', file))

  // Append game data to dataset.jsonl file
  await fs.promises.appendFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
  console.log(`Data written to ${datasetJsonlPath}`)
})
