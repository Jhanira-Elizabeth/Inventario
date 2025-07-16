import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() { }

  async scanBarcode(): Promise<string> {
    try {
      // En una implementación real, usarías un plugin específico para códigos QR/barras
      // Por ahora, simulamos con la cámara básica
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      // Aquí iría la lógica de procesamiento del código de barras
      // Por simplicidad, devolvemos un código simulado
      return this.simulateBarcodeDetection();
    } catch (error) {
      console.error('Error scanning barcode:', error);
      throw error;
    }
  }

  async takePicture(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Error taking picture:', error);
      throw error;
    }
  }

  async pickFromGallery(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Error picking from gallery:', error);
      throw error;
    }
  }

  private simulateBarcodeDetection(): string {
    // Simulación: devuelve códigos de materiales existentes
    const sampleCodes = ['CBL-001', 'RTR-001', 'CNT-001'];
    const randomIndex = Math.floor(Math.random() * sampleCodes.length);
    return sampleCodes[randomIndex];
  }

  // Método para solicitar permisos de cámara
  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }
}
