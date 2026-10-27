@echo off
setlocal
cd /d "%~dp0"
title TDAHMED - inicializador

echo ========================================
echo             TDAHMED
echo     Organizador academico pessoal
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js nao foi encontrado neste computador.
  echo Instale a versao LTS em https://nodejs.org/ e execute este arquivo novamente.
  echo.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERRO: npm nao foi encontrado. Reinstale o Node.js LTS e tente novamente.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Instalando as dependencias do aplicativo. E necessaria uma conexao com a internet na primeira execucao...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERRO: nao foi possivel instalar as dependencias.
    echo Verifique a conexao com a internet e tente novamente.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando o TDAHMED. Mantenha aberta a janela do servidor.
echo Para interromper o servidor, pressione Ctrl+C nessa janela.
echo.
start "TDAHMED - servidor" /D "%~dp0" cmd /k npm run dev -- --host 0.0.0.0
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173/"
endlocal
