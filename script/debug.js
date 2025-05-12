/**
 * Script para depurar problemas de carga de imágenes
 * Añade este código en un archivo separate (debug-images.js) y cárgalo en tu página
 * o colócalo en un bloque <script> al final de tu index.html
 */

(function() {
    // Ejecutamos cuando el DOM está completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🔍 Iniciando depuración de imágenes...');
      
      // Interceptar todos los errores de carga de imágenes
      document.addEventListener('error', function(event) {
        if (event.target.tagName === 'IMG') {
          console.error(`❌ ERROR al cargar imagen: ${event.target.src}`);
          
          // Análisis de la URL fallida
          const url = event.target.src;
          console.log(`URL original: ${url}`);
          
          // Detectar problemas comunes en las URL
          if (url.endsWith('.jpg1') || url.endsWith('.png1')) {
            console.warn('⚠️ Detectado problema: Extensión duplicada (.jpg1 o .png1)');
            
            // Corregir automáticamente la URL
            const correctedUrl = url.replace(/\.(jpg|png)1$/, '.$1');
            console.log(`URL corregida: ${correctedUrl}`);
            
            // Intentar cargar con la URL corregida
            event.target.src = correctedUrl;
          }
          
          // Detectar rutas que incluyen localhost:4200
          if (url.includes('localhost:4200')) {
            console.warn('⚠️ Detectado problema: URL incluye localhost:4200, lo que puede causar problemas al desplegar');
            
            // Sugerir corrección
            const correctedUrl = url.replace('http://localhost:4200/', '/');
            console.log(`URL relativa sugerida: ${correctedUrl}`);
          }
          
          // Agregar clase visual para identificar imágenes con errores
          event.target.classList.add('image-error');
          
          // Crear marco visual alrededor de la imagen con error
          event.target.style.border = '2px dashed red';
          
          // Agregar tooltip con info del error
          event.target.title = `Error cargando: ${url}`;
        }
      }, true);
      
      // Monitorear carga de imágenes
      const images = document.querySelectorAll('img');
      console.log(`📊 Total de imágenes en la página: ${images.length}`);
      
      // Interceptar solicitudes de red para imágenes (para desarrollo)
      if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          const urlString = url.toString();
          if (urlString.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
            console.log(`🔄 Solicitando imagen: ${urlString}`);
          }
          return originalFetch.apply(this, arguments);
        };
      }
      
      // Crear botón flotante para mostrar panel de depuración
      const debugButton = document.createElement('button');
      debugButton.textContent = '🐞 Debug Imágenes';
      debugButton.style.position = 'fixed';
      debugButton.style.bottom = '10px';
      debugButton.style.right = '10px';
      debugButton.style.zIndex = '9999';
      debugButton.style.padding = '5px 10px';
      debugButton.style.backgroundColor = '#f8d7da';
      debugButton.style.border = '1px solid #f5c6cb';
      debugButton.style.borderRadius = '4px';
      debugButton.style.cursor = 'pointer';
      
      debugButton.addEventListener('click', function() {
        // Contar imágenes con error
        const imagesWithError = document.querySelectorAll('img.image-error');
        
        // Crear panel de información
        const infoPanel = document.createElement('div');
        infoPanel.style.position = 'fixed';
        infoPanel.style.top = '50%';
        infoPanel.style.left = '50%';
        infoPanel.style.transform = 'translate(-50%, -50%)';
        infoPanel.style.zIndex = '10000';
        infoPanel.style.padding = '15px';
        infoPanel.style.backgroundColor = '#fff';
        infoPanel.style.border = '1px solid #ddd';
        infoPanel.style.borderRadius = '4px';
        infoPanel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        infoPanel.style.maxWidth = '400px';
        infoPanel.style.maxHeight = '80vh';
        infoPanel.style.overflow = 'auto';
        
        infoPanel.innerHTML = `
          <h3 style="margin-top:0">Depuración de Imágenes</h3>
          <p>Total de imágenes: <strong>${images.length}</strong></p>
          <p>Imágenes con error: <strong>${imagesWithError.length}</strong></p>
          <p>Estructura de carpetas recomendada:</p>
          <pre style="background:#f5f5f5;padding:5px;overflow:auto">
  assets/
  └── images/
      ├── anillo/
      ├── barbell/
      ├── tuneles/
      ├── plug/
      └── ...
          </pre>
          <div style="margin-top:10px;text-align:right">
            <button id="close-debug-panel" style="padding:5px 10px">Cerrar</button>
          </div>
        `;
        
        document.body.appendChild(infoPanel);
        
        document.getElementById('close-debug-panel').addEventListener('click', function() {
          document.body.removeChild(infoPanel);
        });
      });
      
      document.body.appendChild(debugButton);
    });
  })();