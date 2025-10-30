# Server de la aplicación WEB de itinerarios.

Este es el repositorio para el la creación del servidor de la aplicación para creación de itinerarios en la materia de analisis y diseño de sistemas.

## Configuración del servidor.

1. Si es la primera vez qué se ejecuta

```Bash
    bun i       # Instala las dependencias necesarias.

    bun dev     # Inicia el servidor en modo de desarrollo.
```

2. Si ya lo has ejecutado antes.

```Bash
    bun dev     # Inicia el servidor en modo de desarrollo.
```

3. Crea y llena un archivo `.env` con las variables de entorno correctas, y luego ejecutar el proyecto.
```Py
PORT = 3000

DB_HOST="localhost"
DB_PORT=5432
DB_USER=""
DB_PASSWORD=""
DB_NAME="your database"

SECRET_KEY=""

ENVIRONMENT=""
# HOST="https://harol-lovers.up.railway.app"
HOST="http://localhost:3000"
```

## Reglas para colaborar en el proyecto. 

1. Si no has sido agregado como colaborador del proyecto solicita qué te añada como colaborador del proyecto.

2. Crea una rama con tu nombre sin espacios (Ejemplo: richi) y trabaja ahí.

3. Cuando termines tus cambios NO unas tu rama con la rama principal (main) desde tu computadora, crea un pull request para unir tus cambios a la rama principal.

4. Espera a qué tus cambios sean resueltos y en caso de, realiza los cambios necesarios