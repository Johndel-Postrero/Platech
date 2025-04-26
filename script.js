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
        speedSlider.min = '0.5';
        speedSlider.max = '5';
        speedSlider.step = '0.5';
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
        }
        
        if (simulationPaused) {
            // Resume simulation
            simulationPaused = false;
            pauseButton.textContent = 'Pause';
            pauseButton.classList.remove('resume');
            timer = setInterval(updateSimulation, 1000 / speedMultiplier);
            logEvent('Simulation resumed');
        } else {
            // Pause simulation
            simulationPaused = true;
            pauseButton.textContent = 'Resume';
            pauseButton.classList.add('resume');
            clearInterval(timer);
            logEvent('Simulation paused');
        }
    }
    
    // Generate the job table based on user input
    function generateJobTable() {
    const numJobs = parseInt(numJobsInput.value);
    totalMemory = parseInt(totalMemoryInput.value);

    // Check if numJobs is a number and greater than 0
    if (isNaN(numJobs) || numJobs <= 0) {
        alert('Please enter a valid number of jobs (greater than 0).');
        numJobsInput.focus(); // Focus the input box for correction
        return;
    }

    // Check if totalMemory is a number and valid
    if (isNaN(totalMemory) || totalMemory < OS_KERNEL_SIZE + 10) {
        alert('Total memory must be at least ' + (OS_KERNEL_SIZE + 10) + ' KB.');
        totalMemoryInput.focus(); // Focus the input box for correction
        return;
    }

    // Initialize jobs array
    jobs = [];
    jobPositions = {}; // Reset job positions
    
    for (let i = 0; i < numJobs; i++) {
        const jobId = 'Job-' + (i + 1);
        jobs.push({
            id: jobId,
            size: 0,
            loadingTime: 0,
            finishTime: 0,
            status: 'waiting',
            position: -1,
            color: COLOR_PALETTE[i % COLOR_PALETTE.length]
        });
        jobPositions[jobId] = -1; // Initialize position tracking
    }

    renderJobTable();
    initMemoryVisualization();

    startSimulationBtn.disabled = false;
    resetSimulationBtn.disabled = false;
    document.getElementById('pauseSimulation').disabled = true;

    updateMemoryStats();
    logEvent('System initialized with ' + totalMemory + ' KB memory and ' + numJobs + ' jobs');
    
    // Automatically focus the first job's size cell after generating the table
    setTimeout(() => {
        const firstSizeCell = document.querySelector('td[data-field="size"][data-index="0"]');
        if (firstSizeCell) {
            firstSizeCell.click();
        }
    }, 0);
}
  
    // Render the job table
    function renderJobTable() {
        jobTableBody.innerHTML = '';
    
        jobs.forEach((job, index) => {
            const row = document.createElement('tr');
    
            // Job ID (not editable)
            const idCell = document.createElement('td');
            idCell.textContent = job.id;
            row.appendChild(idCell);
    
            // Job Size (editable, with "KB" display)
            const sizeCell = document.createElement('td');
            sizeCell.textContent = `${job.size} KB`;
            sizeCell.classList.add('editable');
            sizeCell.dataset.field = 'size';
            sizeCell.dataset.index = index;
            sizeCell.addEventListener('click', editCell);
            row.appendChild(sizeCell);
    
            // Loading Time (editable, with "msec" display)
            const loadingTimeCell = document.createElement('td');
            loadingTimeCell.textContent = `${job.loadingTime} msec`;
            loadingTimeCell.classList.add('editable');
            loadingTimeCell.dataset.field = 'loadingTime';
            loadingTimeCell.dataset.index = index;
            loadingTimeCell.addEventListener('click', editCell);
            row.appendChild(loadingTimeCell);
    
            // Finish Time (editable, with "msec" display)
            const finishTimeCell = document.createElement('td');
            finishTimeCell.textContent = `${job.finishTime} msec`;
            finishTimeCell.classList.add('editable');
            finishTimeCell.dataset.field = 'finishTime';
            finishTimeCell.dataset.index = index;
            finishTimeCell.addEventListener('click', editCell);
            row.appendChild(finishTimeCell);
    
            jobTableBody.appendChild(row);
        });
    }
    
    // Make a cell editable
    function editCell(event) {
        if (simulationRunning) return;
    
        const cell = event.target;
        const field = cell.dataset.field;
        const index = parseInt(cell.dataset.index);
    
        const input = document.createElement('input');
        input.type = 'number';
        input.value = jobs[index][field];
        input.style.width = '100%';
        input.autofocus = true; // Add this to automatically focus the input
    
        cell.textContent = '';
        cell.appendChild(input);
        input.focus();
    
        input.addEventListener('blur', function () {
            const value = parseInt(input.value);
            let isValid = true;
    
            // Validation rules
            if (isNaN(value)) {
                isValid = false;
                input.value = '';
                input.placeholder = 'Enter a number';
            } else if ((field === 'size' || field === 'finishTime') && value <= 0) {
                isValid = false;
                input.value = '';
                input.placeholder = 'Must be > 0';
            } else if (field === 'loadingTime' && value < 0) {
                isValid = false;
                input.value = '';
                input.placeholder = 'Must be ≥ 0';
            }
    
            if (!isValid) {
                input.classList.add('invalid');
                return;
            }
    
            // Valid input
            jobs[index][field] = value;
            const unit = field === 'size' ? 'KB' : 'msec';
            cell.textContent = `${value} ${unit}`;
            cell.addEventListener('click', editCell);
        });
    
        input.addEventListener('input', function () {
            input.placeholder = '';
            input.classList.remove('invalid');
        });
    
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const value = parseInt(input.value);
                let isValid = true;
    
                // Same validation as blur
                if (isNaN(value)) {
                    isValid = false;
                    input.value = '';
                    input.placeholder = 'Enter a number';
                } else if ((field === 'size' || field === 'finishTime') && value <= 0) {
                    isValid = false;
                    input.value = '';
                    input.placeholder = 'Must be > 0';
                } else if (field === 'loadingTime' && value < 0) {
                    isValid = false;
                    input.value = '';
                    input.placeholder = 'Must be ≥ 0';
                }
    
                if (!isValid) {
                    input.classList.add('invalid');
                    return;
                }
    
                // If valid, update the value
                jobs[index][field] = value;
                const unit = field === 'size' ? 'KB' : 'msec';
                cell.textContent = `${value} ${unit}`;
                cell.addEventListener('click', editCell);
    
                // Check if this is the last cell (finish time of the last job)
                if (field === 'finishTime' && index === jobs.length - 1) {
                    input.blur(); // Remove focus
                } else {
                    // Move to the next cell
                    const nextFieldOrder = ['size', 'loadingTime', 'finishTime'];
                    const currentFieldIndex = nextFieldOrder.indexOf(field);
                    let nextFieldIndex = currentFieldIndex + 1;
                    let nextRowIndex = index;
    
                    // If we're at the last field, move to next job's first field
                    if (nextFieldIndex >= nextFieldOrder.length) {
                        nextFieldIndex = 0;
                        nextRowIndex = index + 1;
                    }
    
                    // If we're at the last job, wrap around to first job
                    if (nextRowIndex >= jobs.length) {
                        nextRowIndex = 0;
                    }
    
                    // Find the next cell to focus
                    const nextCell = document.querySelector(`td[data-field="${nextFieldOrder[nextFieldIndex]}"][data-index="${nextRowIndex}"]`);
                    if (nextCell) {
                        nextCell.click(); // Trigger edit on next cell
                    }
                }
            }
        });
    
        cell.removeEventListener('click', editCell);
    }
    
    // Initialize memory visualization
    function initMemoryVisualization() {
        memoryVisualizationElement.innerHTML = '';
        
        // Create memory slots container
        const memorySlotsContainer = document.createElement('div');
        memorySlotsContainer.style.width = '100%';
        memorySlotsContainer.style.position = 'relative';
        
        // Create OS kernel slot
        const osKernelSlot = document.createElement('div');
        osKernelSlot.classList.add('memory-slot', 'os-kernel');
        osKernelSlot.style.height = `${(OS_KERNEL_SIZE / totalMemory) * 500}px`; // Scale to 500px
        osKernelSlot.textContent = 'OS Kernel';
        memorySlotsContainer.appendChild(osKernelSlot);
        
        // Create free space slot
        const freeSpaceSlot = document.createElement('div');
        freeSpaceSlot.classList.add('memory-slot', 'free-space');
        freeSpaceSlot.style.height = `${((totalMemory - OS_KERNEL_SIZE) / totalMemory) * 500}px`;
        freeSpaceSlot.textContent = 'Free Space';
        memorySlotsContainer.appendChild(freeSpaceSlot);
        
        // Add the slots container to memory visualization
        memoryVisualizationElement.appendChild(memorySlotsContainer);
        
        // Initialize memory slots
        memorySlots = [
            { type: 'os', size: OS_KERNEL_SIZE, jobId: null },
            { type: 'free', size: totalMemory - OS_KERNEL_SIZE, jobId: null }
        ];
    }
    
    // Bubble all free memory spaces to the bottom
    function bubbleFreeSpaces() {
        let hasSwapped = true;
        
        // Sort memory slots to move free spaces down (bubble sort)
        while (hasSwapped) {
            hasSwapped = false;
            
            for (let i = 0; i < memorySlots.length - 1; i++) {
                // Skip OS kernel
                if (i === 0 && memorySlots[i].type === 'os') continue;
                
                // If current slot is a job and next slot is free space, swap them
                if (memorySlots[i].type === 'job' && memorySlots[i + 1].type === 'free') {
                    // Swap memory slots
                    const temp = memorySlots[i];
                    memorySlots[i] = memorySlots[i + 1];
                    memorySlots[i + 1] = temp;
                    
                    // Update job position
                    if (temp.jobId) {
                        const job = jobs.find(j => j.id === temp.jobId);
                        if (job) {
                            job.position = i + 1;
                            jobPositions[job.id] = i + 1; // Update position for animation
                        }
                    }
                    
                    hasSwapped = true;
                }
            }
        }
        
        // Merge adjacent free slots after bubbling
        mergeAdjacentFreeSlots();
    }
    
    // Update memory visualization with animation
    function updateMemoryVisualization() {
        bubbleFreeSpaces();

        memoryVisualizationElement.innerHTML = '';
        const container = document.createElement('div');
        container.style.width = '100%';

        memorySlots.forEach((slot, index) => {
            const slotElement = document.createElement('div');
            slotElement.classList.add('memory-slot');

            const heightPercentage = (slot.size / totalMemory) * 500; // Scale to 500px
            slotElement.style.height = `${heightPercentage}px`;
            slotElement.style.width = '100%';

            if (slot.type === 'os') {
                slotElement.classList.add('os-kernel');
                slotElement.textContent = 'OS Kernel';
            } else if (slot.type === 'job') {
                const job = jobs.find(j => j.id === slot.jobId);
                slotElement.classList.add('job');
                slotElement.style.backgroundColor = job.color;
                slotElement.textContent = `${job.id} (${slot.size}KB)`;

                // Add swap animation if the job has moved
                if (jobPositions[job.id] !== undefined && jobPositions[job.id] !== index) {
                    slotElement.classList.add('job-swap');
                }
                jobPositions[job.id] = index; // Update position
            } else {
                slotElement.classList.add('free-space');
                slotElement.textContent = `Free (${slot.size}KB)`;
            }

            container.appendChild(slotElement);
        });

        memoryVisualizationElement.appendChild(container);
    }
    
    // Update memory statistics
    function updateMemoryStats() {
        memoryTotalElement.textContent = totalMemory;
        
        let usedMemory = OS_KERNEL_SIZE;
        
        if (memorySlots.length > 0) {
            usedMemory = memorySlots.reduce((acc, slot) => {
                return acc + (slot.type !== 'free' ? slot.size : 0);
            }, 0);
        }
        
        const freeMemory = totalMemory - usedMemory;
        
        memoryUsedElement.textContent = usedMemory;
        memoryFreeElement.textContent = freeMemory;
    }
    
    // Log an event
    function logEvent(message) {
        const timeStamp = currentTime;
        const logEntry = document.createElement('div');
        logEntry.classList.add('event-log-entry');
        logEntry.textContent = `[${timeStamp} ms] ${message}`;
        eventLogElement.prepend(logEntry);
    }
    
    // Function to validate the job inputs are valid before starting simulation
    function validateJobInputs() {
        let isValid = true;
        
        // Check each job has valid parameters
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            
            if (job.size <= 0) {
                logEvent(`Error: ${job.id} has invalid size (must be > 0)`);
                isValid = false;
            }
            
            if (job.finishTime <= 0) {
                logEvent(`Error: ${job.id} has invalid finish time (must be > 0)`);
                isValid = false;
            }
            
            if (job.loadingTime < 0) {
                logEvent(`Error: ${job.id} has invalid loading time (must be >= 0)`);
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Start the simulation
    function startSimulation() {
        if (!validateJobInputs()) return;

        if (simulationRunning) return;

        simulationRunning = true;
        simulationPaused = false;

        startSimulationBtn.disabled = true;
        generateTableBtn.disabled = true;
        document.getElementById('pauseSimulation').disabled = false;

        // Add a cool transition effect
        document.querySelector('.container').classList.add('simulation-start');
        setTimeout(() => {
            logEvent('Simulation started');
            
            // Initialize the timer with the current speedMultiplier
            timer = setInterval(updateSimulation, 1000 / speedMultiplier);
            
            runSimulationStep();
        }, 1000); // Delay to match the animation
    }
    
    // Reset the simulation
    function resetSimulation() {
        // Stop timer if running
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        // Reset time
        currentTime = 0;
        timerElement.textContent = '0 ms';
        
        // Clear event log
        eventLogElement.innerHTML = '';
        
        // Reset job statuses and positions
        jobs.forEach(job => {
            job.status = 'waiting';
            job.position = -1;
        });
        
        // Reset job position tracking
        jobPositions = {};
        jobs.forEach(job => {
            jobPositions[job.id] = -1;
        });
        
        // Reset memory visualization
        initMemoryVisualization();
        updateMemoryStats();
        
        // Reset button states
        simulationRunning = false;
        simulationPaused = false;
        startSimulationBtn.disabled = false;
        generateTableBtn.disabled = false;
        document.getElementById('pauseSimulation').disabled = true;
        document.getElementById('pauseSimulation').textContent = 'Pause';
        document.getElementById('pauseSimulation').classList.remove('resume');
        
        logEvent('Simulation reset');
    }
    
    // Update the simulation state
    function updateSimulation() {
        currentTime += 1;
        timerElement.textContent = `${currentTime} ms`;
    
        // Capture job statuses before update
        const previousStatuses = jobs.map(j => j.status);
    
        processJobs(); // May change job statuses
    
        // Detect changes and log events
        jobs.forEach((job, index) => {
            const prevStatus = previousStatuses[index];
            if (prevStatus !== job.status) {
                if (job.status === 'running') {
                    logEvent(`${job.id} loaded at ${currentTime} ms`);
                } else if (job.status === 'finished') {
                    logEvent(`${job.id} finished at ${currentTime} ms`);
                }
            }
        });
    
        // End simulation if all jobs are finished
        const allFinished = jobs.every(job => job.status === 'finished');
        if (allFinished) {
            clearTimeout(timer);
            simulationRunning = false;
            document.getElementById('pauseSimulation').disabled = true;
            logEvent('All jobs have completed');
            startSimulationBtn.disabled = false;
            generateTableBtn.disabled = false;
        }
    }
    
    // Process jobs based on their status and time
    function processJobs() {
        // Process waiting jobs that should start loading
        jobs.forEach(job => {
            if (job.status === 'waiting' && currentTime >= job.loadingTime) {
                tryAllocateJob(job);
            }
        });
        
        // Process running jobs that should finish
        jobs.forEach(job => {
            if (job.status === 'running' && currentTime >= job.loadingTime + job.finishTime) {
                deallocateJob(job);
            }
        });
    }
    
    // Try to allocate memory for a job
    function tryAllocateJob(job) {
        // Find a suitable free memory slot
        let freeSlotIndex = -1;
        
        for (let i = 0; i < memorySlots.length; i++) {
            if (memorySlots[i].type === 'free' && memorySlots[i].size >= job.size) {
                freeSlotIndex = i;
                break;
            }
        }
        
        if (freeSlotIndex === -1) {
            // No suitable slot found, compact memory and try again
            compactMemory();
            
            // After compaction, find a suitable free memory slot
            for (let i = 0; i < memorySlots.length; i++) {
                if (memorySlots[i].type === 'free' && memorySlots[i].size >= job.size) {
                    freeSlotIndex = i;
                    break;
                }
            }
            
            // If still no suitable slot, job must wait
            if (freeSlotIndex === -1) {
                logEvent(`${job.id} (${job.size}KB) waiting - not enough memory`);
                return;
            }
        }
        
        // Allocate memory for the job
        const freeSlot = memorySlots[freeSlotIndex];
        
        // Create new job slot
        const jobSlot = {
            type: 'job',
            size: job.size,
            jobId: job.id
        };
        
        // Update free slot size or remove it
        if (freeSlot.size === job.size) {
            // Replace free slot with job slot
            memorySlots[freeSlotIndex] = jobSlot;
        } else {
            // Split free slot
            const remainingSize = freeSlot.size - job.size;
            memorySlots[freeSlotIndex] = jobSlot;
            
            // Add new free slot after job slot
            memorySlots.splice(freeSlotIndex + 1, 0, {
                type: 'free',
                size: remainingSize,
                jobId: null
            });
        }
        
        // Update job status
        job.status = 'running';
        job.position = freeSlotIndex;
        jobPositions[job.id] = freeSlotIndex; // Update position for animation
        
        // Bubble free spaces after job allocation
        bubbleFreeSpaces();
        
        // Update memory visualization
        updateMemoryVisualization();
        updateMemoryStats();
        
        logEvent(`${job.id} (${job.size}KB) allocated memory`);
    }
    
    // Deallocate memory for a job
    function deallocateJob(job) {
        // Find job in memory slots
        const jobSlotIndex = memorySlots.findIndex(slot => slot.type === 'job' && slot.jobId === job.id);
        
        if (jobSlotIndex !== -1) {
            // Convert job slot to free slot
            memorySlots[jobSlotIndex] = {
                type: 'free',
                size: job.size,
                jobId: null
            };
            
            // Update job status
            job.status = 'finished';
            job.position = -1;
            jobPositions[job.id] = -1; // Update position for animation
            
            // Bubble free spaces after deallocation
            bubbleFreeSpaces();
            
            // Merge adjacent free slots
            mergeAdjacentFreeSlots();
            
            // Update memory visualization
            updateMemoryVisualization();
            updateMemoryStats();
            
            logEvent(`${job.id} (${job.size}KB) finished and released memory`);
        }
    }
    
    // Merge adjacent free memory slots
    function mergeAdjacentFreeSlots() {
        let i = 0;
        while (i < memorySlots.length - 1) {
            if (memorySlots[i].type === 'free' && memorySlots[i + 1].type === 'free') {
                // Merge slots
                memorySlots[i].size += memorySlots[i + 1].size;
                memorySlots.splice(i + 1, 1);
            } else {
                i++;
            }
        }
    }
    
    // Compact memory (relocate all jobs to remove fragmentation)
    function compactMemory() {
        // Skip if there are no jobs in memory
        const jobSlots = memorySlots.filter(slot => slot.type === 'job');
        if (jobSlots.length === 0) return;
        
        // Store old positions for animation
        const oldPositions = {};
        jobSlots.forEach(slot => {
            if (slot.jobId) {
                const job = jobs.find(j => j.id === slot.jobId);
                if (job) {
                    oldPositions[job.id] = job.position;
                }
            }
        });
        
        // Create new memory allocation
        const newMemorySlots = [
            { type: 'os', size: OS_KERNEL_SIZE, jobId: null }
        ];
        
        // Add all job slots consecutively
        let currentPosition = 1; // Start after OS kernel
        jobSlots.forEach(jobSlot => {
            newMemorySlots.push({
                type: 'job',
                size: jobSlot.size,
                jobId: jobSlot.jobId
            });
            
            // Update job position
            const job = jobs.find(j => j.id === jobSlot.jobId);
            if (job) {
                job.position = currentPosition;
                // Don't update jobPositions here - we want to keep old positions for animation
            }
            
            currentPosition++;
        });
        
        // Add remaining space as free slot
        const usedMemory = OS_KERNEL_SIZE + jobSlots.reduce((acc, slot) => acc + slot.size, 0);
        const freeSize = totalMemory - usedMemory;
        
        if (freeSize > 0) {
            newMemorySlots.push({
                type: 'free',
                size: freeSize,
                jobId: null
            });
        }
        
        // Replace memory slots
        memorySlots = newMemorySlots;
        
        logEvent('Memory compaction performed');
    }
    
    // Initialize the application
    init();
});
