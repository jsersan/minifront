import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html'
})
export class BannerComponent implements OnInit, OnDestroy {
  // Array para almacenar las rutas a las imágenes del banner
  bannerImages: string[] = [];
  
  // Variable para mantener track de qué imagen del banner se está mostrando
  currentBannerIndex = 0;
  
  // Variable para almacenar la referencia al temporizador del banner
  bannerInterval: any;

  constructor() { }

  ngOnInit(): void {
    // Cargamos las imágenes del banner
    this.loadBannerImages();
    
    // Iniciamos la rotación automática del banner
    this.startBannerRotation();
  }

  ngOnDestroy(): void {
    // Si hay un intervalo de banner activo, lo eliminamos
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
  }

  // Método para cargar las imágenes del banner
  loadBannerImages(): void {
    this.bannerImages = [
      'assets/images/banner/banner1.jpg',
      'assets/images/banner/banner2.jpg'
    ];
  }

  // Método para iniciar la rotación automática del banner
  startBannerRotation(): void {
    // Configuramos un temporizador que llama a nextBanner cada 5 segundos
    this.bannerInterval = setInterval(() => {
      this.nextBanner();
    }, 5000);
  }

  // Método para mostrar la imagen anterior del banner
  prevBanner(): void {
    // Calculamos el nuevo índice
    this.currentBannerIndex = 
      (this.currentBannerIndex === 0) 
      ? this.bannerImages.length - 1 
      : this.currentBannerIndex - 1;
  }

  // Método para mostrar la siguiente imagen del banner
  nextBanner(): void {
    // Calculamos el nuevo índice
    this.currentBannerIndex = 
      (this.currentBannerIndex === this.bannerImages.length - 1) 
      ? 0 
      : this.currentBannerIndex + 1;
  }
}