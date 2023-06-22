# Epic Fight!

Simulacion de una batalla entre dos equipos de superhéroes. Los equipos se forman de manera aleatoria seleccionando personajes de una API de superhéroes y se calculan estadísticas para determinar el resultado de la batalla.
Tambien se usa el servicio de correo electrónico Mailgun para el envio de un email.

## Requisitos

Para ejecutar este programa, se requiere tener instalado Node.js en el sistema.

## Uso

1. Clona este repositorio en tu máquina local.
2. Abre una terminal y navega al directorio del proyecto.
3. Ejecuta el siguiente comando para instalar las dependencias:
   ```shell
   npm install
4. Ejcuta el programa con este comando:
    ```shell
    node app.js
5. Se te pedirá que ingreses los correos electrónicos de los destinatarios de los resultados de la batalla.
6. El programa seleccionará aleatoriamente a cinco superhéroes para cada equipo y los mostrará en la consola.
7. Los equipos se enfrentarán en una batalla épica, donde se calcularán los puntos de vida (HP) y los ataques de cada superhéroe.
8. Al final de la batalla, se mostrará el equipo ganador y se enviarán los resultados por correo electrónico a los destinatarios especificados.
