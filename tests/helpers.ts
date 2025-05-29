import fs from 'fs'
import path from 'path'
import { Page, Locator } from '@playwright/test'

// Generic type for task data with password
export interface BaseTaskData {
  password: string
  [key: string]: any
}

/**
 * Create directories for screenshots and datasets
 */
export function createDirectories(gameType: string): {
  datetimeStr: string;
  screenshotDir: string;
  datasetDir: string;
  datasetImagesDir: string;
  datasetJsonlPath: string;
} {
  const datetimeStr = new Date().toISOString().slice(0, -4).replaceAll('-', '').replaceAll(':', '').replaceAll('.', '')
  const screenshotDir = `test-screenshots/${gameType}/${datetimeStr}`
  const datasetDir = `datasets/${gameType}/${gameType}_${datetimeStr}`
  const datasetImagesDir = `${datasetDir}/images`
  const datasetJsonlPath = path.join(datasetDir, 'dataset.jsonl')

  // Create directories for screenshots and dataset images
  fs.mkdirSync(screenshotDir, { recursive: true })
  fs.mkdirSync(datasetImagesDir, { recursive: true })

  // Create an empty dataset.jsonl file
  fs.writeFileSync(datasetJsonlPath, '')

  return {
    datetimeStr,
    screenshotDir,
    datasetDir,
    datasetImagesDir,
    datasetJsonlPath
  }
}

/**
 * Load tasks from a JSONL file
 */
export function loadTasksFromJsonl<T extends BaseTaskData>(filePath: string): T[] {
  const tasksContent = fs.readFileSync(filePath, 'utf8')
  const tasks: T[] = tasksContent
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('//'))
    .map((line, index) => {
      try {
        return JSON.parse(line) as T
      } catch (error) {
        console.error(`Error parsing line ${index}: ${error}`)
        return null
      }
    })
    .filter((task): task is T => task !== null)

  console.log(`Loaded ${tasks.length} tasks for testing`)
  return tasks
}

/**
 * Create a screenshot handler function for a specific task
 */
export function createScreenshotHandler(
  page: Page, 
  screenshotDir: string, 
  datasetImagesDir: string,
  lineIndex: number
) {
  let imageIndex = 1
  
  return async (imageName: string) => {
    const lineIndexStr = lineIndex.toString().padStart(2, '0')
    const imageIndexStr = imageIndex.toString().padStart(2, '0')
    const screenshotPath = `${screenshotDir}/task_${lineIndexStr}_${imageIndexStr}_${imageName}.png`
    const datasetImagePath = `${datasetImagesDir}/task_${lineIndexStr}_${imageIndexStr}_${imageName}.png`
    await page.screenshot({ path: screenshotPath, fullPage: false })
    await fs.promises.copyFile(screenshotPath, datasetImagePath)

    imageIndex += 1
  }
}

/**
 * Get image paths for the current task
 */
export function getTaskImages(datasetImagesDir: string, lineIndex: number): string[] {
  const lineIndexStr = lineIndex.toString().padStart(2, '0')
  const taskPattern = `task_${lineIndexStr}_`
  return fs.readdirSync(datasetImagesDir)
    .filter(file => file.includes(taskPattern))
    .map(file => path.join('images', file))
}

/**
 * Get the x and y offset of an element (typically for action recording)
 */
export async function getXYOffset(element: Locator) {
  const boundingBox = await element.boundingBox()
  if (!boundingBox) {
    throw new Error('Element not visible or not found')
  }
  
  const x_offset = boundingBox.x + boundingBox.width / 2
  const y_offset = boundingBox.y + boundingBox.height / 2

  return { x_offset, y_offset }
}
