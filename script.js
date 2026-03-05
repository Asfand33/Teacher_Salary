// DOM Elements
const idInput = document.getElementById('teacher-id');
const nameInput = document.getElementById('teacher-name');
const basicInput = document.getElementById('basic-salary');
const bonusInput = document.getElementById('bonus');
const securityInput = document.getElementById('security');
const advanceInput = document.getElementById('advance');
const deductionInput = document.getElementById('deduction');
const netSalaryDisplay = document.getElementById('net-salary');
const totalSecurityDisplay = document.getElementById('total-security-display');

// Load history table on page load
window.onload = () => {
    renderHistory();
};

// Auto-fill Data based on Unique ID from previously saved records
idInput.addEventListener('input', function() {
    const id = this.value.trim().toUpperCase();
    
    if (id === '') {
        nameInput.value = '';
        basicInput.value = '';
        totalSecurityDisplay.innerText = 'Total Saved in School: $0';
        calculateNetSalary();
        return;
    }

    // Check saved history to see if this ID was used before
    const history = JSON.parse(localStorage.getItem('salaryHistory')) || [];
    
    // Filter to get all records for this specific teacher
    const teacherRecords = history.filter(record => record.teacherId === id);

    if (teacherRecords.length > 0) {
        // If found, fill the previously assigned name and basic salary automatically
        const latestRecord = teacherRecords[teacherRecords.length - 1];
        nameInput.value = latestRecord.name;
        basicInput.value = latestRecord.basic;

        // Calculate Total Security Saved in School over all previous months
        let totalSecurity = 0;
        teacherRecords.forEach(record => {
            totalSecurity += parseFloat(record.security) || 0;
        });
        totalSecurityDisplay.innerText = `Total Saved in School: $${totalSecurity}`;
    } else {
        totalSecurityDisplay.innerText = 'Total Saved in School: $0';
    }
    
    calculateNetSalary();
});

// Calculate Net Salary dynamically
const financialInputs = [basicInput, bonusInput, securityInput, advanceInput, deductionInput];
financialInputs.forEach(input => {
    input.addEventListener('input', calculateNetSalary);
});

function calculateNetSalary() {
    const basic = parseFloat(basicInput.value) || 0;
    const bonus = parseFloat(bonusInput.value) || 0;
    const security = parseFloat(securityInput.value) || 0; // Deducted so school keeps it
    const advance = parseFloat(advanceInput.value) || 0;
    const deduction = parseFloat(deductionInput.value) || 0;

    const net = (basic + bonus) - (security + advance + deduction);
    netSalaryDisplay.innerText = net.toFixed(2);
}

// Save Record to Local Storage
document.getElementById('save-btn').addEventListener('click', () => {
    const month = document.getElementById('month').value;
    const id = idInput.value.trim().toUpperCase();
    const name = nameInput.value.trim();
    const basic = basicInput.value;
    const net = netSalaryDisplay.innerText;

    if (!month || !id || !name || !basic) {
        alert("Please fill out the Month, Unique ID, Teacher Name, and Basic Salary.");
        return;
    }

    const record = {
        id: Date.now(), // unique record id
        month,
        teacherId: id,
        name: name,
        basic: basic,
        bonus: bonusInput.value || 0,
        security: securityInput.value || 0,
        advance: advanceInput.value || 0,
        deduction: deductionInput.value || 0,
        net: net
    };

    let history = JSON.parse(localStorage.getItem('salaryHistory')) || [];
    history.push(record);
    localStorage.setItem('salaryHistory', JSON.stringify(history));
    
    alert("Record Saved Successfully!");
    renderHistory();

    // Trigger ID input event to instantly update the "Total Saved in School" balance
    idInput.dispatchEvent(new Event('input'));
});

// Render History Table
function renderHistory() {
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('salaryHistory')) || [];

    // Sort by newest first
    history.sort((a, b) => b.id - a.id).forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.month}</td>
            <td>${record.teacherId}</td>
            <td>${record.name}</td>
            <td>$${record.basic}</td>
            <td>$${record.bonus}</td>
            <td>$${record.security}</td>
            <td>$${record.advance}</td>
            <td>$${record.deduction}</td>
            <td><strong>$${record.net}</strong></td>
            <td><button class="delete-btn" onclick="deleteRecord(${record.id})">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Delete Record
function deleteRecord(recordId) {
    if(confirm("Are you sure you want to delete this record?")) {
        let history = JSON.parse(localStorage.getItem('salaryHistory')) || [];
        history = history.filter(record => record.id !== recordId);
        localStorage.setItem('salaryHistory', JSON.stringify(history));
        renderHistory();
        
        // Re-calculate the Total Security Display in case a record was deleted
        idInput.dispatchEvent(new Event('input'));
    }
}

// Clear Form
document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('salary-form').reset();
    netSalaryDisplay.innerText = "0";
    totalSecurityDisplay.innerText = "Total Saved in School: $0";
});

// Print Sheet
document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
});

// Download as PDF
document.getElementById('download-btn').addEventListener('click', () => {
    const element = document.getElementById('salary-slip');
    const opt = {
        margin:       0.5,
        filename:     `Salary_Slip_${idInput.value || 'Blank'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
});