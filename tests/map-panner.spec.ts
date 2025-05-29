import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { 
  createDirectories, 
  loadTasksFromJsonl, 
  createScreenshotHandler, 
  getTaskImages
} from './helpers'

// Create directories and get paths
const { 
  screenshotDir, 
  datasetImagesDir, 
  datasetJsonlPath 
} = createDirectories('map-panner')

type MapPannerDatasetItem = {
  images: string[]
  targetPos: { x: number, y: number }
  actions: {
    action: string,
    x_offset: number,
    y_offset: number,
  }[]
  password: string
  startPos: { x: number, y: number }
  endPos: { x: number, y: number }
}

type TaskData = {
  targetPos: { x: number, y: number }
  password: string
}

// Load tasks from the JSONL file
const tasksFilePath = path.join(process.cwd(), 'webgames', 'public', 'data', 'map-panner', 'tasks.jsonl')
const tasks = loadTasksFromJsonl<TaskData>(tasksFilePath)

tasks.forEach((task, lineIndex) => {
  test(`Map Panner game task #${lineIndex}`, async ({ page }) => {
    // Set viewport size for the test
    await page.setViewportSize({ width: 1024, height: 768 })

    // Navigate to the map panner game with the specific lineIndex
    await page.goto(`http://localhost:5173/map-panner-custom?lineIndex=${lineIndex}`)

    // Wait for the page to load completely
    await page.waitForSelector('h1:has-text("Map Panner")')

    const takeScreenshotAndCopy = createScreenshotHandler(page, screenshotDir, datasetImagesDir, lineIndex)

    // Take initial screenshot
    await takeScreenshotAndCopy('initial')

    // Create dataset item
    const dataItem: MapPannerDatasetItem = {
      images: [],
      targetPos: { 
        x: task.targetPos.x,
        y: task.targetPos.y
      },
      actions: [],
      password: '',
      startPos: { x: 0, y: 0 },
      endPos: { x: 0, y: 0 }
    }

    // Center of the screen for mouse
    const centerX = page.viewportSize()?.width! / 2
    const centerY = page.viewportSize()?.height! / 2

    // Starting map position is the viewport center, not (0,0)
    // When the page loads, the top-left corner of the map (0,0) is at the top-left of the viewport
    // So the center of the viewport corresponds to coordinates (centerX, centerY) on the map
    // This ensures the search circle is properly positioned based on the viewport dimensions
    let mapX = centerX
    let mapY = centerY

    // Record the initial position in the dataset
    dataItem.startPos = { x: mapX, y: mapY }

    // Calculate optimal movement size based on viewport
    // Using 1/3 of the viewport as the optimal step size to maintain control
    const viewportWidth = page.viewportSize()?.width!
    const viewportHeight = page.viewportSize()?.height!
    const optimalStepSize = Math.min(viewportWidth, viewportHeight) / 3

    // Target map position from task data
    const targetMapX = task.targetPos.x
    const targetMapY = task.targetPos.y

    // Calculate the distance to target
    const distanceToTargetX = targetMapX - mapX
    const distanceToTargetY = targetMapY - mapY

    // Calculate total Euclidean distance to target
    const totalDistance = Math.sqrt(
      Math.pow(distanceToTargetX, 2) + Math.pow(distanceToTargetY, 2)
    )

    // Use our optimal step size calculated from viewport dimensions
    // For edge cases (targets near map edges), use smaller steps for more precision
    const isEdgeTarget = targetMapX <= 300 || targetMapX >= 1700 || targetMapY <= 300 || targetMapY >= 1700
    const moveAmountPerStep = isEdgeTarget ? optimalStepSize * 0.7 : optimalStepSize

    // Calculate number of steps needed based on distance and fixed move amount
    // For edge cases, use ceil to ensure we don't undershoot
    const panSteps = isEdgeTarget
      ? Math.ceil(totalDistance / moveAmountPerStep)
      : Math.floor(totalDistance / moveAmountPerStep)

    // Calculate how much map movement we need per operation based on the distance
    // For the initial steps, we'll move by a fixed amount
    const mapMovePerOperationX = (panSteps > 0) ? (distanceToTargetX * moveAmountPerStep / totalDistance) : distanceToTargetX
    const mapMovePerOperationY = (panSteps > 0) ? (distanceToTargetY * moveAmountPerStep / totalDistance) : distanceToTargetY

    console.log(`Task #${lineIndex}: Target at (${targetMapX}, ${targetMapY}), Password: ${task.password}`)
    console.log(`Starting map position (viewport center): (${mapX}, ${mapY})`)
    console.log(`Total distance to target: ${totalDistance.toFixed(2)} pixels`)
    console.log(`Using ${panSteps} pan steps with fixed movement of ~${moveAmountPerStep} pixels per step`)
    console.log(`Each pan operation will move map by: X: ${mapMovePerOperationX.toFixed(2)}, Y: ${mapMovePerOperationY.toFixed(2)}`)
    console.log(`Starting from map position (${mapX}, ${mapY}), targeting (${targetMapX}, ${targetMapY})`)

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
    dataItem.endPos = { x: mapX, y: mapY }

    // Add a final adjustment step to reach the exact target
    const remainingDistanceX = targetMapX - mapX
    const remainingDistanceY = targetMapY - mapY
    const hasRemainingDistance = Math.abs(remainingDistanceX) > 1 || Math.abs(remainingDistanceY) > 1

    if (hasRemainingDistance) {
      console.log(`Making final adjustment to reach target. Remaining distance: X: ${remainingDistanceX.toFixed(2)}, Y: ${remainingDistanceY.toFixed(2)}`)

      await takeScreenshotAndCopy('final_adjustment_before')

      // For very large remaining distances, add an extra step to ensure we don't miss
      const isLargeRemainingDistance = Math.abs(remainingDistanceX) > 200 || Math.abs(remainingDistanceY) > 200
      if (isLargeRemainingDistance) {
        console.log(`Large remaining distance detected, adding extra intermediate step`)
        // Move halfway first
        await page.mouse.move(centerX, centerY)
        await page.mouse.down()
        await page.mouse.move(
          centerX - remainingDistanceX / 2,
          centerY - remainingDistanceY / 2,
          { steps: 10 }
        )
        await page.mouse.up()
        await page.waitForTimeout(500)

        // Update map position
        mapX += remainingDistanceX / 2
        mapY += remainingDistanceY / 2
      }

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
      dataItem.endPos = { x: mapX, y: mapY }
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
    const maxRetries = 3
    let passwordText = ''
    let retryCount = 0
    let passwordFound = false

    while (retryCount < maxRetries && !passwordFound) {
      try {
        const passwordElement = page.locator('#password')
        await expect(passwordElement).toBeVisible({ timeout: 2000 })

        // Get the password text
        passwordText = await passwordElement.textContent() ?? ''
        console.log(`Attempt ${retryCount + 1}: Found password: ${passwordText}`)

        if (passwordText.includes(task.password)) {
          passwordFound = true
        } else {
          // If password doesn't have expected content, take extra screenshot and try larger movements
          await takeScreenshotAndCopy(`retry_${retryCount + 1}_before`)

          // Try a more methodical approach based on which attempt this is
          let moveX = 0
          let moveY = 0

          // For edge targets, make more deliberate movements in different directions
          if (retryCount === 0) {
            // First retry: move slightly to the center from possible edge
            moveX = targetMapX < 1000 ? 50 : -50
            moveY = targetMapY < 1000 ? 50 : -50
          } else if (retryCount === 1) {
            // Second retry: larger movement toward target
            moveX = targetMapX - mapX > 0 ? 100 : -100
            moveY = targetMapY - mapY > 0 ? 100 : -100
          } else {
            // Later retries: use larger random movements
            moveX = Math.floor(Math.random() * 200) - 100
            moveY = Math.floor(Math.random() * 200) - 100
          }

          await page.mouse.move(centerX, centerY)
          await page.mouse.down()
          await page.mouse.move(centerX + moveX, centerY + moveY, { steps: 5 })
          await page.mouse.up()

          console.log(`Retry ${retryCount + 1} - Moving by (${moveX}, ${moveY})`)
          await takeScreenshotAndCopy(`retry_${retryCount + 1}_after`)
          await page.waitForTimeout(500)
        }
      } catch (error) {
        console.log(`Attempt ${retryCount + 1}: Password element not found or error occurred: ${error}`)
        await page.waitForTimeout(500)
      }

      retryCount++
    }

    console.log(`Final password result: ${passwordText}`)

    // If we didn't find the password, make one last attempt direct movement
    if (!passwordFound && passwordText === '') {
      console.log(`Password not found after all retries, making one final large movement attempt`)

      // Calculate vector to target and make a direct movement there
      const finalMoveX = targetMapX - mapX
      const finalMoveY = targetMapY - mapY

      // Make a decisive movement directly to target
      await page.mouse.move(centerX, centerY)
      await page.mouse.down()
      await page.mouse.move(centerX - finalMoveX, centerY - finalMoveY, { steps: 5 })
      await page.mouse.up()
      await page.waitForTimeout(500)

      // Try one more time to get the password
      try {
        const passwordElement = page.locator('#password')
        await expect(passwordElement).toBeVisible({ timeout: 1000 })
        passwordText = await passwordElement.textContent() ?? ''
        console.log(`Final attempt: Password now shows: ${passwordText}`)
      } catch (error) {
        console.log(`Final attempt: Password still not visible`)
      }
    }

    expect(passwordText).toContain(task.password)

    dataItem.images = getTaskImages(datasetImagesDir, lineIndex)
    dataItem.password = passwordText.trim()

    // Append game data to dataset.jsonl file
    await fs.promises.appendFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
    console.log(`Data for task #${lineIndex} written to ${datasetJsonlPath}`)
  })
})
