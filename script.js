window.addEventListener("load", () => {
  const loadingOverlay = document.getElementById("loadingOverlay")
  if (loadingOverlay) {
    loadingOverlay.style.display = "none"
  }
})

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const totalMemoryInput = document.getElementById("totalMemory")
  const numJobsInput = document.getElementById("numJobs")
  const generateTableBtn = document.getElementById("generateTableBtn")
  const jobTableBody = document.querySelector("#jobTable tbody")
  const startSimulationBtn = document.getElementById("startSimulation")
  const resetSimulationBtn = document.getElementById("resetSimulation")
  const timerElement = document.getElementById("timer")
  const memoryVisualizationElement = document.getElementById("memoryVisualization")
  const memoryTotalElement = document.getElementById("memoryTotal")
  const memoryUsedElement = document.getElementById("memoryUsed")
  const memoryFreeElement = document.getElementById("memoryFree")
  const eventLogElement = document.getElementById("eventLog")
  const visualizationContainer = document.querySelector(".visualization-container")

  // Constants
  const OS_KERNEL_SIZE = 10 // KB
  const COLOR_PALETTE = [
    "#00FFFF",
    "#FF00FF",
    "#FFFF00",
    "#00FF00",
    "#FF5500",
    "#00CCFF",
    "#FF00CC",
    "#CCFF00",
    "#00FF99",
    "#FF0055",
    "#0088FF",
    "#FF0088",
    "#88FF00",
    "#0088FF",
    "#FF0088",
  ]

  // State variables
  let jobs = []
  let memorySlots = []
  let totalMemory = 0
  let timer = null
  let currentTime = 0
  let simulationRunning = false
  let simulationPaused = false
  let speedMultiplier = 1 // Default speed
  let jobPositions = {} // To track job positions for animation
  let rejectedJobs = new Set() // Track jobs that have been rejected due to size
  let actualStartTimes = {} // Track when jobs actually start running
  let lastLoggedTime = -1 // Track the last time we logged running jobs

  // Initialize the application
  function init() {
    generateTableBtn.addEventListener("click", generateJobTable)
    startSimulationBtn.addEventListener("click", startSimulation)
    resetSimulationBtn.addEventListener("click", resetSimulation)
    document.getElementById("pauseSimulation").addEventListener("click", togglePause)

    // Create and add speed control to stats bar
    createSpeedControlInStatsBar()

    // Set minimum total memory to account for OS kernel
    totalMemoryInput.min = OS_KERNEL_SIZE + 10

    // Update memory stats initially
    updateMemoryStats()
  }

  // Create speed control in stats bar
  function createSpeedControlInStatsBar() {
    const statsBar = document.querySelector(".stats-bar")

    // Create speed control container
    const speedControlContainer = document.createElement("div")
    speedControlContainer.classList.add("speed-control")

    // Create speed label
    const speedLabel = document.createElement("label")
    speedLabel.textContent = "Speed: "
    speedLabel.setAttribute("for", "speedControl")

    // Create speed slider
    const speedSlider = document.createElement("input")
    speedSlider.type = "range"
    speedSlider.id = "speedControl"
    speedSlider.min = "0.1"
    speedSlider.max = "5"
    speedSlider.step = "0.1"
    speedSlider.value = "1"

    // Create speed value display
    const speedValue = document.createElement("span")
    speedValue.id = "speedValue"
    speedValue.textContent = "1x"

    // Add event listener to speed slider
    speedSlider.addEventListener("input", function () {
      speedMultiplier = Number.parseFloat(this.value)
      speedValue.textContent = speedMultiplier + "x"

      // If simulation is running, restart it with new speed
      if (simulationRunning && !simulationPaused) {
        clearInterval(timer)
        timer = setInterval(updateSimulation, 100 / speedMultiplier)
      }
    })

    // Append elements to speed control container
    speedControlContainer.appendChild(speedLabel)
    speedControlContainer.appendChild(speedSlider)
    speedControlContainer.appendChild(speedValue)

    // Insert speed control at the end of the stats bar
    statsBar.appendChild(speedControlContainer)
  }

  // Toggle pause/resume simulation
  function togglePause() {
    const pauseButton = document.getElementById("pauseSimulation")

    if (!simulationRunning) {
      return
    }

    if (simulationPaused) {
      // Resume simulation
      simulationPaused = false
      pauseButton.textContent = "Pause"
      pauseButton.classList.remove("resume")
      timer = setInterval(updateSimulation, 100 / speedMultiplier)
      logEvent("Simulation resumed")
    } else {
      // Pause simulation
      simulationPaused = true
      pauseButton.textContent = "Resume"
      pauseButton.classList.add("resume")
      clearInterval(timer)
      logEvent("Simulation paused")
    }
  }

  // Generate the job table based on user input
  function generateJobTable() {
    const numJobs = Number.parseInt(numJobsInput.value)
    totalMemory = Number.parseInt(totalMemoryInput.value)

    // Check if numJobs is a number and greater than 0
    if (isNaN(numJobs) || numJobs <= 0) {
      alert("Please enter a valid number of jobs (greater than 0).")
      numJobsInput.focus() // Focus the input box for correction
      return
    }

    // Check if totalMemory is a number and valid
    if (isNaN(totalMemory) || totalMemory < OS_KERNEL_SIZE + 10) {
      alert("Total memory must be at least " + (OS_KERNEL_SIZE + 10) + " KB.")
      totalMemoryInput.focus() // Focus the input box for correction
      return
    }

    // Initialize jobs array
    jobs = []
    jobPositions = {} // Reset job positions
    rejectedJobs = new Set() // Reset rejected jobs
    actualStartTimes = {} // Reset actual start times
    lastLoggedTime = -1 // Reset last logged time

    for (let i = 0; i < numJobs; i++) {
      const jobId = "Job-" + (i + 1)
      jobs.push({
        id: jobId,
        size: 0,
        loadingTime: 0,
        finishTime: 0,
        status: "waiting",
        position: -1,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      })
      jobPositions[jobId] = -1 // Initialize position tracking
    }

    renderJobTable()
    initMemoryVisualization()

    startSimulationBtn.disabled = false
    resetSimulationBtn.disabled = false
    document.getElementById("pauseSimulation").disabled = true

    updateMemoryStats()
    logEvent("System initialized with " + totalMemory + " KB memory and " + numJobs + " jobs")

    // Automatically focus the first job's size cell after generating the table
    setTimeout(() => {
      const firstSizeCell = document.querySelector('td[data-field="size"][data-index="0"]')
      if (firstSizeCell) {
        firstSizeCell.click()
      }
    }, 0)
  }

  // Render the job table
  function renderJobTable() {
    jobTableBody.innerHTML = ""

    jobs.forEach((job, index) => {
      const row = document.createElement("tr")

      // Add class for rejected jobs
      if (rejectedJobs.has(job.id)) {
        row.classList.add("rejected-job")
      }

      // Job ID (not editable)
      const idCell = document.createElement("td")
      idCell.textContent = job.id
      row.appendChild(idCell)

      // Job Size (editable, with "KB" display)
      const sizeCell = document.createElement("td")
      sizeCell.textContent = `${job.size} KB`
      sizeCell.classList.add("editable")
      sizeCell.dataset.field = "size"
      sizeCell.dataset.index = index
      sizeCell.addEventListener("click", editCell)
      row.appendChild(sizeCell)

      // Loading Time (editable, with "msec" display)
      const loadingTimeCell = document.createElement("td")
      loadingTimeCell.textContent = `${job.loadingTime} msec`
      loadingTimeCell.classList.add("editable")
      loadingTimeCell.dataset.field = "loadingTime"
      loadingTimeCell.dataset.index = index
      loadingTimeCell.addEventListener("click", editCell)
      row.appendChild(loadingTimeCell)

      // Finish Time (editable, with "msec" display)
      const finishTimeCell = document.createElement("td")
      finishTimeCell.textContent = `${job.finishTime} msec`
      finishTimeCell.classList.add("editable")
      finishTimeCell.dataset.field = "finishTime"
      finishTimeCell.dataset.index = index
      finishTimeCell.addEventListener("click", editCell)
      row.appendChild(finishTimeCell)

      // Status column (new)
      const statusCell = document.createElement("td")
      statusCell.textContent = rejectedJobs.has(job.id) ? "Rejected" : job.status
      statusCell.classList.add("status-cell")
      if (rejectedJobs.has(job.id)) {
        statusCell.classList.add("rejected")
      } else if (job.status === "running") {
        statusCell.classList.add("running")
      } else if (job.status === "finished") {
        statusCell.classList.add("finished")
      }
      row.appendChild(statusCell)

      jobTableBody.appendChild(row)
    })
  }

  // Make a cell editable
  function editCell(event) {
    if (simulationRunning) return

    const cell = event.target
    const field = cell.dataset.field
    const index = Number.parseInt(cell.dataset.index)

    const input = document.createElement("input")
    input.type = "number"
    input.value = jobs[index][field]
    input.style.width = "100%"
    input.autofocus = true // Add this to automatically focus the input

    cell.textContent = ""
    cell.appendChild(input)
    input.focus()

    input.addEventListener("blur", () => {
      const value = Number.parseInt(input.value)
      let isValid = true

      // Validation rules
      if (isNaN(value)) {
        isValid = false
        input.value = ""
        input.placeholder = "Enter a number"
      } else if ((field === "size" || field === "finishTime") && value <= 0) {
        isValid = false
        input.value = ""
        input.placeholder = "Must be > 0"
      } else if (field === "loadingTime" && value < 0) {
        isValid = false
        input.value = ""
        input.placeholder = "Must be ≥ 0"
      }

      if (!isValid) {
        input.classList.add("invalid")
        return
      }

      // Valid input
      jobs[index][field] = value
      const unit = field === "size" ? "KB" : "msec"
      cell.textContent = `${value} ${unit}`
      cell.addEventListener("click", editCell)
    })

    input.addEventListener("input", () => {
      input.placeholder = ""
      input.classList.remove("invalid")
    })

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = Number.parseInt(input.value)
        let isValid = true

        // Same validation as blur
        if (isNaN(value)) {
          isValid = false
          input.value = ""
          input.placeholder = "Enter a number"
        } else if ((field === "size" || field === "finishTime") && value <= 0) {
          isValid = false
          input.value = ""
          input.placeholder = "Must be > 0"
        } else if (field === "loadingTime" && value < 0) {
          isValid = false
          input.value = ""
          input.placeholder = "Must be ≥ 0"
        }

        if (!isValid) {
          input.classList.add("invalid")
          return
        }

        // If valid, update the value
        jobs[index][field] = value
        const unit = field === "size" ? "KB" : "msec"
        cell.textContent = `${value} ${unit}`
        cell.addEventListener("click", editCell)

        // Check if this is the last cell (finish time of the last job)
        if (field === "finishTime" && index === jobs.length - 1) {
          input.blur() // Remove focus
        } else {
          // Move to the next cell
          const nextFieldOrder = ["size", "loadingTime", "finishTime"]
          const currentFieldIndex = nextFieldOrder.indexOf(field)
          let nextFieldIndex = currentFieldIndex + 1
          let nextRowIndex = index

          // If we're at the last field, move to next job's first field
          if (nextFieldIndex >= nextFieldOrder.length) {
            nextFieldIndex = 0
            nextRowIndex = index + 1
          }

          // If we're at the last job, wrap around to first job
          if (nextRowIndex >= jobs.length) {
            nextRowIndex = 0
          }

          // Find the next cell to focus
          const nextCell = document.querySelector(
            `td[data-field="${nextFieldOrder[nextFieldIndex]}"][data-index="${nextRowIndex}"]`,
          )
          if (nextCell) {
            nextCell.click() // Trigger edit on next cell
          }
        }
      }
    })

    cell.removeEventListener("click", editCell)
  }

  // Initialize memory visualization
  function initMemoryVisualization() {
    memoryVisualizationElement.innerHTML = ""

    // Create memory slots container
    const memorySlotsContainer = document.createElement("div")
    memorySlotsContainer.style.width = "100%"
    memorySlotsContainer.style.position = "relative"

    // Create OS kernel slot
    const osKernelSlot = document.createElement("div")
    osKernelSlot.classList.add("memory-slot", "os-kernel")
    osKernelSlot.style.height = `${(OS_KERNEL_SIZE / totalMemory) * 500}px` // Scale to 500px
    osKernelSlot.textContent = "OS Kernel"
    memorySlotsContainer.appendChild(osKernelSlot)

    // Create free space slot
    const freeSpaceSlot = document.createElement("div")
    freeSpaceSlot.classList.add("memory-slot", "free-space")
    freeSpaceSlot.style.height = `${((totalMemory - OS_KERNEL_SIZE) / totalMemory) * 500}px`
    freeSpaceSlot.textContent = "Free Space"
    memorySlotsContainer.appendChild(freeSpaceSlot)

    // Add the slots container to memory visualization
    memoryVisualizationElement.appendChild(memorySlotsContainer)

    // Initialize memory slots
    memorySlots = [
      { type: "os", size: OS_KERNEL_SIZE, jobId: null },
      { type: "free", size: totalMemory - OS_KERNEL_SIZE, jobId: null },
    ]
  }

  // Ensure all free memory spaces are at the bottom
  function bubbleFreeSpaces() {
    // First, collect all slots by type
    const osSlot = memorySlots.find((slot) => slot.type === "os")
    const jobSlots = memorySlots.filter((slot) => slot.type === "job")
    const freeSlots = memorySlots.filter((slot) => slot.type === "free")

    // Calculate total free memory
    const totalFreeMemory = freeSlots.reduce((acc, slot) => acc + slot.size, 0)

    // Create new memory slots array
    const newMemorySlots = []

    // Add OS kernel first
    if (osSlot) {
      newMemorySlots.push(osSlot)
    }

    // Add all job slots
    jobSlots.forEach((slot, index) => {
      newMemorySlots.push(slot)

      // Update job position
      const job = jobs.find((j) => j.id === slot.jobId)
      if (job) {
        job.position = newMemorySlots.length - 1
        jobPositions[job.id] = newMemorySlots.length - 1
      }
    })

    // Add a single consolidated free slot at the end if there's any free memory
    if (totalFreeMemory > 0) {
      newMemorySlots.push({
        type: "free",
        size: totalFreeMemory,
        jobId: null,
      })
    }

    // Replace memory slots
    memorySlots = newMemorySlots
  }

  // Update memory visualization with animation
  function updateMemoryVisualization() {
    bubbleFreeSpaces()

    memoryVisualizationElement.innerHTML = ""
    const container = document.createElement("div")
    container.style.width = "100%"

    memorySlots.forEach((slot, index) => {
      const slotElement = document.createElement("div")
      slotElement.classList.add("memory-slot")

      const heightPercentage = (slot.size / totalMemory) * 500 // Scale to 500px
      slotElement.style.height = `${heightPercentage}px`
      slotElement.style.width = "100%"

      if (slot.type === "os") {
        slotElement.classList.add("os-kernel")
        slotElement.textContent = "OS Kernel"
      } else if (slot.type === "job") {
        const job = jobs.find((j) => j.id === slot.jobId)
        slotElement.classList.add("job")
        slotElement.style.backgroundColor = job.color
        slotElement.textContent = `${job.id} (${slot.size}KB)`

        // Add swap animation if the job has moved
        if (jobPositions[job.id] !== undefined && jobPositions[job.id] !== index) {
          slotElement.classList.add("job-swap")
        }
        jobPositions[job.id] = index // Update position
      } else {
        slotElement.classList.add("free-space")
        slotElement.textContent = `Free (${slot.size}KB)`
      }

      container.appendChild(slotElement)
    })

    memoryVisualizationElement.appendChild(container)
  }

  // Update memory statistics
  function updateMemoryStats() {
    memoryTotalElement.textContent = totalMemory

    let usedMemory = OS_KERNEL_SIZE

    if (memorySlots.length > 0) {
      usedMemory = memorySlots.reduce((acc, slot) => {
        return acc + (slot.type !== "free" ? slot.size : 0)
      }, 0)
    }

    const freeMemory = totalMemory - usedMemory

    memoryUsedElement.textContent = usedMemory
    memoryFreeElement.textContent = freeMemory
  }

  // Log an event
  function logEvent(message) {
    const timeStamp = currentTime
    const logEntry = document.createElement("div")
    logEntry.classList.add("event-log-entry")
    logEntry.textContent = `[${timeStamp} ms] ${message}`
    eventLogElement.prepend(logEntry)
  }

  // Log the status of all running jobs
  function logRunningJobs() {
    if (currentTime !== lastLoggedTime) {
      lastLoggedTime = currentTime

      // Get all running jobs
      const runningJobs = jobs.filter((job) => job.status === "running")

      if (runningJobs.length > 0) {
        // Create a message with all running jobs
        const jobsList = runningJobs.map((job) => job.id).join(", ")
        logEvent(`${jobsList} - running`)
      }
    }
  }

  // Function to validate the job inputs are valid before starting simulation
  function validateJobInputs() {
    let isValid = true

    // Check each job has valid parameters
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]

      if (job.size <= 0) {
        logEvent(`Error: ${job.id} has invalid size (must be > 0)`)
        isValid = false
      }

      if (job.size > totalMemory) {
        logEvent(`Error: ${job.id} has invalid size (exceeds total memory of ${totalMemory} KB)`)
        isValid = false
      }

      if (job.finishTime <= 0) {
        logEvent(`Error: ${job.id} has invalid finish time (must be > 0)`)
        isValid = false
      }

      if (job.loadingTime < 0) {
        logEvent(`Error: ${job.id} has invalid loading time (must be >= 0)`)
        isValid = false
      }
    }

    return isValid
  }

  // Check if a job is too large to ever fit in memory
  function isJobTooLarge(job) {
    // Maximum available memory is total memory minus OS kernel
    const maxAvailableMemory = totalMemory - OS_KERNEL_SIZE
    return job.size > maxAvailableMemory
  }

  // Start the simulation
  function startSimulation() {
    if (!validateJobInputs()) return

    if (simulationRunning) return

    simulationRunning = true
    simulationPaused = false
    lastLoggedTime = -1 // Reset last logged time

    startSimulationBtn.disabled = true
    generateTableBtn.disabled = true
    document.getElementById("pauseSimulation").disabled = false

    // Check for jobs that are too large before starting
    jobs.forEach((job) => {
      if (isJobTooLarge(job)) {
        rejectedJobs.add(job.id)
        job.status = "rejected"
        logEvent(`${job.id} (${job.size}KB) rejected - exceeds available memory (${totalMemory - OS_KERNEL_SIZE}KB)`)
      }
    })

    // Update the job table to show rejected jobs
    renderJobTable()

    // Add a cool transition effect
    document.querySelector(".container").classList.add("simulation-start")
    setTimeout(() => {
      logEvent("Simulation started")

      // Process jobs immediately to handle jobs with 0ms loading time
      processJobs()

      // Initialize the timer with the current speedMultiplier
      timer = setInterval(updateSimulation, 100 / speedMultiplier)

      runSimulationStep()

      // Scroll to visualization container with smooth animation
      if (visualizationContainer) {
        visualizationContainer.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })

        // Add highlight animation to visualization container
        visualizationContainer.classList.add("highlight-container")

        // Remove highlight class after animation completes
        setTimeout(() => {
          visualizationContainer.classList.remove("highlight-container")
        }, 2000)
      }
    }, 1000) // Delay to match the animation
  }

  // Reset the simulation
  function resetSimulation() {
    // Stop timer if running
    if (timer) {
      clearInterval(timer)
      timer = null
    }

    // Reset time
    currentTime = 0
    timerElement.textContent = "0 ms"

    // Clear event log
    eventLogElement.innerHTML = ""

    // Reset job statuses and positions
    jobs.forEach((job) => {
      job.status = "waiting"
      job.position = -1
    })

    // Reset job position tracking
    jobPositions = {}
    jobs.forEach((job) => {
      jobPositions[job.id] = -1
    })

    // Reset rejected jobs and actual start times
    rejectedJobs = new Set()
    actualStartTimes = {}
    lastLoggedTime = -1 // Reset last logged time

    // Reset memory visualization
    initMemoryVisualization()
    updateMemoryStats()

    // Reset button states
    simulationRunning = false
    simulationPaused = false
    startSimulationBtn.disabled = false
    generateTableBtn.disabled = false
    document.getElementById("pauseSimulation").disabled = true
    document.getElementById("pauseSimulation").textContent = "Pause"
    document.getElementById("pauseSimulation").classList.remove("resume")

    // Update the job table
    renderJobTable()

    logEvent("Simulation reset")
  }

  // Update the simulation state
  function updateSimulation() {
    currentTime += 1
    timerElement.textContent = `${currentTime} ms`

    // Capture job statuses before update
    const previousStatuses = jobs.map((j) => j.status)

    processJobs() // May change job statuses

    // Detect changes and log events
    jobs.forEach((job, index) => {
      const prevStatus = previousStatuses[index]
      if (prevStatus !== job.status) {
        if (job.status === "running") {
          // Record the actual start time when a job starts running
          actualStartTimes[job.id] = currentTime
          logEvent(`${job.id} loaded at ${currentTime} ms`)
        } else if (job.status === "finished") {
          logEvent(`${job.id} finished at ${currentTime} ms`)
        }
      }
    })

    // Log running jobs at each millisecond
    logRunningJobs()

    // Update the job table to reflect current statuses
    renderJobTable()

    // End simulation if all jobs are finished or rejected
    const allProcessed = jobs.every((job) => job.status === "finished" || rejectedJobs.has(job.id))
    if (allProcessed) {
      clearTimeout(timer)
      simulationRunning = false
      document.getElementById("pauseSimulation").disabled = true
      logEvent("Simulation ended")
      startSimulationBtn.disabled = false
      generateTableBtn.disabled = false
    }
  }

  // Process waiting jobs based on their status and time
  function processJobs() {
    // Process waiting jobs that should start loading
    const waitingJobs = jobs.filter(
      (job) => job.status === "waiting" && currentTime >= job.loadingTime && !rejectedJobs.has(job.id),
    )

    // Sort waiting jobs by priority: loading time, then job ID (number)
    waitingJobs.sort((a, b) => {
      if (a.loadingTime !== b.loadingTime) return a.loadingTime - b.loadingTime
      const aNum = Number.parseInt(a.id.split("-")[1])
      const bNum = Number.parseInt(b.id.split("-")[1])
      return aNum - bNum
    })

    // Process running jobs that should finish
    jobs.forEach((job) => {
      if (job.status === "running") {
        const startTime = actualStartTimes[job.id] || job.loadingTime
        if (currentTime >= startTime + job.finishTime) {
          deallocateJob(job)

          // Immediately try to allocate memory for waiting jobs after deallocation
          waitingJobs.forEach((waitingJob) => {
            if (waitingJob.status === "waiting") {
              const wasAllocated = tryAllocateJob(waitingJob)

              // Log the event if the job is still waiting due to insufficient memory
              if (!wasAllocated && waitingJob.status === "waiting") {
                logEvent(`${waitingJob.id} (${waitingJob.size}KB) insufficient memory - waiting`)
              }

              // Log the event immediately when the job starts running
              if (waitingJob.status === "running" && currentTime === waitingJob.loadingTime) {
                logEvent(`${waitingJob.id} loaded at ${currentTime} ms`)
              }
            }
          })
        }
      }
    })

    // Process waiting jobs that couldn't be allocated earlier
    waitingJobs.forEach((job) => {
      if (isJobTooLarge(job)) {
        rejectedJobs.add(job.id)
        job.status = "rejected"
        logEvent(`${job.id} (${job.size}KB) rejected - exceeds available memory (${totalMemory - OS_KERNEL_SIZE}KB)`)
      } else {
        const wasAllocated = tryAllocateJob(job)

        // Log the event if the job is still waiting due to insufficient memory
        if (!wasAllocated && job.status === "waiting") {
          logEvent(`${job.id} (${job.size}KB) insufficient memory - waiting`)
        }

        // Log the event immediately when the job starts running
        if (job.status === "running" && currentTime === job.loadingTime) {
          logEvent(`${job.id} loaded at ${currentTime} ms`)
        }
      }
    })
  }

  // Try to allocate memory for a job
  function tryAllocateJob(job) {
    // Skip rejected jobs
    if (rejectedJobs.has(job.id)) return false

    // First, compact memory to ensure all jobs are at the top
    compactMemory()

    // Find a suitable free memory slot
    let freeSlotIndex = -1

    for (let i = 0; i < memorySlots.length; i++) {
      if (memorySlots[i].type === "free" && memorySlots[i].size >= job.size) {
        freeSlotIndex = i
        break
      }
    }

    if (freeSlotIndex === -1) {
      // If no suitable slot, the job remains waiting
      return false
    }

    // Allocate memory for the job
    const freeSlot = memorySlots[freeSlotIndex]

    // Create new job slot
    const jobSlot = {
      type: "job",
      size: job.size,
      jobId: job.id,
    }

    // If we're splitting a free slot
    if (freeSlot.size > job.size) {
      // Create a new free slot with remaining size
      const newFreeSlot = {
        type: "free",
        size: freeSlot.size - job.size,
        jobId: null,
      }

      // Remove the original free slot
      memorySlots.splice(freeSlotIndex, 1)

      // Insert the job at the correct position
      memorySlots.splice(freeSlotIndex, 0, jobSlot)

      // Add the free slot at the end
      memorySlots.push(newFreeSlot)
    } else {
      // If exact size match, remove the free slot and insert the job
      memorySlots.splice(freeSlotIndex, 1)
      memorySlots.splice(freeSlotIndex, 0, jobSlot)
    }

    // Update job status
    job.status = "running"
    job.position = freeSlotIndex
    jobPositions[job.id] = freeSlotIndex // Update position for animation

    // Record the actual start time
    actualStartTimes[job.id] = currentTime

    // Merge adjacent free slots
    mergeAdjacentFreeSlots()

    // Update memory visualization
    updateMemoryVisualization()
    updateMemoryStats()

    logEvent(`${job.id} (${job.size}KB) allocated memory`)
    return true
  }

  // Deallocate memory for a job
  function deallocateJob(job) {
    // Find job in memory slots
    const jobSlotIndex = memorySlots.findIndex((slot) => slot.type === "job" && slot.jobId === job.id)

    if (jobSlotIndex !== -1) {
      // Remove the job slot
      memorySlots.splice(jobSlotIndex, 1)

      // Add a new free slot at the end
      memorySlots.push({
        type: "free",
        size: job.size,
        jobId: null,
      })

      // Update job status
      job.status = "finished"
      job.position = -1
      jobPositions[job.id] = -1 // Update position for animation

      // Merge adjacent free slots
      mergeAdjacentFreeSlots()

      // Update memory visualization
      updateMemoryVisualization()
      updateMemoryStats()

      logEvent(`${job.id} (${job.size}KB) finished and released memory`)
    }
  }

  // Merge all free memory slots into one at the bottom
  function mergeAdjacentFreeSlots() {
    // Calculate total free memory
    const freeSlots = memorySlots.filter((slot) => slot.type === "free")
    const totalFreeMemory = freeSlots.reduce((acc, slot) => acc + slot.size, 0)

    // Remove all free slots
    memorySlots = memorySlots.filter((slot) => slot.type !== "free")

    // Add a single consolidated free slot at the end if there's any free memory
    if (totalFreeMemory > 0) {
      memorySlots.push({
        type: "free",
        size: totalFreeMemory,
        jobId: null,
      })
    }
  }

  // Compact memory (relocate all jobs to remove fragmentation)
  function compactMemory() {
    // Skip if there are no jobs in memory
    const jobSlots = memorySlots.filter((slot) => slot.type === "job")
    if (jobSlots.length === 0) return

    // Create new memory allocation
    const newMemorySlots = [{ type: "os", size: OS_KERNEL_SIZE, jobId: null }]

    // Add all job slots consecutively after OS kernel
    jobSlots.forEach((jobSlot, index) => {
      newMemorySlots.push({
        type: "job",
        size: jobSlot.size,
        jobId: jobSlot.jobId,
      })

      // Update job position
      const job = jobs.find((j) => j.id === jobSlot.jobId)
      if (job) {
        job.position = index + 1 // +1 because OS kernel is at position 0
      }
    })

    // Calculate total used memory
    const usedMemory = OS_KERNEL_SIZE + jobSlots.reduce((acc, slot) => acc + slot.size, 0)
    const freeSize = totalMemory - usedMemory

    // Add remaining space as a single free slot at the end
    if (freeSize > 0) {
      newMemorySlots.push({
        type: "free",
        size: freeSize,
        jobId: null,
      })
    }

    // Replace memory slots
    memorySlots = newMemorySlots

    // Update job positions for animation
    jobSlots.forEach((slot, index) => {
      if (slot.jobId) {
        jobPositions[slot.jobId] = index + 1 // +1 because OS kernel is at position 0
      }
    })
  }

  // Run a single simulation step
  function runSimulationStep() {
    if (!simulationRunning) return

    // Update memory visualization and stats
    updateMemoryVisualization()
    updateMemoryStats()
  }

  // Initialize the application
  init()
})
