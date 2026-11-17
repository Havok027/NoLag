# NoLag

[Português](README.md) | [English](README.en.md) | **Español**

Plugin para Decky Loader (Steam Deck, Legion Go y equipos similares con SteamOS o Bazzite) que reduce la latencia y estabiliza la red: ajustes de Wi-Fi y ruta por juego con Mudfish. Los dos módulos funcionan por separado.

## Pestañas

- **Panel:** arriba, el gráfico en vivo de ping y jitter, que mide sin parar la conexión normal ("Sin Mudfish", sin gastar créditos) y, con Mudfish activo, también por el túnel ("Con Mudfish") para mostrar la ganancia real, con el sello **Modo solo juego (créditos protegidos)** cuando no hay VPN total. Luego, el botón de **Mudfish** (verde cuando está activo), la tabla Conexión y, hacia el final, el botón **Optimizar Wi-Fi**.
- **Wi-Fi:** ajustes de la red local (abajo).
- **Mudfish:** flujo guiado en 3 pasos (instalar, entrar en el panel, activar) con detección automática de la sesión (indicador pasivo "Cuenta conectada" / "Esperando inicio de sesión en la WebUI", sin botón manual), **Auto Selection** (activado por defecto), **Multi-Path** (desactivado), botón para abrir `http://127.0.0.1:8282`, cuenta opcional (usuario y contraseña, guardados solo en este equipo) y Opciones avanzadas (puerto del panel, reinstalar, resetear sesión, ruta, ping, registros).
- **Conf:** activar al abrir un juego (desactivado por defecto), mantener activo al reiniciar (desactivado por defecto), perfiles por juego con interruptores de Wi-Fi y Mudfish, idioma (PT, EN, ES) y diagnóstico.

## Mudfish: primer uso (solo una vez)

1. Abre el panel (`http://127.0.0.1:8282`) y entra en la cuenta.
2. Elige el modo **Basic** o **Multi-Path**.
3. Añade a mano los juegos que quieres optimizar, revisando la región **Auto / South America**.

Este registro se hace una sola vez y queda guardado en la nube de tu cuenta Mudfish. Después, el plugin solo inicia y detiene el servicio y los juegos equipados siguen por rango de IP.

## Aislamiento entre Wi-Fi y Mudfish

Los ajustes de Wi-Fi **nunca** se deshacen al cerrar un juego, al encender la consola ni al apagar Mudfish: solo el botón (o la pestaña Wi-Fi) los restaura. La regla de arrancar apagado y detenerse al cerrar el juego vale **solo** para el servicio de Mudfish.

## API local de Mudfish

El plugin lee (GET) el estado del panel: la sesión viene del propio cliente Mudfish (`isSignedIn`, sin JWT), **Full VPN queda bloqueado en apagado** (si el panel lo enciende, el servicio se detiene para proteger créditos) y la medición de latencia de los nodos (`/do/rtt/*`) se sigue hasta que esté lista. La interfaz `msk` de Mudfish se reconoce al medir. Los comandos que cambian estado (Auto Selection y elementos) aún no se envían: Conf > Diagnóstico captura, en solo lectura, el contexto de esas llamadas en `mudfish-api.json` para verificarlas antes de conectarlas. Hasta entonces, Auto Selection y Multi-Path quedan guardados y la pantalla avisa cuándo debes activarlos en el panel. El acceso automático con la cuenta opcional también depende de esa captura.

## Actualización del núcleo de Mudfish

NoLag consulta la página oficial de versiones de Mudfish (como máximo cada 6 horas) y avisa en el Panel y en la pestaña Mudfish cuando hay un núcleo nuevo. El botón **Actualizar** descarga el instalador de esa versión, reemplaza el binario y reinicia el servicio si estaba encendido. La consulta solo informa: no se instala nada sin tu toque.

## Mudfish: protección de créditos

Mudfish cobra por tráfico, por eso NoLag **siempre arranca con Mudfish apagado**, al encender la consola y al abrir un juego, salvo que actives la opción en la pestaña Conf. Al cerrar cualquier juego, Mudfish se detiene al instante. Encenderlo a mano nunca activa mantener activo.

- **Nunca descargues nada con Mudfish activo** (juegos, actualizaciones, archivos): el tráfico se cobra.
- Usa solo el enrutamiento por juego en el panel de Mudfish. **No actives VPN total del sistema.** NoLag avisa si el tráfico del sistema parece pasar por el túnel.
- **Multi-Path** mejora estabilidad y jitter, pero gasta más créditos.
- La instalación sigue la guía oficial de SteamOS (instalador con `sh`, servicio `mudrun-headless` sin flags, acceso en el panel) en una carpeta persistente enlazada en `/opt/mudfish`, y muestra el motivo exacto si algo falla. La API local de Mudfish no está documentada: Auto Selection y Multi-Path se guardan y la app avisa cuándo debes activarlos en el panel.

## Wi-Fi (módulo independiente)

Pestaña **Wi-Fi**: ajustes de la red local que funcionan solos, sin Mudfish.

- Desactivar el ahorro de energía, corregir al despertar, búferes de red mayores, cola CAKE, IPv6, bloqueo al punto de acceso, banda preferida y DNS.
- Modo streaming (aplica los ajustes solo durante un stream) y corrección de streams atascados.
- **Aplicar optimizaciones seguras** activa todo de una vez; **Restaurar predeterminado** apaga los ajustes de red y mantiene **Corregir al despertar** activado.
- Los ajustes sobreviven a suspensión, reconexión y actualizaciones del sistema (SteamOS y Bazzite). Al desinstalar el plugin, todo se deshace.
- No envía nada a internet. Si el WiFi Optimizer original está instalado, apaga uno de los dos.
- Módulo derivado de WiFi Optimizer 0.25.0 (Arcada Labs, BSD 3-Clause): ver `THIRD_PARTY_NOTICES.md`.

## Idiomas

Português, English y Español (Conf > Idioma).

## Desarrollo

```
pnpm install
pnpm test
pnpm build
```
