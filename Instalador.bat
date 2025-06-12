@echo off

REM Ir a la carpeta del proyecto donde está package.json
cd C:\Users\Ramón Iglesias\Desktop\API_REST-VS

REM Crear carpeta dist si no existe
if not exist dist (
    mkdir dist
)

REM Ejecutar pkg para crear el ejecutable dentro de dist
npx pkg --config package.json server.js --output dist/API_VD --targets node18-linux-x64

pause





