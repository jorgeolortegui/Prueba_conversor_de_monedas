const pesosInput = document.getElementById("pesosInput");
const currencySelect = document.getElementById("currencySelect");
const result = document.getElementById("result");
const convertBtn = document.getElementById("convertBtn");
const ctx = document.getElementById("currencyChart").getContext("2d");

let chart; // Referencia al gráfico

const fetchData = async () => {
  try {
    const response = await fetch("https://mindicador.cl/api/");
    if (!response.ok) throw new Error("Error al obtener datos");
    return await response.json();
  } catch (error) {
    result.textContent = `Error: ${error.message}`;
    throw error;
  }
};

const updateChart = (labels, data, label) => {
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Historial últimos 10 días`,
        data,
        borderColor: "#ff5ea3",
        backgroundColor: "rgba(255, 94, 163, 0.2)",
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
};

const fetchAndRender = async () => {
  try {
    const data = await fetchData();
    const moneda = currencySelect.value;
    const montoCLP = Number(pesosInput.value);

    if (!montoCLP || montoCLP <= 0) {
      result.textContent = "Ingresa un monto válido en CLP.";
      return;
    }

    const indicador = data[moneda];
    const valorHoy = indicador.valor;
    const conversion = (montoCLP / valorHoy).toFixed(2);
    result.textContent = `Resultado: $${conversion}`;

    // Obtener historial últimos 10 días
    const historicoResponse = await fetch(`https://mindicador.cl/api/${moneda}`);
    const historicoData = await historicoResponse.json();
    const ultimos10 = historicoData.serie.slice(0, 10).reverse();

    const labels = ultimos10.map(item => item.fecha.split("T")[0]);
    const valores = ultimos10.map(item => item.valor);

    updateChart(labels, valores, moneda.toUpperCase());
  } catch (e) {
    console.error(e);
  }
};

convertBtn.addEventListener("click", fetchAndRender);
