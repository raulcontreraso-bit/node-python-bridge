import os
import sqlite3
import sys

# Definimos la carpeta y la ruta completa de la base de datos
DB_DIR = "database"
DB_NAME = os.path.join(DB_DIR, "empresa.db")

TXT_FORTRAN = "datos_medicos.txt"
TXT_COBOL = "datos_seguro.txt"
TXT_CPP = "datos_estructura.txt"

def inicializar_base_datos():
    # Aseguramos que la carpeta 'database' exista antes de conectar
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
        
    conexion = sqlite3.connect(DB_NAME)
    cursor = conexion.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clientes (
            id_interno INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            direccion TEXT,
            telefono TEXT,
            edad INTEGER,
            peso REAL,
            colesterol INTEGER,
            num_seguro TEXT,
            cuota_mensual REAL
        )
    ''')
    conexion.commit()
    conexion.close()

def exportar_datos_fortran():
    conexion = sqlite3.connect(DB_NAME)
    cursor = conexion.cursor()
    cursor.execute("SELECT edad, peso, colesterol FROM clientes")
    filas = cursor.fetchall()
    with open(TXT_FORTRAN, "w") as f:
        for fila in filas:
            f.write(f"{fila[0]} {fila[1]} {fila[2]}\n")
    conexion.close()

def exportar_seguro_cliente(id_cli):
    conexion = sqlite3.connect(DB_NAME)
    cursor = conexion.cursor()
    cursor.execute("SELECT num_seguro, cuota_mensual FROM clientes WHERE id_usuario = ?", (id_cli,))
    fila = cursor.fetchone()
    if fila:
        with open(TXT_COBOL, "w") as f:
            f.write(f"{fila[0]} {fila[1]}\n")
    else:
        with open(TXT_COBOL, "w") as f:
            f.write("")
    conexion.close()

def exportar_estructura_cpp():
    conexion = sqlite3.connect(DB_NAME)
    cursor = conexion.cursor()
    cursor.execute("SELECT id_usuario, nombre FROM clientes")
    filas = cursor.fetchall()
    with open(TXT_CPP, "w") as f:
        for fila in filas:
            nombre_limpio = fila[1].replace(" ", "_")
            f.write(f"{fila[0]} {nombre_limpio}\n")
    conexion.close()

def ingresar_cliente(id_usuario, nombre, direccion, telefono, edad, peso, colesterol, num_seguro, cuota):
    conexion = sqlite3.connect(DB_NAME)
    cursor = conexion.cursor()
    try:
        cursor.execute('''
            INSERT INTO clientes (id_usuario, nombre, direccion, telefono, edad, peso, colesterol, num_seguro, cuota_mensual)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (id_usuario, nombre, direccion, telefono, int(edad), float(peso), int(colesterol), num_seguro, float(cuota)))
        conexion.commit()
        print(f"✓ Cliente {nombre} guardado con éxito.")
        exportar_datos_fortran()
    except sqlite3.IntegrityError:
        print(f"✗ Error: El ID de usuario {id_usuario} ya existe.")
    finally:
        conexion.close()

def mostrar_clientes():
    conexion = sqlite3.connect(DB_NAME)
    cursor = conexion.cursor()
    cursor.execute("SELECT id_interno, id_usuario, nombre, direccion, telefono, edad, peso, colesterol, num_seguro, cuota_mensual FROM clientes")
    filas = cursor.fetchall()
    for f in filas:
        print(f"Internal ID: {f[0]} | User ID: {f[1]} | Nombre: {f[2]} | Dir: {f[3]} | Tel: {f[4]} | Edad: {f[5]} | Peso: {f[6]} | Col: {f[7]} | Seguro: {f[8]} | Cuota: {f[9]}")
    conexion.close()
    exportar_datos_fortran()

if __name__ == "__main__":
    inicializar_base_datos()
    if len(sys.argv) > 1:
        accion = sys.argv[1]
        if accion == "VER":
            mostrar_clientes()
        elif accion == "EXPORTAR_SEGURO" and len(sys.argv) == 3:
            exportar_seguro_cliente(sys.argv[2])
        elif accion == "EXPORTAR_ESTRUCTURA":
            exportar_estructura_cpp()
        elif accion == "CREAR" and len(sys.argv) == 11:
            ingresar_cliente(
                id_usuario=sys.argv[2], nombre=sys.argv[3], direccion=sys.argv[4], telefono=sys.argv[5],
                edad=sys.argv[6], peso=sys.argv[7], colesterol=sys.argv[8], num_seguro=sys.argv[9], cuota=sys.argv[10]
            )
    else:
        mostrar_clientes()