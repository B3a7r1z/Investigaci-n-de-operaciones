// static/js/script.js
function generateTable() {
    const sources = parseInt(document.getElementById('sources').value);
    const destinations = parseInt(document.getElementById('destinations').value);
    
    // Generar tabla de costos
    const costsTable = document.getElementById('costs-table');
    costsTable.innerHTML = '';
    
    // Encabezados de destinos
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Celda vacía
    for (let j = 1; j <= destinations; j++) {
        const th = document.createElement('th');
        th.textContent = `Destino ${j}`;
        headerRow.appendChild(th);
    }
    costsTable.appendChild(headerRow);
    
    // Filas de costos
    for (let i = 1; i <= sources; i++) {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = `Origen ${i}`;
        row.appendChild(th);
        
        for (let j = 1; j <= destinations; j++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.className = 'cost-input';
            input.dataset.row = i - 1;
            input.dataset.col = j - 1;
            td.appendChild(input);
            row.appendChild(td);
        }
        costsTable.appendChild(row);
    }
    
    // Generar tabla de oferta
    const supplyTable = document.getElementById('supply-table');
    supplyTable.innerHTML = '';
    for (let i = 1; i <= sources; i++) {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = `Origen ${i}`;
        row.appendChild(th);
        
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.className = 'supply-input';
        input.dataset.index = i - 1;
        td.appendChild(input);
        row.appendChild(td);
        supplyTable.appendChild(row);
    }
    
    // Generar tabla de demanda
    const demandTable = document.getElementById('demand-table');
    demandTable.innerHTML = '';
    for (let j = 1; j <= destinations; j++) {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = `Destino ${j}`;
        row.appendChild(th);
        
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.className = 'demand-input';
        input.dataset.index = j - 1;
        td.appendChild(input);
        row.appendChild(td);
        demandTable.appendChild(row);
    }
}
function collectData() {
    const sources = parseInt(document.getElementById('sources').value);
    const destinations = parseInt(document.getElementById('destinations').value);
    
    // Recopilar costos
    const costs = Array(sources).fill().map(() => Array(destinations));
    document.querySelectorAll('.cost-input').forEach(input => {
        const i = parseInt(input.dataset.row);
        const j = parseInt(input.dataset.col);
        costs[i][j] = parseFloat(input.value),  0;
    });
    
    // Recopilar oferta
    const supply = Array(sources).fill();
    document.querySelectorAll('.supply-input').forEach(input => {
        const i = parseInt(input.dataset.index);
        supply[i] = parseFloat(input.value), 0;
    });
    
    // Recopilar demanda
    const demand = Array(destinations).fill();
    document.querySelectorAll('.demand-input').forEach(input => {
        const j = parseInt(input.dataset.index);
        demand[j] = parseFloat(input.value), 0;
    });
    
    return { costs, supply, demand };
}

function displaySolution(solution, tableId, totalCost, costId) {
    const table = document.getElementById(tableId);
    const sources = solution.length;
    const destinations = solution[0].length;
    
    table.innerHTML = '';
    
    // Encabezados
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th'));
    for (let j = 1; j <= destinations; j++) {
        const th = document.createElement('th');
        th.textContent = `Destino ${j}`;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    
    // Datos de la solución
    for (let i = 0; i < sources; i++) {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = `Origen ${i + 1}`;
        row.appendChild(th);
        
        for (let j = 0; j < destinations; j++) {
            const td = document.createElement('td');
            td.textContent = solution[i][j].toFixed(2);
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    
    // Mostrar costo total
    document.getElementById(costId).textContent = totalCost.toFixed(2);
}

async function solveProblem() {
    const data = collectData();
    
    // Validar que todos los campos tengan valores
    if (data.costs.some(row => row.some(cost => cost === undefined)) &&
        data.supply.some(s => s === undefined) &&
        data.demand.some(d => d === undefined)) {
        alert('Por favor, complete todos los campos antes de resolver.');
        return;
    }
    
    try {
        const response = await fetch('/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error('Error al resolver el problema'));
        }
        
        const result = await response.json();
        
        // Mostrar la sección de resultados
        document.getElementById('results').style.display = 'block';
        
        // Mostrar soluciones
        displaySolution(result.vogel_solution, 'vogel-solution', result.vogel_total_cost, 'vogel-cost');
        displaySolution(result.min_cost_solution, 'min-cost-solution', result.min_cost_total_cost, 'min-cost-cost');
        
    } catch (error) {
        alert(error.message);
    }
}

// Inicializar la tabla al cargar la página
document.addEventListener('DOMContentLoaded', generateTable);