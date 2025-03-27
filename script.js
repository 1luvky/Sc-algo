let processes = [];

function addProcess() {
    let processId = document.getElementById("processId").value;
    let arrivalTime = parseInt(document.getElementById("arrivalTime").value);
    let burstTime = parseInt(document.getElementById("burstTime").value);

    if (!processId || isNaN(arrivalTime) || isNaN(burstTime)) {
        alert("Please enter valid process details.");
        return;
    }

    processes.push({ processId, arrivalTime, burstTime, remainingTime: burstTime, completedTime: 0 });
    updateProcessTable();
}

function updateProcessTable() {
    let table = document.getElementById("processTable");

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    processes.forEach(p => {
        let row = table.insertRow();
        row.insertCell(0).innerText = p.processId;
        row.insertCell(1).innerText = p.arrivalTime;
        row.insertCell(2).innerText = p.burstTime;
    });
}

function calculateSchedule() {
    if (processes.length === 0) {
        alert("No processes added.");
        return;
    }

    let method = document.getElementById("schedulingMethod").value;
    
    if (method === "fcfs") {
        calculateFCFS();
    } else if (method === "rr") {
        calculateRoundRobin();
    }
}

// First Come, First Served (FCFS) Scheduling
function calculateFCFS() {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let completionTime = 0;
    let totalTurnaroundTime = 0;
    let totalWaitingTime = 0;

    processes.forEach((p) => {
        let waitingTime = Math.max(0, completionTime - p.arrivalTime);
        completionTime += p.burstTime;
        let turnaroundTime = completionTime - p.arrivalTime;
        
        p.completedTime = completionTime;
        p.waitingTime = waitingTime;
        p.turnaroundTime = turnaroundTime;
        
        totalTurnaroundTime += turnaroundTime;
        totalWaitingTime += waitingTime;
    });

    updateResults(totalTurnaroundTime, totalWaitingTime);
}

// Round Robin Scheduling
function calculateRoundRobin() {
    let quantum = parseInt(document.getElementById("quantumTime").value);

    if (isNaN(quantum) || quantum <= 0) {
        alert("Please enter a valid time quantum.");
        return;
    }

    let queue = [];
    let remainingBurst = {};
    let completionTime = {};
    let waitingTime = {};
    let turnaroundTime = {};
    let arrivalQueue = [...processes]; // Copy processes sorted by arrival
    let firstResponse = {};

    // Initialize burst times
    processes.forEach(p => {
        remainingBurst[p.processId] = p.burstTime;
        completionTime[p.processId] = 0;
        waitingTime[p.processId] = 0;
        turnaroundTime[p.processId] = 0;
        firstResponse[p.processId] = -1;  // Track first execution time
    });

    let time = 0;
    let remainingProcesses = processes.length;

    // Sort processes by arrival time
    arrivalQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);

    // Load first processes into queue
    while (arrivalQueue.length > 0 && arrivalQueue[0].arrivalTime <= time) {
        queue.push(arrivalQueue.shift());
    }

    while (remainingProcesses > 0) {
        if (queue.length > 0) {
            let process = queue.shift();

            if (firstResponse[process.processId] === -1) {
                firstResponse[process.processId] = time; // Track first execution time
            }

            let executeTime = Math.min(quantum, remainingBurst[process.processId]);
            remainingBurst[process.processId] -= executeTime;
            time += executeTime;

            // Add newly arrived processes to queue
            while (arrivalQueue.length > 0 && arrivalQueue[0].arrivalTime <= time) {
                queue.push(arrivalQueue.shift());
            }

            // If process is not finished, push it back to the queue
            if (remainingBurst[process.processId] > 0) {
                queue.push(process);
            } else {
                completionTime[process.processId] = time;
                remainingProcesses--;
            }
        } else {
            // Move time forward if no process is available
            time++;
            while (arrivalQueue.length > 0 && arrivalQueue[0].arrivalTime <= time) {
                queue.push(arrivalQueue.shift());
            }
        }
    }

    // Calculate waiting time and turnaround time
    processes.forEach(p => {
        turnaroundTime[p.processId] = completionTime[p.processId] - p.arrivalTime;
        waitingTime[p.processId] = turnaroundTime[p.processId] - p.burstTime;
    });

    updateResultsRR(completionTime, waitingTime, turnaroundTime);
}


// Update Process Table with Results for Round Robin
function updateResultsRR(completionTime, waitingTime, turnaroundTime) {
    let table = document.getElementById("processTable");
    
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    let totalTurnaroundTime = 0;
    let totalWaitingTime = 0;

    processes.forEach(p => {
        let row = table.insertRow();
        row.insertCell(0).innerText = p.processId;
        row.insertCell(1).innerText = p.arrivalTime;
        row.insertCell(2).innerText = p.burstTime;
        row.insertCell(3).innerText = completionTime[p.processId];
        row.insertCell(4).innerText = waitingTime[p.processId];
        row.insertCell(5).innerText = turnaroundTime[p.processId];

        totalTurnaroundTime += turnaroundTime[p.processId];
        totalWaitingTime += waitingTime[p.processId];
    });

    let avgTurnaround = totalTurnaroundTime / processes.length;
    let avgWaiting = totalWaitingTime / processes.length;
    let throughput = processes.length / Math.max(...Object.values(completionTime));

    document.getElementById("avgTurnaroundTime").value = avgTurnaround.toFixed(2);
    document.getElementById("avgWaitingTime").value = avgWaiting.toFixed(2);
    document.getElementById("throughput").value = throughput.toFixed(2);
}

// Update Process Table with Results for FCFS
function updateResults(totalTurnaroundTime, totalWaitingTime) {
    let table = document.getElementById("processTable");

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    processes.forEach(p => {
        let row = table.insertRow();
        row.insertCell(0).innerText = p.processId;
        row.insertCell(1).innerText = p.arrivalTime;
        row.insertCell(2).innerText = p.burstTime;
        row.insertCell(3).innerText = p.completedTime;
        row.insertCell(4).innerText = p.waitingTime;
        row.insertCell(5).innerText = p.turnaroundTime;
    });

    let avgTurnaround = totalTurnaroundTime / processes.length;
    let avgWaiting = totalWaitingTime / processes.length;
    let throughput = processes.length / processes[processes.length - 1].completedTime;

    document.getElementById("avgTurnaroundTime").value = avgTurnaround.toFixed(2);
    document.getElementById("avgWaitingTime").value = avgWaiting.toFixed(2);
    document.getElementById("throughput").value = throughput.toFixed(2);
}
