# Walkthrough Interactivo con Shepherd.js

## 📋 Descripción

Implementación de un tour guiado interactivo usando **Shepherd.js** para la plataforma ARKIN SELECT. El tour muestra a los nuevos visitantes cómo navegar por la aplicación de manera intuitiva.

## ✨ Características

- ✅ **Overlay oscuro con spotlight** en el elemento activo
- ✅ **Tooltips modernos** con título y descripción
- ✅ **Botones de navegación**: Siguiente / Anterior / Cerrar
- ✅ **Persistencia en localStorage** - Solo se muestra la primera vez
- ✅ **Fácil de extender** - Agregar nuevos pasos es simple
- ✅ **Diseño moderno tipo SaaS** - Estilo oscuro con acentos dorados
- ✅ **Responsive** - Funciona en móvil y desktop
- ✅ **Scroll automático** - Navega suavemente a cada elemento

## 🎯 Pasos del Tour

1. **Bienvenida** - Introducción al tour
2. **Isla Dinámica** - Barra de navegación flotante
3. **Sección Principal** - Hero section con video
4. **Estadísticas** - Números de la empresa
5. **Propiedades Destacadas** - Carrusel interactivo
6. **¿Por qué ARKIN?** - Valores y ventajas
7. **Asistente Virtual** - Chat/llamada IA
8. **Finalización** - Despedida

## 🔧 Cómo Agregar Nuevos Pasos

Edita el archivo `components/shepherd-tour.tsx` y agrega un nuevo objeto al array `steps`:

```typescript
{
  id: "mi-nuevo-paso",
  title: "Título del Paso 🎯",
  text: "Descripción detallada de lo que estás mostrando.",
  attachTo: {
    element: ".mi-selector-css",  // Selector CSS del elemento
    on: "bottom" as const,         // Posición: top, bottom, left, right
  },
  buttons: [
    {
      text: "Anterior",
      classes: "shepherd-button-secondary",
      action: () => tour.back(),
    },
    {
      text: "Siguiente",
      action: () => tour.next(),
    },
  ],
}
```

### Opciones de Posición (`on`)

- `"top"` - Tooltip arriba del elemento
- `"bottom"` - Tooltip abajo del elemento
- `"left"` - Tooltip a la izquierda
- `"right"` - Tooltip a la derecha

### Sin Elemento Específico

Si no quieres destacar un elemento específico, omite `attachTo`:

```typescript
{
  id: "mensaje-general",
  title: "Información General",
  text: "Este mensaje aparece en el centro de la pantalla.",
  buttons: [
    {
      text: "Siguiente",
      action: () => tour.next(),
    },
  ],
}
```

## 🎨 Personalización de Estilos

Los estilos están en `styles/shepherd-custom.css`. Puedes modificar:

### Colores Principales

```css
/* Color del título */
.shepherd-theme-custom .shepherd-title {
  color: #FFD700; /* Dorado de ARKIN */
}

/* Color del botón principal */
.shepherd-theme-custom .shepherd-button {
  background: #FFD700;
  color: #1a1a1a;
}

/* Color del overlay */
.shepherd-modal-overlay-container {
  background: rgba(0, 0, 0, 0.85);
}
```

### Tamaño del Tooltip

```css
.shepherd-element {
  max-width: 420px; /* Ancho máximo */
}
```

## 🔄 Reiniciar el Tour

Para probar el tour nuevamente:

1. Abre la consola del navegador (F12)
2. Ejecuta: `localStorage.removeItem('arkin-tour-completed')`
3. Recarga la página

O simplemente abre la página en modo incógnito.

## 📱 Botón de Inicio Manual

El botón flotante con el ícono ✨ permite a los usuarios reiniciar el tour en cualquier momento. Se muestra:

- Después de 3 segundos para nuevos visitantes
- Inmediatamente para visitantes que ya completaron el tour

## 🛠️ Configuración Avanzada

### Cambiar el Tiempo de Espera Inicial

En `components/shepherd-tour.tsx`:

```typescript
setTimeout(() => {
  setShowStartButton(true)
}, 3000) // Cambiar a los milisegundos deseados
```

### Deshabilitar la Persistencia

Si quieres que el tour se muestre siempre:

```typescript
// Comentar estas líneas:
// localStorage.setItem(TOUR_STORAGE_KEY, "true")
```

### Cambiar el Padding del Spotlight

En `components/shepherd-tour.tsx`:

```typescript
defaultStepOptions: {
  modalOverlayOpeningPadding: 8,    // Espacio alrededor del elemento
  modalOverlayOpeningRadius: 12,    // Radio de las esquinas
}
```

## 📦 Dependencias

- **shepherd.js** - Librería principal para el tour
- Estilos personalizados en `styles/shepherd-custom.css`

## 🐛 Solución de Problemas

### El tour no se muestra

1. Verifica que el elemento con el selector CSS exista en el DOM
2. Revisa la consola del navegador para errores
3. Asegúrate de que el tour no esté marcado como completado en localStorage

### El elemento no se destaca correctamente

- Verifica que el selector CSS sea correcto
- Asegúrate de que el elemento tenga un tamaño visible
- Prueba con diferentes posiciones (`on: "top"`, `"bottom"`, etc.)

### Estilos no se aplican

- Verifica que `@/styles/shepherd-custom.css` esté importado en el componente
- Limpia la caché del navegador (Ctrl + Shift + R)

## 📚 Recursos

- [Documentación oficial de Shepherd.js](https://shepherdjs.dev/)
- [Ejemplos de Shepherd.js](https://shepherdjs.dev/demo/)
- [API Reference](https://shepherdjs.dev/docs/Tour.html)

## 🎯 Mejores Prácticas

1. **Mantén los pasos breves** - Máximo 2-3 oraciones por paso
2. **Usa emojis** - Hacen el tour más amigable y visual
3. **Ordena lógicamente** - Sigue el flujo natural de navegación
4. **Prueba en móvil** - Asegúrate de que funcione bien en pantallas pequeñas
5. **No abuses** - 6-8 pasos es ideal, más de 10 puede ser tedioso
