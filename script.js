// Variables para los gráficos
let moneyDistributionChart = null;
let amortizationChart = null;

function calculateAll() {
    // Obtener valores de los inputs
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const loanTerm = parseInt(document.getElementById('loanTerm').value);
    const monthlySalary = parseFloat(document.getElementById('monthlySalary').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);

    // Validar que todos los campos estén completos
    if (!loanAmount || !interestRate || !loanTerm || !monthlySalary || !monthlyExpenses) {
        alert('Por favor, complete todos los campos');
        return;
    }

    // Calcular cuota mensual de la hipoteca
    const monthlyRate = interestRate / 12;
    const totalMonths = loanTerm * 12;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, monthlyRate, totalMonths);

    // Calcular total a pagar
    const totalLoanPayment = monthlyPayment * totalMonths;

    // Calcular totales
    const totalExpenses = calculateTotalExpenses(monthlyExpenses, monthlyPayment);
    const availableMoney = calculateAvailableMoney(monthlySalary, totalExpenses);

    // Mostrar resultados
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('availableMoney').textContent = formatCurrency(availableMoney);
    document.getElementById('totalLoanPayment').textContent = formatCurrency(totalLoanPayment);

    // Aplicar colores según el dinero disponible
    const availableMoneyElement = document.getElementById('availableMoney');
    if (availableMoney < 0) {
        availableMoneyElement.parentElement.classList.remove('alert-success');
        availableMoneyElement.parentElement.classList.add('alert-danger');
    } else {
        availableMoneyElement.parentElement.classList.remove('alert-danger');
        availableMoneyElement.parentElement.classList.add('alert-success');
    }

    // Guardar en el historial
    saveToHistory({
        date: new Date(),
        loanAmount: loanAmount,
        interestRate: interestRate * 100,
        loanTerm: loanTerm,
        monthlyPayment: monthlyPayment,
        totalLoanPayment: totalLoanPayment,
        monthlySalary: monthlySalary,
        monthlyExpenses: monthlyExpenses
    });

    // Actualizar gráficos
    updateMoneyDistributionChart(monthlyPayment, monthlyExpenses, availableMoney);
    updateAmortizationChart(loanAmount, interestRate, loanTerm);
}

function calculateMonthlyPayment(principal, monthlyRate, totalMonths) {
    // Fórmula para calcular la cuota mensual de la hipoteca
    if (monthlyRate === 0) {
        return principal / totalMonths;
    }
    
    const x = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyPayment = (principal * monthlyRate * x) / (x - 1);
    
    return monthlyPayment;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Agregar validación de entrada para números positivos y máximo 2 decimales
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', function() {
        // Remover cualquier caracter que no sea número o punto
        let value = this.value.replace(/[^\d.]/g, '');
        
        // Asegurar que solo haya un punto decimal
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limitar a 2 decimales
        if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].slice(0, 2);
        }
        
        // Convertir a número para validar que sea positivo
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            value = '';
        } else if (numValue < 0) {
            value = '0';
        }
        
        this.value = value;
    });
});

// Función para mostrar la pantalla de historial
function showHistory() {
    document.getElementById('resultsCard').style.display = 'none';
    document.getElementById('historyCard').style.display = 'block';
    loadHistory();
}

// Función para volver a la calculadora
function showCalculator() {
    document.getElementById('historyCard').style.display = 'none';
    document.getElementById('resultsCard').style.display = 'block';
}

// Función para guardar en el historial
function saveToHistory(calculation) {
    let history = JSON.parse(localStorage.getItem('mortgageHistory') || '[]');
    history.unshift(calculation); // Agregar al inicio del array
    if (history.length > 10) history.pop(); // Mantener solo los últimos 10 registros
    localStorage.setItem('mortgageHistory', JSON.stringify(history));
}

// Función para cargar el historial
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('mortgageHistory') || '[]');
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    history.forEach((calc, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(calc.date).toLocaleString()}</td>
            <td>${formatCurrency(calc.loanAmount)}</td>
            <td>${calc.interestRate.toFixed(2)}</td>
            <td>${calc.loanTerm}</td>
            <td>${formatCurrency(calc.monthlyPayment)}</td>
            <td>${formatCurrency(calc.totalLoanPayment)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="loadCalculation(${index})">
                    Cargar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para cargar un cálculo previo
function loadCalculation(index) {
    const history = JSON.parse(localStorage.getItem('mortgageHistory') || '[]');
    const calc = history[index];
    
    document.getElementById('loanAmount').value = calc.loanAmount;
    document.getElementById('interestRate').value = calc.interestRate.toFixed(2);
    document.getElementById('loanTerm').value = calc.loanTerm;
    document.getElementById('monthlySalary').value = calc.monthlySalary;
    document.getElementById('monthlyExpenses').value = calc.monthlyExpenses;
    
    showCalculator();
    calculateAll();
}

// Cargar último cálculo al iniciar
window.addEventListener('load', function() {
    const history = JSON.parse(localStorage.getItem('mortgageHistory') || '[]');
    if (history.length > 0) {
        const lastCalc = history[0];
        document.getElementById('loanAmount').value = lastCalc.loanAmount;
        document.getElementById('interestRate').value = lastCalc.interestRate.toFixed(2);
        document.getElementById('loanTerm').value = lastCalc.loanTerm;
        document.getElementById('monthlySalary').value = lastCalc.monthlySalary;
        document.getElementById('monthlyExpenses').value = lastCalc.monthlyExpenses;
    }
});

function updateMoneyDistributionChart(monthlyPayment, monthlyExpenses, availableMoney) {
    // Destruir el gráfico existente si existe
    if (moneyDistributionChart) {
        moneyDistributionChart.destroy();
    }

    const ctx = document.getElementById('moneyDistributionChart').getContext('2d');
    moneyDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Cuota Mensual', 'Gastos', 'Disponible'],
            datasets: [{
                data: [monthlyPayment, monthlyExpenses, availableMoney],
                backgroundColor: [
                    'rgba(23, 162, 184, 0.8)',  // Info
                    'rgba(255, 193, 7, 0.8)',   // Warning
                    'rgba(40, 167, 69, 0.8)'    // Success
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2, // Hace el gráfico más compacto
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateAmortizationChart(loanAmount, interestRate, loanTerm) {
    // Calcular tabla de amortización
    const monthlyRate = interestRate / 12;
    const totalMonths = loanTerm * 12;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, monthlyRate, totalMonths);

    let remainingBalance = loanAmount;
    const payments = [];

    for (let month = 1; month <= totalMonths; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance = Math.max(0, remainingBalance - principalPayment);

        payments.push({
            month,
            principal: principalPayment,
            interest: interestPayment,
            balance: remainingBalance,
            totalPayment: monthlyPayment // La cuota total es constante
        });
    }

    // Remover cualquier event listener anterior
    const yearFilter = document.getElementById('yearFilter');
    const newYearFilter = yearFilter.cloneNode(true);
    yearFilter.parentNode.replaceChild(newYearFilter, yearFilter);

    // Configurar el filtro de año
    newYearFilter.innerHTML = '<option value="">Todos los años</option>';
    
    // Crear opciones cada 5 años
    for (let year = 5; year <= loanTerm; year += 5) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `Años 1-${year}`;
        newYearFilter.appendChild(option);
    }
    
    // Si el plazo no es múltiplo de 5, agregar una opción final
    if (loanTerm % 5 !== 0) {
        const option = document.createElement('option');
        option.value = loanTerm;
        option.textContent = `Años 1-${loanTerm}`;
        newYearFilter.appendChild(option);
    }

    newYearFilter.addEventListener('change', function(e) {
        updateAmortizationChartDisplay(payments, e.target.value);
    });

    // Mostrar el gráfico inicial
    updateAmortizationChartDisplay(payments, '');
}

function updateAmortizationChartDisplay(payments, selectedYear) {
    if (amortizationChart) {
        amortizationChart.destroy();
    }

    let displayPayments;
    if (selectedYear === '') {
        displayPayments = payments;
    } else {
        const endMonth = parseInt(selectedYear) * 12;
        displayPayments = payments.slice(0, endMonth);
    }

    if (!displayPayments || displayPayments.length === 0) {
        return;
    }

    const allValues = displayPayments.map(p => p.totalPayment);
    
    // Simplificar el manejo de límites
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    
    // Ajustar el margen para mejor visualización
    const margin = (maxValue - minValue) * 0.1;
    const adjustedMin = Math.max(0, minValue - margin);
    const adjustedMax = maxValue + margin;

    const ctx = document.getElementById('amortizationChart');
    
    amortizationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayPayments.map(p => `Mes ${p.month}`),
            datasets: [{
                label: 'Interés',
                data: displayPayments.map(p => p.interest),
                backgroundColor: 'rgba(220, 53, 69, 0.6)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1,
                stack: 'stack0'
            }, {
                label: 'Principal',
                data: displayPayments.map(p => p.principal),
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
                stack: 'stack0'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const payment = displayPayments[context.dataIndex];
                            return [
                                'Cuota total: ' + formatCurrency(payment.totalPayment),
                                'Principal: ' + formatCurrency(payment.principal),
                                'Interés: ' + formatCurrency(payment.interest)
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cuota Mensual'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Período'
                    }
                }
            }
        }
    });
}

function calculateTotalExpenses(monthlyExpenses, monthlyPayment) {
    return monthlyExpenses + monthlyPayment;
}

function calculateAvailableMoney(monthlySalary, totalExpenses) {
    return monthlySalary - totalExpenses;
} 