#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Definición de la estructura del Nodo del Árbol Binario de Búsqueda
typedef struct Nodo {
    char id[20];
    char nombre[50];
    struct Nodo* izquierdo;
    struct Nodo* derecho;
} Nodo;

// Función para crear un nuevo nodo
Nodo* crearNodo(const char* id, const char* nombre) {
    Nodo* nuevo = (Nodo*)malloc(sizeof(Nodo));
    if (!nuevo) {
        printf("ERROR|No hay memoria suficiente\n");
        exit(1);
    }
    strcpy(nuevo->id, id);
    strcpy(nuevo->nombre, nombre);
    nuevo->izquierdo = NULL;
    nuevo->derecho = NULL;
    return nuevo;
}

// Función de inserción ordenada en el Árbol Binario de Búsqueda (ABB)
Nodo* insertar(Nodo* raiz, const char* id, const char* nombre) {
    if (raiz == NULL) {
        return crearNodo(id, nombre);
    }
    int cmp = strcmp(id, raiz->id);
    if (cmp < 0) {
        raiz->izquierdo = insertar(raiz->izquierdo, id, nombre);
    } else if (cmp > 0) {
        raiz->derecho = insertar(raiz->derecho, id, nombre);
    } else {
        // Si el ID ya existe, actualizamos el nombre
        strcpy(raiz->nombre, nombre);
    }
    return raiz;
}

// Función de búsqueda que además calcula el nivel de profundidad en el árbol
Nodo* buscarConNivel(Nodo* raiz, const char* idBuscado, int nivelActual, int* nivelEncontrado) {
    if (raiz == NULL) {
        return NULL;
    }
    int cmp = strcmp(idBuscado, raiz->id);
    if (cmp == 0) {
        *nivelEncontrado = nivelActual;
        return raiz;
    }
    if (cmp < 0) {
        return buscarConNivel(raiz->izquierdo, idBuscado, nivelActual + 1, nivelEncontrado);
    } else {
        return buscarConNivel(raiz->derecho, idBuscado, nivelActual + 1, nivelEncontrado);
    }
}

// Función para liberar la memoria del árbol recursivamente
void liberarArbol(Nodo* raiz) {
    if (raiz != NULL) {
        liberarArbol(raiz->izquierdo);
        liberarArbol(raiz->derecho);
        free(raiz);
    }
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printf("ERROR|Falta argumento ID de busqueda\n");
        return 1;
    }

    char* idBuscar = argv[1];
    Nodo* raiz = NULL;

    // Abrimos el archivo de estructura generado por Python
    FILE* archivo = fopen("datos_estructura.txt", "r");
    if (!archivo) {
        printf("NOT_FOUND|El archivo de estructura no existe\n");
        return 1;
    }

    char id_temp[20];
    char nombre_temp[50];

    // Lectura robusta línea a línea del archivo plano
    while (fscanf(archivo, "%19s %49s", id_temp, nombre_temp) == 2) {
        raiz = insertar(raiz, id_temp, nombre_temp);
    }
    fclose(archivo);

    int nivelEncontrado = -1;
    Nodo* resultado = buscarConNivel(raiz, idBuscar, 0, &nivelEncontrado);

    if (resultado != NULL) {
        // Formato estricto esperado por Node.js: ENCONTRADO|ID|Nombre|Nivel
        printf("ENCONTRADO|%s|%s|%d\n", resultado->id, resultado->nombre, nivelEncontrado);
    } else {
        printf("NOT_FOUND|El ID no esta en el arbol\n");
    }

    liberarArbol(raiz);
    return 0;
}