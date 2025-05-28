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
  
  // Calculate optimal movement size based on viewport
  // Using 1/3 of the viewport as the optimal step size to maintain control
  const viewportWidth = page.viewportSize()?.width!
  const viewportHeight = page.viewportSize()?.height!
  const optimalStepSize = Math.min(viewportWidth, viewportHeight) / 3

  // Target map position 
  const targetMapX = 1500
  const targetMapY = 1200

  // Calculate the distance to target
  const distanceToTargetX = targetMapX - mapX
  const distanceToTargetY = targetMapY - mapY
  
  // Calculate total Euclidean distance to target
  const totalDistance = Math.sqrt(
    Math.pow(distanceToTargetX, 2) + Math.pow(distanceToTargetY, 2)
  )
  
  // Use our optimal step size calculated from viewport dimensions
  const moveAmountPerStep = optimalStepSize
  
  // Calculate number of steps needed based on distance and fixed move amount
  // Using floor instead of ceil to ensure we do slightly fewer steps than required
  const panSteps = Math.floor(totalDistance / moveAmountPerStep)
  
  // Calculate how much map movement we need per operation based on the distance
  // For the initial steps, we'll move by a fixed amount
  const mapMovePerOperationX = (panSteps > 0) ? (distanceToTargetX * moveAmountPerStep / totalDistance) : distanceToTargetX
  const mapMovePerOperationY = (panSteps > 0) ? (distanceToTargetY * moveAmountPerStep / totalDistance) : distanceToTargetY

  console.log(`Total distance to target: ${totalDistance.toFixed(2)} pixels`)
  console.log(`Using ${panSteps} pan steps with fixed movement of ~${moveAmountPerStep} pixels per step`)
  console.log(`Each pan operation will move map by: X: ${mapMovePerOperationX.toFixed(2)}, Y: ${mapMovePerOperationY.toFixed(2)}`)
  console.log(`Starting from map position (${mapX}, ${mapY}), targeting (${targetMapX}, ${targetMapY})`)

  // Record the initial position in the dataset
  dataItem.start_pos = { x: mapX, y: mapY }

  for (let i = 0; i < panSteps; i++) {
    await takeScreenshotAndCopy(`pan_${i + 1}_before`)

    // Move mouse to center of screen for each pan operation
    await page.mouse.move(centerX, centerY)
    dataItem.actions.push({
      action: 'mousemove',
      x_offset: centerX,
      y_offset: centerY
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

    console.log(`Pan operation ${i + 1}/${panSteps}: Mouse from (${centerX}, ${centerY}) to (${mouseEndX.toFixed(2)}, ${mouseEndY.toFixed(2)})`)
    console.log(`Map now at approximately: (${mapX.toFixed(2)}, ${mapY.toFixed(2)})`)

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

  // Add a final adjustment step to reach the exact target
  const remainingDistanceX = targetMapX - mapX
  const remainingDistanceY = targetMapY - mapY
  const hasRemainingDistance = Math.abs(remainingDistanceX) > 1 || Math.abs(remainingDistanceY) > 1

  if (hasRemainingDistance) {
    console.log(`Making final adjustment to reach target. Remaining distance: X: ${remainingDistanceX.toFixed(2)}, Y: ${remainingDistanceY.toFixed(2)}`)
    
    await takeScreenshotAndCopy('final_adjustment_before')
    
    // Move mouse to center of screen for final adjustment
    await page.mouse.move(centerX, centerY)
    dataItem.actions.push({
      action: 'mousemove',
      x_offset: centerX,
      y_offset: centerY
    })
    
    // Simulate mouse down to start panning
    await page.mouse.down()
    dataItem.actions.push({
      action: 'mousedown',
      x_offset: centerX,
      y_offset: centerY
    })
    
    // Move the map by dragging in opposite direction of remaining distance
    const finalMouseEndX = centerX - remainingDistanceX
    const finalMouseEndY = centerY - remainingDistanceY
    
    await page.mouse.move(finalMouseEndX, finalMouseEndY, { steps: 10 })
    dataItem.actions.push({
      action: 'mousemove',
      x_offset: finalMouseEndX,
      y_offset: finalMouseEndY
    })
    
    // Update map position (should now be exactly at target)
    mapX = targetMapX
    mapY = targetMapY
    
    // Release mouse and wait a moment
    await page.mouse.up()
    dataItem.actions.push({
      action: 'mouseup',
      x_offset: finalMouseEndX,
      y_offset: finalMouseEndY
    })
    
    await takeScreenshotAndCopy('final_adjustment_after')
    await page.waitForTimeout(500)
    
    // Update the end position in the dataset
    dataItem.end_pos = { x: mapX, y: mapY }
  }

  console.log(`Final map position: (${mapX.toFixed(2)}, ${mapY.toFixed(2)})`)
  console.log(`Target was: (${targetMapX}, ${targetMapY})`)
  
  // Calculate how close we got to the target
  const finalDistanceToTarget = Math.sqrt(
    Math.pow(targetMapX - mapX, 2) + Math.pow(targetMapY - mapY, 2)
  )
  console.log(`Distance to target after panning: ${finalDistanceToTarget.toFixed(2)} pixels`)

  // Take a screenshot to verify we've found the treasure
  await takeScreenshotAndCopy('found')

  // Add a retry mechanism with multiple attempts to find the password element
  const maxRetries = 3;
  let passwordText = '';
  let retryCount = 0;
  let passwordFound = false;

  while (retryCount < maxRetries && !passwordFound) {
    try {
      const passwordElement = page.locator('#password');
      await expect(passwordElement).toBeVisible({ timeout: 3000 });
      
      // Get the password text
      passwordText = await passwordElement.textContent() ?? '';
      console.log(`Attempt ${retryCount + 1}: Found password: ${passwordText}`);
      
      if (passwordText.includes('CARTOGRAPHER2024_CUSTOM')) {
        passwordFound = true;
      } else {
        // If password doesn't have expected content, take extra screenshot and try small movement
        await takeScreenshotAndCopy(`retry_${retryCount + 1}_before`);
        
        // Make a small random movement to trigger any missing events
        const randomOffsetX = Math.floor(Math.random() * 50) - 25;
        const randomOffsetY = Math.floor(Math.random() * 50) - 25;
        
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.mouse.move(centerX + randomOffsetX, centerY + randomOffsetY, { steps: 5 });
        await page.mouse.up();
        
        await takeScreenshotAndCopy(`retry_${retryCount + 1}_after`);
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log(`Attempt ${retryCount + 1}: Password not found yet. Retrying...`);
      await page.waitForTimeout(1000);
    }
    
    retryCount++;
  }

  console.log(`Final password result: ${passwordText}`);
  expect(passwordText).toContain('CARTOGRAPHER2024_CUSTOM'); // The password from the source code

  // Store the password in the dataset item
  dataItem.password = passwordText

  // Get the image paths for the dataset
  dataItem.images = fs.readdirSync(datasetImagesDir)
    .map(file => path.join('images', file))

  // Append game data to dataset.jsonl file
  await fs.promises.appendFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
  console.log(`Data written to ${datasetJsonlPath}`)
})
