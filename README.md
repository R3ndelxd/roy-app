# RO'Y - Monitoreo Inteligente de Cadena de Frío

Aplicación móvil Android para el monitoreo de temperatura, cortes eléctricos y autonomía térmica de conservadoras de vacunas.

## Características
- **Aplicación Android Real** (No es una web ni un diseño responsive).
- Interfaz moderna, grandes tarjetas, esquinas redondeadas.
- Simulación offline y persistencia local de eventos.
- Análisis de Ley de Enfriamiento de Newton.
- Generación de reportes PDF nativos.
- Arquitectura preparada para hardware real (ESP32).

---

## 🚀 Cómo instalar y ejecutar

### 1. Instalación de dependencias
La aplicación está construida sobre React Native y Expo. Asegúrate de tener Node.js instalado.

```bash
# Instalar dependencias del proyecto
npm install
# o con yarn
yarn install
```

### 2. Ejecutar en modo desarrollo
```bash
npx expo start
```
Esto abrirá un código QR en la terminal.
- Descarga la aplicación **Expo Go** desde Google Play en tu teléfono Android.
- Escanea el código QR para abrir RO'Y directamente en tu teléfono con funcionalidad táctil completa y recarga rápida.

---

## 📦 Cómo generar un APK instalable

Para generar un archivo `.apk` real que puedas instalar y distribuir sin necesidad de Expo Go:

### Opción 1: Build local (Requiere Android Studio)
```bash
npx expo run:android --variant release
```

### Opción 2: Usar EAS Build (Recomendado, en la nube)
1. Instala EAS CLI: `npm install -g eas-cli`
2. Inicia sesión: `eas login`
3. Configura el build para APK modificando el archivo `eas.json` (si no existe, ejecuta `eas build:configure`):
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```
4. Genera el APK: 
```bash
eas build -p android --profile preview
```
Al finalizar, EAS te proporcionará un enlace directo para descargar el archivo `app.apk`.

---

## ⚙️ Personalización

### Cambiar el nombre de la aplicación
1. Abre el archivo `app.json`.
2. Modifica el campo `"name": "RO'Y"`.
3. Modifica el campo `"package": "com.roy.cadenafrio"` si deseas cambiar el identificador del paquete de Android.

### Cambiar el icono y Splash Screen
- Reemplaza la imagen `./assets/icon.png` (idealmente 1024x1024px).
- Reemplaza la imagen `./assets/adaptive-icon.png` (icono adaptativo de Android).
- Reemplaza la imagen `./assets/splash.png` (la pantalla de carga).

---

## 🔌 Conectar un ESP32 en el futuro

La aplicación actualmente utiliza un sistema de simulación integrado en Zustand (`src/store/useStore.ts`). 

Para conectar un hardware real (ESP32 + DS18B20):

1. **El ESP32 debe enviar datos:** 
   Configura el ESP32 para enviar datos mediante Bluetooth (BLE), MQTT, o peticiones HTTP/WebSockets a la aplicación.
2. **Crear el Proveedor de Datos:**
   Crea un nuevo servicio en `src/services/ESP32DataProvider.ts`.
3. **Reemplazar el Tick de Simulación:**
   En `src/store/useStore.ts`, en lugar de usar `updateTick` con matemáticas simuladas, simplemente actualiza el estado directamente con los datos entrantes del sensor:
   ```typescript
   // Ejemplo de actualización con datos reales
   setInternalTemp(sensorData.temp);
   setAmbientTemp(sensorData.ambientTemp);
   setPowerStatus(sensorData.powerOk ? 'OK' : 'OUTAGE');
   setLidStatus(sensorData.lidOpen ? 'OPEN' : 'CLOSED');
   ```

Toda la lógica de alertas, gráficos y PDF se adaptará automáticamente a los datos reales ya que la interfaz está completamente separada de la fuente de datos.
