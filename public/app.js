document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    // Handle Client Registration Form Submit
    document.getElementById('form-crear-cliente').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/crear-cliente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                e.target.reset();
                loadDashboardData(); // Refresh DB view and stats
            }
        } catch (err) {
            console.error('Error enviando datos:', err);
        }
    });

    // Handle Polyglot Chain Execution Form Submit
    document.getElementById('form-procesar-individual').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idBuscar = document.getElementById('id-buscar').value.trim();
        const container = document.getElementById('resultado-cadena');

        container.innerHTML = '<p style="color: #64748b;">Ejecutando cadena de procesos (C++, COBOL, Java)...</p>';

        try {
            const res = await fetch('/api/procesar-individual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_buscar: idBuscar })
            });

            const data = await res.json();

            if (data.found) {
                container.innerHTML = `
                    <div class="result-box">
                        <h4>⚡ C++ (Árbol) + COBOL + Java Resultados</h4>
                        <p style="margin:3px 0;">Cliente RAM: <b>${data.cppNode}</b> (Nivel Árbol: ${data.treeLevel})</p>
                        ${data.cobolInfo}
                        <hr style="border:0; border-top:1px dashed #cbd5e1; margin:8px 0;">
                        <div class="java-terminal">${data.javaAscii}</div>
                    </div>`;
            } else {
                container.innerHTML = `<p class="error-text">✗ ID '${idBuscar}' no encontrado en el árbol de C++. Salida: ${data.errorOutput}</p>`;
            }
        } catch (err) {
            container.innerHTML = '<p class="error-text">Error ejecutando la cadena de procesos.</p>';
        }
    });
});

// Load stats (Fortran) and Database view (Python) on boot
async function loadDashboardData() {
    try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        document.getElementById('stat-edad').textContent = data.stats.edadMedia;
        document.getElementById('stat-peso').textContent = data.stats.pesoMax;
        document.getElementById('stat-col').textContent = data.stats.colMin;
        document.getElementById('python-db-output').textContent = data.dbRecords || 'Sin datos';
    } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
    }
}