const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const escapeParam = (str) => `"${(str || '').replace(/"/g, '\\"')}"`;

// Helper: Serve Static Files (HTML, CSS, JS)
function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Helper: Parse incoming JSON POST bodies
function parseJsonBody(req, callback) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            callback(JSON.parse(body || '{}'));
        } catch (e) {
            callback({});
        }
    });
}

const server = http.createServer((req, res) => {
    // ---------------------------------------------------------
    // 1. STATIC FILE ROUTES
    // ---------------------------------------------------------
    if (req.method === 'GET' && req.url === '/') {
        return serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && req.url === '/styles.css') {
        return serveStaticFile(res, path.join(PUBLIC_DIR, 'styles.css'), 'text/css');
    }
    if (req.method === 'GET' && req.url === '/app.js') {
        return serveStaticFile(res, path.join(PUBLIC_DIR, 'app.js'), 'application/javascript');
    }

    // ---------------------------------------------------------
    // 2. API ENDPOINTS (JSON Responses)
    // ---------------------------------------------------------
    
    // API: Initial Dashboard Data (Fortran & Python)
    if (req.method === 'GET' && req.url === '/api/dashboard') {
        exec('python3 backend-scripts/python/clientes.py VER', (errorPython, stdoutPython) => {
            exec('./backend-scripts/fortran/estadisticas.out', (errorFortran, stdoutFortran) => {
                let edadMedia = "54.0 años", pesoMax = "222.0 kg", colMin = "222 mg/dL";
                if (!errorFortran && stdoutFortran) {
                    const partes = stdoutFortran.trim().split('|');
                    if (partes.length === 3) {
                        edadMedia = partes[0].trim();
                        pesoMax = partes[1].trim();
                        colMin = partes[2].trim();
                    }
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    stats: { edadMedia, pesoMax, colMin },
                    dbRecords: stdoutPython.trim()
                }));
            });
        });
        return;
    }

    // API: Create Client (Python)
    if (req.method === 'POST' && req.url === '/api/crear-cliente') {
        parseJsonBody(req, (data) => {
            const comando = `python3 backend-scripts/python/clientes.py CREAR ${escapeParam(data.id)} ${escapeParam(data.nombre)} ${escapeParam(data.direccion)} ${escapeParam(data.telefono)} ${escapeParam(data.edad)} ${escapeParam(data.peso)} ${escapeParam(data.colesterol)} ${escapeParam(data.num_seguro)} ${escapeParam(data.cuota)}`;
            
            exec(comando, (err, stdout, stderr) => {
                if (err) console.error(`Error al crear cliente: ${stderr}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: err ? 'error' : 'success' }));
            });
        });
        return;
    }

    // API: Process Chain Execution (Python, COBOL, C++, Java)
    if (req.method === 'POST' && req.url === '/api/procesar-individual') {
        parseJsonBody(req, (data) => {
            const idBuscar = (data.id_buscar || '').trim();

            exec(`python3 backend-scripts/python/clientes.py EXPORTAR_SEGURO ${escapeParam(idBuscar)}`, () => {
                exec(`python3 backend-scripts/python/clientes.py EXPORTAR_ESTRUCTURA`, () => {
                    exec('./backend-scripts/cobol/seguro.out', (errCob, stdoutCob) => {
                        exec(`./backend-scripts/cpp/arbol.out ${escapeParam(idBuscar)}`, (errC, stdoutC) => {
                            exec(`java Auditoria ${escapeParam(idBuscar)}`, (errJava, stdoutJava) => {
                                res.writeHead(200, { 'Content-Type': 'application/json' });

                                if (!errC && stdoutC && stdoutC.startsWith("ENCONTRADO")) {
                                    const datosC = stdoutC.trim().split('|');
                                    let cobolInfo = `<p style="margin:2px 0; color:#e74c3c;">COBOL sin datos.</p>`;

                                    if (!errCob && stdoutCob && stdoutCob.includes("|")) {
                                        const f = stdoutCob.trim().split('|');
                                        cobolInfo = `<p style="margin:2px 0;"><b>Nº Póliza:</b> ${f[0]} ${f[1]} | <b>Total:</b> <b>${f[4]} €</b></p>`;
                                    }

                                    res.end(JSON.stringify({
                                        found: true,
                                        cppNode: datosC[2],
                                        treeLevel: datosC[3],
                                        cobolInfo: cobolInfo,
                                        javaAscii: stdoutJava || ''
                                    }));
                                } else {
                                    res.end(JSON.stringify({
                                        found: false,
                                        errorOutput: stdoutC || 'Vacía'
                                    }));
                                }
                            });
                        });
                    });
                });
            });
        });
        return;
}

    // Default Fallback
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Route Not Found');
});


server.listen(PORT, () => {
    console.log(`🚀 Servidor unificado refactorizado en http://localhost:${PORT}`);
});