let labelMapping = {};

// URL của Google Apps Script
const googleScriptURL = 'https://script.google.com/macros/s/AKfycbwKu-1r6rgcGVYSY1N0S5eP-m0RJCeZHsE2chlTRMV9AkTpi9_xk3klCa_L9N9tHjCs/exec'; // Thay thế bằng URL của Google Apps Script

fetch('labels.json')
    .then(response => response.json())
    .then(data => {
        labelMapping = data;
    })
    .catch(error => console.error('Error loading JSON:', error));

document.getElementById('processBtn').addEventListener('click', processInput);
document.getElementById('saveBtn').addEventListener('click', saveToExcel);
document.getElementById('printBtn').addEventListener('click', printData);

const familyOrder = [
    "wire",
    "wire-long-cord-failure",
    "wire-wrapping-missing-rings",
    "wire-wire-up-the-base",
    "wire-base-groove-deflection",
    "wire-wire-through-base",
    "wire-no-heat-treat",
    "wire-bend-pin",
    "wire-broken-wire",
    "wire-base",
    "wire-wire-stamping"
];

function processInput() {
    // Get the input data and project name values
    const inputData = document.getElementById('inputData').value.trim();
    const projectName = document.getElementById('projectName').value.trim();

    // Concatenate inputData with the project name
    const inputData3 = `AI_,${projectName}, [${inputData}]`; // Format: "Projectname, [Chuỗi]"

    // Check if inputData or projectName is empty
    if (!inputData || !projectName) {
        console.error('Project name or input data cannot be empty.');
        alert('Please enter both project name and input data.'); // Notify user
        return; // Exit function if data is missing
    }

    // Parse the input data
    const parsedData = parseInputData(inputData);
    const tableBody = document.querySelector('#dataTable tbody');
    const lowQuantityTableBody = document.querySelector('#lowQuantityTable tbody'); // Table for errors < 100
    tableBody.innerHTML = ''; // Clear previous table content
    lowQuantityTableBody.innerHTML = ''; // Clear previous low quantity table content

    // Sort the parsed data by quantity (ascending) for the main table (tableBody)
    const sortedEntries = Object.entries(parsedData).sort((a, b) => a[1] - b[1]);

    // Filter the sorted entries to only include those in the family order
    const filteredEntries = sortedEntries.filter(([englishLabel]) => 
        familyOrder.some(family => englishLabel.includes(family))
    );

    // Display sorted data in the main table (tableBody)
    for (const [englishLabel, quantity] of filteredEntries) {
        const vietnameseLabel = getVietnameseLabel(englishLabel);
        const note = englishLabel.includes("nok") ? "NOK" : "OK";
        const remainingQuantity = Math.max(0, 200 - quantity);

        // Create a new row in the main table
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${englishLabel}</td>
            <td class="${getQuantityClass(quantity)}">${quantity}</td>
            <td>${vietnameseLabel}</td>
            <td>${note}</td>
            <td>${remainingQuantity}</td>
        `;
        tableBody.appendChild(row);
    }

    // Filter and group entries with quantity < 100
    const lowQuantityEntries = filteredEntries.filter(([_, quantity]) => quantity < 100);
    const groupedLowQuantityEntries = groupByFamily(lowQuantityEntries);

    // Display sorted low quantity data in the lowQuantityTableBody
    for (const [englishLabel, quantity] of groupedLowQuantityEntries) {
        const vietnameseLabel = getVietnameseLabel(englishLabel);
        const note = englishLabel.includes("nok") ? "NOK" : "OK";
        const remainingQuantity = Math.max(0, 200 - quantity);
        const lowQuantityRow = document.createElement('tr');
        lowQuantityRow.innerHTML = `
            <td>${englishLabel}</td>
            <td>${quantity}</td>
            <td>${vietnameseLabel}</td>
            <td>${note}</td>
            <td>${remainingQuantity}</td>
        `;
        lowQuantityTableBody.appendChild(lowQuantityRow);
    }

    // Log concatenated data to Google Sheets
    console.log('Logging data:', inputData3); // Log the concatenated string to console
    logToGoogleSheets(inputData3); // Send to Google Sheets
}

// Function to group entries by "family" name (e.g., "pin", "ferrite-core", etc.)
function groupByFamily(entries) {
    // Function to extract family name from the englishLabel
    function getFamilyName(englishLabel) {
        for (let family of familyOrder) {
            if (englishLabel.includes(family)) {
                return family;
            }
        }
        return "other"; // Default group for labels not matching the defined families
    }

    // Sort entries first by family name, then alphabetically by label within each family
    const sortedByFamily = entries.sort((a, b) => {
        const familyA = getFamilyName(a[0]);
        const familyB = getFamilyName(b[0]);
        
        // First sort by family order
        if (familyA !== familyB) {
            return familyOrder.indexOf(familyA) - familyOrder.indexOf(familyB);
        }
        // Then sort alphabetically within the same family
        return a[0].localeCompare(b[0]);
    });

    return sortedByFamily;
}



function logToGoogleSheets(searchQuery) {
    fetch(googleScriptURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'searchQuery': searchQuery // Gửi giá trị searchQuery
        })
    })
        .then(response => {
            if (response.ok) {
                console.log('Search logged to Google Sheets:', response);
            } else {
                console.error('Error sending data to Google Sheets:', response);
            }
        })
        .catch(error => {
            console.error('Error sending data to Google Sheets:', error);
        });
}

// Hàm parse chuỗi với nhiều định dạng khác nhau
function parseInputData(inputData) {
    // Bước 1: Xử lý chuỗi đầu vào, thay thế dấu nháy đơn bằng dấu nháy kép
    const cleanedInput = inputData.replace(/'/g, '"');  // Thay thế dấu nháy đơn bằng nháy kép

    let parsedData = {};

    try {
        // Bước 2: Kiểm tra xem chuỗi có phải là JSON hợp lệ hay không
        parsedData = JSON.parse(cleanedInput);
    } catch (error) {
        console.error('Error parsing string as JSON:', error);

        // Nếu không phải JSON hợp lệ, sử dụng phương pháp cũ (split thủ công)
        const items = inputData.split(',');
        items.forEach(item => {
            const parts = item.split(':');
            if (parts.length === 2) {
                const label = parts[0].trim();
                const quantity = parseInt(parts[1].trim(), 10);
                parsedData[label] = quantity;
            }
        });
    }

    return parsedData;
}

function getVietnameseLabel(englishLabel) {
    return labelMapping[englishLabel] || "N/A"; // Sử dụng labelMapping đã tải
}

function getQuantityClass(quantity) {
    if (quantity < 100) return 'red';
    if (quantity < 200) return 'yellow';
    return '';
}

function saveToExcel() {
    // Get the input data and project name values
    const inputData = document.getElementById('inputData').value.trim();
    const projectName = document.getElementById('projectName').value.trim();

    // Check if inputData or projectName is empty
    if (!inputData || !projectName) {
        console.error('Project name or input data cannot be empty.');
        alert('Please enter both project name and input data.'); // Notify user
        return; // Exit function if data is missing
    }

    const table = document.getElementById('dataTable');
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Data" });

    // Set the file name to the project name
    const fileName = `${projectName}_Model.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

function printData() {
    // Get the input data and project name values
    const inputData = document.getElementById('inputData').value.trim();
    const projectName = document.getElementById('projectName').value.trim();

    // Check if inputData or projectName is empty
    if (!inputData || !projectName) {
        console.error('Project name or input data cannot be empty.');
        alert('Please enter both project name and input data.'); // Notify user
        return; // Exit function if data is missing
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
    printWindow.document.write('th, td { border: 1px solid black; padding: 8px; text-align: left; }');
    printWindow.document.write('h2, h3 { text-align: center; }');
    printWindow.document.write('</style></head><body>');
    
    // Get the current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // Format date and time
    
    // Add the current time to the h2
    printWindow.document.write(`<h2>${formattedDate}</h2>`);
    printWindow.document.write(`<h3>Project Name: ${projectName}</h3>`);
    
    // Write the main data table
    printWindow.document.write(document.getElementById('dataTable').outerHTML);
    printWindow.document.write(`<p><strong>Fillter Data:</strong></p>`);
    // Write the low quantity table
    printWindow.document.write(document.getElementById('lowQuantityTable').outerHTML);
    
    printWindow.document.write(`<p><strong>Input Data:</strong></p>`);
    //printWindow.document.write(`<p>${inputData}</p>`);
    printWindow.document.write(`<p><strong>END</strong></p>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

