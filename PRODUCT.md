# Relay

## Platform
A browser-based Next.js client connects to the Rust WebSocket relay. The public service runs on Render.

## Transfer workflow
Sending a file and receiving a file deserve equal prominence on entry. One sender shares one file with one receiver using a transfer link or ID. Both tabs stay open through completion. The relay accepts files up to 1 TB. Receivers without direct disk saving have a 32 MiB download limit.
