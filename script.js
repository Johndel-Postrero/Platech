<<<<<<< HEAD
// Wait for the page to fully load before initializing
window.addEventListener("load", () => {
  // Hide the loading overlay once the page is loaded
  const loadingOverlay = document.getElementById("loadingOverlay")
  if (loadingOverlay) {
    loadingOverlay.style.display = "none"
  }
})

// Replace the entire SoundManager object with this improved version
const SoundManager = {
  audioContext: null,
  sounds: {},
  muted: false,

  init() {
    // Create audio context on first user interaction to comply with browser policies
    const initAudioContext = () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
          console.log("Audio context initialized")

          // Resume audio context (needed for some browsers)
          if (this.audioContext.state === "suspended") {
            this.audioContext.resume().then(() => {
              console.log("AudioContext resumed successfully")
            })
          }
        } catch (e) {
          console.error("Failed to create audio context:", e)
=======
window.addEventListener('load', function () {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const totalMemoryInput = document.getElementById('totalMemory');
    const numJobsInput = document.getElementById('numJobs');
    const generateTableBtn = document.getElementById('generateTableBtn');
    const jobTableBody = document.querySelector('#jobTable tbody');
    const startSimulationBtn = document.getElementById('startSimulation');
    const resetSimulationBtn = document.getElementById('resetSimulation');
    const timerElement = document.getElementById('timer');
    const memoryVisualizationElement = document.getElementById('memoryVisualization');
    const memoryTotalElement = document.getElementById('memoryTotal');
    const memoryUsedElement = document.getElementById('memoryUsed');
    const memoryFreeElement = document.getElementById('memoryFree');
    const eventLogElement = document.getElementById('eventLog');
    
    // Constants
    const OS_KERNEL_SIZE = 10; // KB
    const COLOR_PALETTE = [
        '#3498db', '#9b59b6', '#e67e22', '#2ecc71', '#1abc9c',
        '#f1c40f', '#e74c3c', '#34495e', '#16a085', '#27ae60',
        '#2980b9', '#8e44ad', '#f39c12', '#d35400', '#c0392b'
    ];
    
    // State variables
    let jobs = [];
    let memorySlots = [];
    let totalMemory = 0;
    let timer = null;
    let currentTime = 0;
    let simulationRunning = false;
    let simulationPaused = false;
    let speedMultiplier = 1; // Default speed
    let jobPositions = {}; // To track job positions for animation
    
    // Initialize the application
    function init() {
        generateTableBtn.addEventListener('click', generateJobTable);
        startSimulationBtn.addEventListener('click', startSimulation);
        resetSimulationBtn.addEventListener('click', resetSimulation);
        
        // Create and add speed control elements to control panel
        createSpeedControlElements();
        
        // Create and add pause button
        createPauseButton();
        
        // Set minimum total memory to account for OS kernel
        totalMemoryInput.min = OS_KERNEL_SIZE + 10;
        
        // Update memory stats initially
        updateMemoryStats();
    }
    
    // Create speed control elements
    function createSpeedControlElements() {
        const controlPanel = document.querySelector('.control-panel');
        
        // Create speed control container
        const speedControlContainer = document.createElement('div');
        speedControlContainer.classList.add('speed-control');
        
        // Create speed label
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Simulation Speed: ';
        speedLabel.setAttribute('for', 'speedControl');
        
        // Create speed slider
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.id = 'speedControl';
        speedSlider.min = '0.1';
        speedSlider.max = '5';
        speedSlider.step = '0.1';
        speedSlider.value = '1';
        
        // Create speed value display
        const speedValue = document.createElement('span');
        speedValue.id = 'speedValue';
        speedValue.textContent = '1x';
        
        // Add event listener to speed slider
        speedSlider.addEventListener('input', function() {
            speedMultiplier = parseFloat(this.value);
            speedValue.textContent = speedMultiplier + 'x';
            
            // If simulation is running, restart it with new speed
            if (simulationRunning && !simulationPaused) {
                clearInterval(timer);
                timer = setInterval(updateSimulation, 1000 / speedMultiplier);
            }
        });
        
        // Append elements to speed control container
        speedControlContainer.appendChild(speedLabel);
        speedControlContainer.appendChild(speedSlider);
        speedControlContainer.appendChild(speedValue);
        
        // Insert speed control before timer
        const timerContainer = document.querySelector('.timer-container');
        controlPanel.insertBefore(speedControlContainer, timerContainer);
    }
    
    // Create pause button
    function createPauseButton() {
        const controlPanel = document.querySelector('.control-panel');
        
        // Create pause button
        const pauseButton = document.createElement('button');
        pauseButton.id = 'pauseSimulation';
        pauseButton.textContent = 'Pause';
        pauseButton.disabled = true;
        
        // Add event listener to pause button
        pauseButton.addEventListener('click', togglePause);
        
        // Insert pause button after start button
        controlPanel.insertBefore(pauseButton, resetSimulationBtn);
    }
    
    // Toggle pause/resume simulation
    function togglePause() {
        const pauseButton = document.getElementById('pauseSimulation');
        
        if (!simulationRunning) {
            return;
>>>>>>> 1ae1d4b370c1cb4429475b869b6fe5f27befcc1f
        }
      }
    }

    // Initialize audio context on first user interaction
    document.addEventListener("click", initAudioContext, { once: true })
    document.addEventListener("keydown", initAudioContext, { once: true })

    // Add mute toggle button to the stats bar
    this.addMuteToggle()

    console.log("Sound Manager initialized")
  },

  // Add mute toggle button to the stats bar
  addMuteToggle() {
    const statsBar = document.querySelector(".stats-bar")
    if (!statsBar) return

    const muteContainer = document.createElement("div")
    muteContainer.classList.add("mute-container")
    muteContainer.style.marginLeft = "15px"

    const muteButton = document.createElement("button")
    muteButton.id = "muteToggle"
    muteButton.innerHTML = "🔊"
    muteButton.title = "Mute/Unmute Sounds"
    muteButton.style.background = "none"
    muteButton.style.border = "none"
    muteButton.style.fontSize = "20px"
    muteButton.style.cursor = "pointer"
    muteButton.style.color = "var(--primary-color)"
    muteButton.style.padding = "5px"
    muteButton.style.borderRadius = "4px"
    muteButton.style.transition = "all 0.3s"

    muteButton.addEventListener("click", () => {
      this.muted = !this.muted
      muteButton.innerHTML = this.muted ? "🔇" : "🔊"
      muteButton.title = this.muted ? "Unmute Sounds" : "Mute Sounds"

      // Play a test sound when unmuting
      if (!this.muted) {
        this.play("click")
      }
    })

    muteContainer.appendChild(muteButton)
    statsBar.appendChild(muteContainer)
  },

  // Play a sound by type
  play(soundType) {
    if (this.muted || !this.audioContext) return

    try {
      // Create oscillator and gain nodes
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Configure sound based on type
      switch (soundType) {
        case "click":
          oscillator.type = "sine"
          oscillator.frequency.value = 800
          gainNode.gain.value = 0.2
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1)
          oscillator.stop(this.audioContext.currentTime + 0.1)
          break

        case "start":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.5)
          gainNode.gain.value = 0.3
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5)
          oscillator.stop(this.audioContext.currentTime + 0.5)
          break

        case "allocate":
          oscillator.type = "sine"
          oscillator.frequency.value = 600
          gainNode.gain.value = 0.2
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)
          oscillator.stop(this.audioContext.currentTime + 0.15)
          break

        case "deallocate":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.2)
          gainNode.gain.value = 0.2
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)
          oscillator.stop(this.audioContext.currentTime + 0.2)
          break

        case "error":
          oscillator.type = "sine"
          oscillator.frequency.value = 200
          gainNode.gain.value = 0.2
          oscillator.start()

          // Schedule frequency change for two-tone effect
          setTimeout(() => {
            oscillator.frequency.value = 150
          }, 150)

          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4)
          oscillator.stop(this.audioContext.currentTime + 0.4)
          break

        case "complete":
          // Create first tone
          oscillator.type = "sine"
          oscillator.frequency.value = 400
          gainNode.gain.value = 0.2
          oscillator.start()

          // Schedule frequency changes for arpeggio effect
          setTimeout(() => {
            oscillator.frequency.value = 600
          }, 100)

          setTimeout(() => {
            oscillator.frequency.value = 800
          }, 200)

          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5)
          oscillator.stop(this.audioContext.currentTime + 0.5)
          break

        case "pause":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2)
          gainNode.gain.value = 0.2
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)
          oscillator.stop(this.audioContext.currentTime + 0.2)
          break

        case "resume":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2)
          gainNode.gain.value = 0.2
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)
          oscillator.stop(this.audioContext.currentTime + 0.2)
          break

        case "buttonHover":
          oscillator.type = "sine"
          oscillator.frequency.value = 2000
          gainNode.gain.value = 0.05
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05)
          oscillator.stop(this.audioContext.currentTime + 0.05)
          break

        default:
          console.warn("Unknown sound type:", soundType)
          return
      }

      console.log(`Playing sound: ${soundType}`)
    } catch (e) {
      console.error("Error playing sound:", e)
    }
  },
}

// Initialize the application when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM Element References =====
  // Get references to all the UI elements we'll need to interact with
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

  // Initialize sound manager
  SoundManager.init()

  // ===== Constants =====
  // Define fixed values used throughout the simulation
  const OS_KERNEL_SIZE = 10 // Size of OS kernel in KB (always reserved)
  // Color palette for visualizing different jobs in memory
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

  // ===== State Variables =====
  // Variables that track the current state of the simulation
  let jobs = [] // Array of job objects
  let memorySlots = [] // Array representing memory allocation
  let totalMemory = 0 // Total memory size in KB
  let timer = null // Timer for simulation updates
  let currentTime = 0 // Current simulation time in ms
  let simulationRunning = false // Is simulation currently running?
  let simulationPaused = false // Is simulation paused?
  let speedMultiplier = 1 // Speed control for simulation
  let jobPositions = {} // Tracks job positions for animation
  let rejectedJobs = new Set() // Jobs rejected due to size constraints
  let actualStartTimes = {} // When jobs actually start running
  let lastLoggedTime = -1 // Last time we logged running jobs

  // ===== Initialization Function =====
  // Set up the application when it first loads
  function init() {
    // Set up event listeners
    generateTableBtn.addEventListener("click", generateJobTable)
    startSimulationBtn.addEventListener("click", startSimulation)
    resetSimulationBtn.addEventListener("click", resetSimulation)
    document.getElementById("pauseSimulation").addEventListener("click", togglePause)

    // Add hover sound effects to buttons
    addButtonSoundEffects()

    // Add debug sound test button

    createSpeedControlInStatsBar()
    totalMemoryInput.min = OS_KERNEL_SIZE + 10
    updateMemoryStats()
  }


  // Add hover sound effects to all buttons
  function addButtonSoundEffects() {
    const buttons = document.querySelectorAll("button")
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        SoundManager.play("buttonHover")
      })

      // Don't add click sounds here - we'll add them at the specific action points
    })
  }

  // ===== Speed Control Creation =====
  // Creates a slider to control simulation speed
  function createSpeedControlInStatsBar() {
    const statsBar = document.querySelector(".stats-bar")
    const speedControlContainer = document.createElement("div")
    speedControlContainer.classList.add("speed-control")

    const speedLabel = document.createElement("label")
    speedLabel.textContent = "Speed: "
    speedLabel.setAttribute("for", "speedControl")

    const speedSlider = document.createElement("input")
    speedSlider.type = "range"
    speedSlider.id = "speedControl"
    speedSlider.min = "0.1"
    speedSlider.max = "5"
    speedSlider.step = "0.1"
    speedSlider.value = "1"

    const speedValue = document.createElement("span")
    speedValue.id = "speedValue"
    speedValue.textContent = "1x"

    // Update speed when slider changes
    speedSlider.addEventListener("input", function () {
      speedMultiplier = Number.parseFloat(this.value)
      speedValue.textContent = speedMultiplier + "x"

      // Play click sound on significant changes
      if (Math.round(speedMultiplier * 10) % 5 === 0) {
        SoundManager.play("click")
      }

      if (simulationRunning && !simulationPaused) {
        clearInterval(timer)
        timer = setInterval(updateSimulation, 100 / speedMultiplier)
      }
    })

    speedControlContainer.appendChild(speedLabel)
    speedControlContainer.appendChild(speedSlider)
    speedControlContainer.appendChild(speedValue)
    statsBar.appendChild(speedControlContainer)
  }

  // ===== Pause/Resume Control =====
  // Toggles between paused and running states
  function togglePause() {
    const pauseButton = document.getElementById("pauseSimulation")
    if (!simulationRunning) return

    if (simulationPaused) {
      // Resume the simulation
      simulationPaused = false
      pauseButton.textContent = "Pause"
      pauseButton.classList.remove("resume")
      timer = setInterval(updateSimulation, 100 / speedMultiplier)
      logEvent("Simulation resumed")
      SoundManager.play("resume")
    } else {
      // Pause the simulation
      simulationPaused = true
      pauseButton.textContent = "Resume"
      pauseButton.classList.add("resume")
      clearInterval(timer)
      logEvent("Simulation paused")
      SoundManager.play("pause")
    }
  }

  // ===== Job Table Generation =====
  // Creates the table of jobs based on user input
  function generateJobTable() {
    const numJobs = Number.parseInt(numJobsInput.value)
    totalMemory = Number.parseInt(totalMemoryInput.value)

    // Validate inputs
    if (isNaN(numJobs) || numJobs <= 0) {
      alert("Please enter a valid number of jobs (greater than 0).")
      numJobsInput.focus()
      SoundManager.play("error")
      return
    }

    if (isNaN(totalMemory) || totalMemory < OS_KERNEL_SIZE + 10) {
      alert("Total memory must be at least " + (OS_KERNEL_SIZE + 10) + " KB.")
      totalMemoryInput.focus()
      SoundManager.play("error")
      return
    }

    // Play click sound
    SoundManager.play("click")

    // Initialize tracking variables
    jobs = []
    jobPositions = {}
    rejectedJobs = new Set()
    actualStartTimes = {}
    lastLoggedTime = -1

    // Create job objects with default values
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
      jobPositions[jobId] = -1
    }

    renderJobTable()
    initMemoryVisualization()

    startSimulationBtn.disabled = false
    resetSimulationBtn.disabled = false
    document.getElementById("pauseSimulation").disabled = true

    updateMemoryStats()
    logEvent("System initialized with " + totalMemory + " KB memory and " + numJobs + " jobs")

    // Focus first cell for editing
    setTimeout(() => {
      const firstSizeCell = document.querySelector('td[data-field="size"][data-index="0"]')
      if (firstSizeCell) {
        firstSizeCell.click()
      }
    }, 0)
  }

  // ===== Job Table Rendering =====
  // Updates the job table in the UI
  function renderJobTable() {
    jobTableBody.innerHTML = ""

    jobs.forEach((job, index) => {
      const row = document.createElement("tr")
      if (rejectedJobs.has(job.id)) {
        row.classList.add("rejected-job")
      }

      // Job ID cell (not editable)
      const idCell = document.createElement("td")
      idCell.textContent = job.id
      row.appendChild(idCell)

      // Job Size cell (editable)
      const sizeCell = document.createElement("td")
      sizeCell.textContent = `${job.size} KB`
      sizeCell.classList.add("editable")
      sizeCell.dataset.field = "size"
      sizeCell.dataset.index = index
      sizeCell.addEventListener("click", editCell)
      row.appendChild(sizeCell)

      // Loading Time cell (editable)
      const loadingTimeCell = document.createElement("td")
      loadingTimeCell.textContent = `${job.loadingTime} msec`
      loadingTimeCell.classList.add("editable")
      loadingTimeCell.dataset.field = "loadingTime"
      loadingTimeCell.dataset.index = index
      loadingTimeCell.addEventListener("click", editCell)
      row.appendChild(loadingTimeCell)

      // Finish Time cell (editable)
      const finishTimeCell = document.createElement("td")
      finishTimeCell.textContent = `${job.finishTime} msec`
      finishTimeCell.classList.add("editable")
      finishTimeCell.dataset.field = "finishTime"
      finishTimeCell.dataset.index = index
      finishTimeCell.addEventListener("click", editCell)
      row.appendChild(finishTimeCell)

      // Status column (not editable)
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

  // ===== Cell Editing =====
  // Makes a table cell editable when clicked
  function editCell(event) {
    // Prevent editing during simulation
    if (simulationRunning) return

    // Play click sound
    SoundManager.play("click")

    const cell = event.target
    const field = cell.dataset.field
    const index = Number.parseInt(cell.dataset.index)

    const input = document.createElement("input")
    input.type = "number"
    input.value = jobs[index][field]
    input.style.width = "100%"
    input.autofocus = true

    cell.textContent = ""
    cell.appendChild(input)
    input.focus()

    // Handle input blur (when user clicks away)
    input.addEventListener("blur", () => {
      const value = Number.parseInt(input.value)
      let isValid = true

      // Validate input
      if (isNaN(value)) {
        isValid = false
        input.value = ""
        input.placeholder = "Enter a number"
        SoundManager.play("error")
      } else if ((field === "size" || field === "finishTime") && value <= 0) {
        isValid = false
        input.value = ""
        input.placeholder = "Must be > 0"
        SoundManager.play("error")
      } else if (field === "loadingTime" && value < 0) {
        isValid = false
        input.value = ""
        input.placeholder = "Must be ≥ 0"
        SoundManager.play("error")
      }

      if (!isValid) {
        input.classList.add("invalid")
        return
      }

      // Update job data
      jobs[index][field] = value
      const unit = field === "size" ? "KB" : "msec"
      cell.textContent = `${value} ${unit}`
      cell.addEventListener("click", editCell)

      // Play success sound
      SoundManager.play("click")
    })

    input.addEventListener("input", () => {
      input.placeholder = ""
      input.classList.remove("invalid")
    })

    // Handle Enter key press
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = Number.parseInt(input.value)
        let isValid = true

        // Validate input
        if (isNaN(value)) {
          isValid = false
          input.value = ""
          input.placeholder = "Enter a number"
          SoundManager.play("error")
        } else if ((field === "size" || field === "finishTime") && value <= 0) {
          isValid = false
          input.value = ""
          input.placeholder = "Must be > 0"
          SoundManager.play("error")
        } else if (field === "loadingTime" && value < 0) {
          isValid = false
          input.value = ""
          input.placeholder = "Must be ≥ 0"
          SoundManager.play("error")
        }

        if (!isValid) {
          input.classList.add("invalid")
          return
        }

        // Update job data
        jobs[index][field] = value
        const unit = field === "size" ? "KB" : "msec"
        cell.textContent = `${value} ${unit}`
        cell.addEventListener("click", editCell)

        // Play success sound
        SoundManager.play("click")

        // Move to next cell
        if (field === "finishTime" && index === jobs.length - 1) {
          input.blur() // Remove focus if this is the last cell
        } else {
          // Determine next cell to focus
          const nextFieldOrder = ["size", "loadingTime", "finishTime"]
          const currentFieldIndex = nextFieldOrder.indexOf(field)
          let nextFieldIndex = currentFieldIndex + 1
          let nextRowIndex = index

          if (nextFieldIndex >= nextFieldOrder.length) {
            nextFieldIndex = 0
            nextRowIndex = index + 1
          }

          if (nextRowIndex >= jobs.length) {
            nextRowIndex = 0
          }

          const nextCell = document.querySelector(
            `td[data-field="${nextFieldOrder[nextFieldIndex]}"][data-index="${nextRowIndex}"]`,
          )
          if (nextCell) {
            nextCell.click()
          }
        }
      }
    })

    cell.removeEventListener("click", editCell)
  }

  // ===== Memory Visualization Initialization =====
  // Sets up the initial memory visualization
  function initMemoryVisualization() {
    memoryVisualizationElement.innerHTML = ""

    const memorySlotsContainer = document.createElement("div")
    memorySlotsContainer.style.width = "100%"
    memorySlotsContainer.style.position = "relative"

    // Create OS kernel slot
    const osKernelSlot = document.createElement("div")
    osKernelSlot.classList.add("memory-slot", "os-kernel")
    osKernelSlot.style.height = `${(OS_KERNEL_SIZE / totalMemory) * 500}px`
    osKernelSlot.textContent = "OS Kernel"
    memorySlotsContainer.appendChild(osKernelSlot)

    // Create free space slot
    const freeSpaceSlot = document.createElement("div")
    freeSpaceSlot.classList.add("memory-slot", "free-space")
    freeSpaceSlot.style.height = `${((totalMemory - OS_KERNEL_SIZE) / totalMemory) * 500}px`
    freeSpaceSlot.textContent = "Free Space"
    memorySlotsContainer.appendChild(freeSpaceSlot)

    memoryVisualizationElement.appendChild(memorySlotsContainer)

    // Initialize memory slots data structure
    memorySlots = [
      { type: "os", size: OS_KERNEL_SIZE, jobId: null },
      { type: "free", size: totalMemory - OS_KERNEL_SIZE, jobId: null },
    ]
  }

  // ===== Memory Management: Bubble Free Spaces =====
  // Ensures all free memory spaces are consolidated at the bottom
  function bubbleFreeSpaces() {
    // Collect slots by type
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

    // Add consolidated free slot at the end
    if (totalFreeMemory > 0) {
      newMemorySlots.push({
        type: "free",
        size: totalFreeMemory,
        jobId: null,
      })
    }

    memorySlots = newMemorySlots
  }

  // ===== Memory Visualization Update =====
  // Updates the visual representation of memory
  function updateMemoryVisualization() {
    bubbleFreeSpaces()
    memoryVisualizationElement.innerHTML = ""

    const container = document.createElement("div")
    container.style.width = "100%"

    memorySlots.forEach((slot, index) => {
      const slotElement = document.createElement("div")
      slotElement.classList.add("memory-slot")

      // Calculate height based on proportion of total memory
      const heightPercentage = (slot.size / totalMemory) * 500
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

        // Add animation if job has moved
        if (jobPositions[job.id] !== undefined && jobPositions[job.id] !== index) {
          slotElement.classList.add("job-swap")
          // Play movement sound
          SoundManager.play("allocate")
        }
        jobPositions[job.id] = index
      } else {
        slotElement.classList.add("free-space")
        slotElement.textContent = `Free (${slot.size}KB)`
      }

      container.appendChild(slotElement)
    })

    memoryVisualizationElement.appendChild(container)
  }

  // ===== Memory Statistics Update =====
  // Updates the memory usage statistics display
  function updateMemoryStats() {
    memoryTotalElement.textContent = totalMemory

    // Calculate used memory
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

  // ===== Event Logging =====
  // Adds an event to the event log
  function logEvent(message) {
    const timeStamp = currentTime
    const logEntry = document.createElement("div")
    logEntry.classList.add("event-log-entry")
    logEntry.textContent = `[${timeStamp} ms] ${message}`
    eventLogElement.prepend(logEntry)

    // Play subtle click for log entries
    if (message.includes("allocated") || message.includes("loaded")) {
      SoundManager.play("allocate")
    } else if (message.includes("finished") || message.includes("released")) {
      SoundManager.play("deallocate")
    } else if (message.includes("rejected") || message.includes("insufficient")) {
      SoundManager.play("error")
    } else if (message.includes("Simulation ended")) {
      SoundManager.play("complete")
    }
  }

  // ===== Running Jobs Logging =====
  // Logs the status of all currently running jobs
  function logRunningJobs() {
    if (currentTime !== lastLoggedTime) {
      lastLoggedTime = currentTime
      const runningJobs = jobs.filter((job) => job.status === "running")

      if (runningJobs.length > 0) {
        const jobsList = runningJobs.map((job) => job.id).join(", ")
        logEvent(`${jobsList} - running`)
      }
    }
  }

  // ===== Job Input Validation =====
  // Validates that all job parameters are valid before simulation
  function validateJobInputs() {
    let isValid = true

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

    if (!isValid) {
      SoundManager.play("error")
    }

    return isValid
  }

  // ===== Job Size Check =====
  // Checks if a job is too large to ever fit in memory
  function isJobTooLarge(job) {
    const maxAvailableMemory = totalMemory - OS_KERNEL_SIZE
    return job.size > maxAvailableMemory
  }

  // ===== Simulation Start =====
  // Starts the simulation
  function startSimulation() {
    if (!validateJobInputs()) return
    if (simulationRunning) return

    // Ensure audio context is initialized on user interaction
    if (SoundManager.audioContext === null && window.AudioContext) {
      SoundManager.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      if (SoundManager.audioContext.state === "suspended") {
        SoundManager.audioContext.resume()
      }
    }

    // Play start sound
    SoundManager.play("start")

    simulationRunning = true
    simulationPaused = false
    lastLoggedTime = -1

    startSimulationBtn.disabled = true
    generateTableBtn.disabled = true
    document.getElementById("pauseSimulation").disabled = false

    // Check for jobs that are too large
    jobs.forEach((job) => {
      if (isJobTooLarge(job)) {
        rejectedJobs.add(job.id)
        job.status = "rejected"
        logEvent(`${job.id} (${job.size}KB) rejected - exceeds available memory (${totalMemory - OS_KERNEL_SIZE}KB)`)
      }
    })

    renderJobTable()
    document.querySelector(".container").classList.add("simulation-start")

    setTimeout(() => {
      logEvent("Simulation started")
      processJobs()
      timer = setInterval(updateSimulation, 100 / speedMultiplier)
      runSimulationStep()

      // Scroll to visualization
      if (visualizationContainer) {
        visualizationContainer.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })

        visualizationContainer.classList.add("highlight-container")
        setTimeout(() => {
          visualizationContainer.classList.remove("highlight-container")
        }, 2000)
      }
    }, 1000)
  }

  // ===== Simulation Reset =====
  // Resets the simulation to initial state
  function resetSimulation() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }

    // Play click sound
    SoundManager.play("click")

    currentTime = 0
    timerElement.textContent = "0 ms"
    eventLogElement.innerHTML = ""

    // Reset job statuses
    jobs.forEach((job) => {
      job.status = "waiting"
      job.position = -1
    })

    // Reset tracking variables
    jobPositions = {}
    jobs.forEach((job) => {
      jobPositions[job.id] = -1
    })
    rejectedJobs = new Set()
    actualStartTimes = {}
    lastLoggedTime = -1

    initMemoryVisualization()
    updateMemoryStats()

    simulationRunning = false
    simulationPaused = false
    startSimulationBtn.disabled = false
    generateTableBtn.disabled = false
    document.getElementById("pauseSimulation").disabled = true
    document.getElementById("pauseSimulation").textContent = "Pause"
    document.getElementById("pauseSimulation").classList.remove("resume")

    renderJobTable()
    logEvent("Simulation reset")
  }

  // ===== Simulation Update =====
  // Updates the simulation state for each time step
  function updateSimulation() {
    currentTime += 1
    timerElement.textContent = `${currentTime} ms`

    // Capture job statuses before update
    const previousStatuses = jobs.map((j) => j.status)

    processJobs()

    // Detect status changes and log events
    jobs.forEach((job, index) => {
      const prevStatus = previousStatuses[index]
      if (prevStatus !== job.status) {
        if (job.status === "running") {
          actualStartTimes[job.id] = currentTime
          logEvent(`${job.id} loaded at ${currentTime} ms`)
        } else if (job.status === "finished") {
          logEvent(`${job.id} finished at ${currentTime} ms`)
        }
      }
    })

    logRunningJobs()
    renderJobTable()

    // Check if simulation should end
    const allProcessed = jobs.every((job) => job.status === "finished" || rejectedJobs.has(job.id))
    if (allProcessed) {
      clearTimeout(timer)
      simulationRunning = false
      document.getElementById("pauseSimulation").disabled = true
      logEvent("Simulation ended")
      SoundManager.play("complete")
      startSimulationBtn.disabled = false
      generateTableBtn.disabled = false
    }
  }

  // ===== Job Processing =====
  // Processes jobs based on their status and current time
  function processJobs() {
    // Find waiting jobs that should start loading now
    const waitingJobs = jobs.filter(
      (job) => job.status === "waiting" && currentTime >= job.loadingTime && !rejectedJobs.has(job.id),
    )

    // Sort waiting jobs by priority
    waitingJobs.sort((a, b) => {
      if (a.loadingTime !== b.loadingTime) return a.loadingTime - b.loadingTime
      const aNum = Number.parseInt(a.id.split("-")[1])
      const bNum = Number.parseInt(b.id.split("-")[1])
      return aNum - bNum
    })

    // Process running jobs that should finish now
    jobs.forEach((job) => {
      if (job.status === "running") {
        const startTime = actualStartTimes[job.id] || job.loadingTime
        if (currentTime >= startTime + job.finishTime) {
          deallocateJob(job)

          // Try to allocate memory for waiting jobs
          waitingJobs.forEach((waitingJob) => {
            if (waitingJob.status === "waiting") {
              const wasAllocated = tryAllocateJob(waitingJob)

              if (!wasAllocated && waitingJob.status === "waiting") {
                logEvent(`${waitingJob.id} (${waitingJob.size}KB) insufficient memory - waiting`)
              }

              if (waitingJob.status === "running" && currentTime === waitingJob.loadingTime) {
                logEvent(`${waitingJob.id} loaded at ${currentTime} ms`)
              }
            }
          })
        }
      }
    })

    // Process waiting jobs
    waitingJobs.forEach((job) => {
      if (isJobTooLarge(job)) {
        rejectedJobs.add(job.id)
        job.status = "rejected"
        logEvent(`${job.id} (${job.size}KB) rejected - exceeds available memory (${totalMemory - OS_KERNEL_SIZE}KB)`)
      } else {
        const wasAllocated = tryAllocateJob(job)

        if (!wasAllocated && job.status === "waiting") {
          logEvent(`${job.id} (${job.size}KB) insufficient memory - waiting`)
        }

        if (job.status === "running" && currentTime === job.loadingTime) {
          logEvent(`${job.id} loaded at ${currentTime} ms`)
        }
      }
    })
  }

  // ===== Memory Allocation =====
  // Tries to allocate memory for a job
  function tryAllocateJob(job) {
    if (rejectedJobs.has(job.id)) return false

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
      return false
    }

    const freeSlot = memorySlots[freeSlotIndex]
    const jobSlot = {
      type: "job",
      size: job.size,
      jobId: job.id,
    }

    // Handle splitting free slot if needed
    if (freeSlot.size > job.size) {
      const newFreeSlot = {
        type: "free",
        size: freeSlot.size - job.size,
        jobId: null,
      }

      memorySlots.splice(freeSlotIndex, 1)
      memorySlots.splice(freeSlotIndex, 0, jobSlot)
      memorySlots.push(newFreeSlot)
    } else {
      memorySlots.splice(freeSlotIndex, 1)
      memorySlots.splice(freeSlotIndex, 0, jobSlot)
    }

    // Update job status
    job.status = "running"
    job.position = freeSlotIndex
    jobPositions[job.id] = freeSlotIndex
    actualStartTimes[job.id] = currentTime

    mergeAdjacentFreeSlots()
    updateMemoryVisualization()
    updateMemoryStats()

    logEvent(`${job.id} (${job.size}KB) allocated memory`)
    SoundManager.play("allocate")
    return true
  }

  // ===== Memory Deallocation =====
  // Deallocates memory for a job that has finished
  function deallocateJob(job) {
    const jobSlotIndex = memorySlots.findIndex((slot) => slot.type === "job" && slot.jobId === job.id)

    if (jobSlotIndex !== -1) {
      memorySlots.splice(jobSlotIndex, 1)
      memorySlots.push({
        type: "free",
        size: job.size,
        jobId: null,
      })

      job.status = "finished"
      job.position = -1
      jobPositions[job.id] = -1

      mergeAdjacentFreeSlots()
      updateMemoryVisualization()
      updateMemoryStats()

      logEvent(`${job.id} (${job.size}KB) finished and released memory`)
      SoundManager.play("deallocate")
    }
  }

  // ===== Memory Management: Merge Free Slots =====
  // Merges all free memory slots into one at the bottom
  function mergeAdjacentFreeSlots() {
    // Calculate total free memory
    const freeSlots = memorySlots.filter((slot) => slot.type === "free")
    const totalFreeMemory = freeSlots.reduce((acc, slot) => acc + slot.size, 0)

    // Remove all free slots
    memorySlots = memorySlots.filter((slot) => slot.type !== "free")

    // Add a single consolidated free slot
    if (totalFreeMemory > 0) {
      memorySlots.push({
        type: "free",
        size: totalFreeMemory,
        jobId: null,
      })
    }
  }

  // ===== Memory Compaction =====
  // Relocates all jobs to remove fragmentation
  function compactMemory() {
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

    // Calculate free space
    const usedMemory = OS_KERNEL_SIZE + jobSlots.reduce((acc, slot) => acc + slot.size, 0)
    const freeSize = totalMemory - usedMemory

    // Add remaining space as a single free slot
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

  // ===== Simulation Step =====
  // Runs a single simulation step
  function runSimulationStep() {
    if (!simulationRunning) return

    // Update memory visualization and stats
    updateMemoryVisualization()
    updateMemoryStats()
  }

  // Initialize the application
  init()
})

// Log to console that the script has loaded
console.log("Memory Management Simulator script loaded and ready")
