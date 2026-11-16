# NoLag

[Português](README.md) | [English](README.en.md) | **Español**

Plugin para Decky Loader (Steam Deck, Legion Go y equipos similares con SteamOS o Bazzite) que reduce la latencia y estabiliza la red: ajustes de Wi-Fi y ruta por juego con Mudfish. Los dos módulos funcionan por separado.

## Pestañas

- **Panel:** dos interruptores rápidos (Wi-Fi y Mudfish), el gráfico en vivo de ping y jitter con y sin Mudfish y la tabla Conexión.
- **Wi-Fi:** ajustes de la red local (abajo).
- **Mudfish:** flujo guiado en 3 pasos (instalar, entrar en el panel, activar), **Auto Selection** (activado por defecto), **Multi-Path** (desactivado), botón para abrir el panel `http://127.0.0.1:8282` y Opciones avanzadas (ruta, ping antes y después, registros).
- **Conf:** activar al abrir un juego (desactivado por defecto), mantener activo al reiniciar (desactivado por defecto), perfiles por juego con interruptores de Wi-Fi y Mudfish, idioma (PT, EN, ES) y diagnóstico.

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
- **Aplicar optimizaciones seguras** activa todo de una vez; **Restaurar** devuelve los valores del sistema.
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
