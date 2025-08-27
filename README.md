# ✍️Firma Transparente v3 (Beta)

[![Estado del Proyecto](https://img.shields.io/badge/estado-Beta-green)](https://github.com/KevinHurtado)
[![Tecnología](https://img.shields.io/badge/tech-Vanilla_JS-yellow)](https://developer.mozilla.org/es/docs/Web/JavaScript)

Una herramienta web simple, rápida y privada para eliminar el fondo de tus firmas o cualquier imagen con fondo uniforme, directamente en tu navegador.



---

## ✨ Características Principales

Esta herramienta está diseñada para ser intuitiva y potente, con un fuerte enfoque en la privacidad del usuario.

* **Procesamiento 100% en el Cliente:** Tu privacidad es la prioridad. Las imágenes se procesan directamente en tu navegador y **nunca se suben a un servidor**.
* **Historial Persistente:** ¡No pierdas tu trabajo! Las imágenes que descargas o copias se guardan automáticamente en un historial local. Puedes recargarlas para seguir editando o eliminarlas en cualquier momento.
* **Ajustes en Tiempo Real:** Modifica la **Tolerancia** y el **Suavizado** con controles deslizantes y observa los cambios al instante para un recorte perfecto.
* **Rendimiento Optimizado:** Gracias al uso de **Web Workers**, el procesamiento de imágenes es increíblemente rápido y no congela la interfaz, incluso con archivos grandes.
* **Descarga y Copia:** Exporta tu firma como un archivo `PNG` transparente o cópiala directamente al portapapeles para pegarla en correos, documentos o cualquier aplicación.
* **Cargador Siempre Activo:** El área para subir archivos permanece visible en modo compacto, permitiéndote cargar una nueva imagen rápidamente sin interrumpir tu flujo de trabajo.
* **Soporte Multi-idioma y de Temas:** Cambia entre **Español e Inglés** y elige entre un **tema claro u oscuro** para adaptar la herramienta a tus preferencias.
* **Carga Fácil:** Sube tus imágenes haciendo clic o simplemente **arrastrando y soltando** el archivo en el área designada.

---

## 🚀 Cómo Usar

El proceso es increíblemente sencillo y solo toma unos segundos.

1.  **Sube tu Imagen:** Arrastra y suelta un archivo de imagen (`PNG`, `JPG`, etc.) en el área de carga, o haz clic para seleccionarlo desde tu dispositivo.
2.  **Ajusta los Parámetros:** Una vez que aparezca el editor, utiliza los controles deslizantes de **Tolerancia** y **Suavizado** para eliminar el fondo con precisión.
3.  **Descarga o Copia:** Cuando estés satisfecho con el resultado, haz clic en **Descargar** para obtener un archivo `PNG` o en **Copiar** para guardarlo en tu portapapeles.
4.  **Usa el Historial (Opcional):** Accede a tus creaciones anteriores en la sección de "Historial" en la parte inferior para recargarlas o eliminarlas.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto fue construido sin frameworks, utilizando las tecnologías nativas de la web para garantizar el máximo rendimiento y privacidad.

* **HTML5**
* **CSS3** (con Variables CSS para el theming)
* **JavaScript (ES6+)**
* **API de Canvas de HTML:** Para toda la manipulación de píxeles y procesamiento de imágenes.
* **Web Workers API:** Para ejecutar el procesamiento de imágenes en un hilo separado y mantener la interfaz fluida.
* **IndexedDB API:** Para almacenar el historial de imágenes de forma persistente y segura en el navegador del usuario.

---

## 🔒 Política de Privacidad

La privacidad no es una opción, es una garantía. Esta herramienta opera completamente del lado del cliente.
* **No se recopilan datos.**
* **No se usan cookies de seguimiento.**
* **Tus imágenes nunca abandonan tu computadora.**

## 🛠 Instalación y ejecución local

1. Clonar este repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/firma-transparente.git

  ## Licencia
 * **© Kevin Posso Hurtado**
