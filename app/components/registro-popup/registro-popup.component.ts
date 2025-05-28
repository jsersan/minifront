// registro-popup.component.ts - VERSIÓN FINAL CORREGIDA

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro-popup',
  templateUrl: './registro-popup.component.html',
  styleUrls: ['./registro-popup.component.scss']
})
export class RegistroPopupComponent implements OnInit {
  
  @Input() isVisible: boolean = false; // ✅ Propiedad que faltaba
  @Output() closePopup = new EventEmitter<void>(); // ✅ Para cerrar el popup
  
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  
  // URL del backend (actualmente simulado)
  private readonly BACKEND_URL = 'http://localhost/angular16/tatoodenda/backend/register.php'; // ← Para cuando tengas acceso

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    // Inicializar formulario con validaciones
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      direccion: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      cp: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });
  }

  ngOnInit(): void {
    console.log('🔧 RegistroPopupComponent inicializado');
  }

  // Getter para acceso fácil a los controles del formulario
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    
    console.log('📝 Intento de registro iniciado');
    console.log('🔍 Estado del formulario:', this.registerForm.valid);
    console.log('🔍 Valores del formulario:', this.registerForm.value);
    
    // Verificar validez del formulario
    if (this.registerForm.invalid) {
      console.error('❌ Formulario inválido');
      this.markFormGroupTouched();
      return;
    }
    
    // Verificar campos críticos específicamente
    const formValues = this.registerForm.value;
    if (!formValues.nombre || formValues.nombre.trim() === '') {
      console.error('❌ Campo "nombre" está vacío');
      alert('El campo "Nombre completo" es obligatorio');
      return;
    }
    
    if (!formValues.cp || formValues.cp.trim() === '') {
      console.error('❌ Campo "cp" está vacío');
      alert('El campo "Código postal" es obligatorio');
      return;
    }
    
    this.loading = true;
    
    // Crear FormData con validación
    const formData = new FormData();
    
    // Mapear campos exactamente como los espera el backend PHP
    formData.append('username', formValues.username || '');
    formData.append('password', formValues.password || '');
    formData.append('email', formValues.email || '');
    formData.append('nombre', formValues.nombre || '');
    formData.append('direccion', formValues.direccion || '');
    formData.append('ciudad', formValues.ciudad || '');
    formData.append('cp', formValues.cp || '');
    
    // Debug: Mostrar cada campo individualmente
    console.log('📤 username:', formData.get('username'));
    console.log('📤 password:', formData.get('password'));
    console.log('📤 email:', formData.get('email'));
    console.log('📤 nombre:', formData.get('nombre'));
    console.log('📤 direccion:', formData.get('direccion'));
    console.log('📤 ciudad:', formData.get('ciudad'));
    console.log('📤 cp:', formData.get('cp'));
    
    // ✅ SIMULACIÓN COMPLETA DEL BACKEND (sin servidor real)
    console.log('🚀 Simulando registro en backend...');
    
    // Simular validación del lado del servidor
    const simulateServerValidation = () => {
      // Simular que algunos emails ya existen
      const existingEmails = ['test@test.com', 'admin@admin.com', 'usuario@ejemplo.com'];
      
      if (existingEmails.includes(formValues.email.toLowerCase())) {
        throw new Error('El email ya está registrado');
      }
      
      // Simular que algunos usernames ya existen
      const existingUsernames = ['admin', 'test', 'usuario'];
      
      if (existingUsernames.includes(formValues.username.toLowerCase())) {
        throw new Error('El nombre de usuario ya existe');
      }
      
      // Simular error aleatorio (5% de probabilidad)
      if (Math.random() < 0.05) {
        throw new Error('Error temporal del servidor. Inténtalo de nuevo.');
      }
      
      return true;
    };
    
    // Simular delay del servidor (1-3 segundos)
    const serverDelay = Math.floor(Math.random() * 2000) + 1000;
    
    setTimeout(() => {
      try {
        // Ejecutar validación simulada del servidor
        simulateServerValidation();
        
        // ✅ SIMULACIÓN DE ÉXITO
        console.log('✅ Registro simulado exitoso:', {
          username: formValues.username,
          email: formValues.email,
          nombre: formValues.nombre,
          ciudad: formValues.ciudad,
          cp: formValues.cp
        });
        
        this.loading = false;
        this.submitted = false;
        
        // Limpiar formulario
        this.registerForm.reset();
        
        // Mostrar mensaje de éxito realista
        alert(`¡Usuario "${formValues.username}" registrado correctamente!`);
        
        // Cerrar popup
        this.onClosePopup();
        
      } catch (simulatedError: any) {
        // ✅ SIMULACIÓN DE ERROR (con tipo corregido)
        console.error('💥 Error simulado del servidor:', simulatedError.message);
        this.loading = false;
        
        // Mostrar error específico
        alert(`Error: ${simulatedError.message}`);
      }
    }, serverDelay);
    
    return; // ← LÍNEA IMPORTANTE: Evita ejecutar el código real del HTTP
    
    /* ========================================
       CÓDIGO REAL DEL BACKEND (DESACTIVADO)
       ========================================
       Descomenta esto cuando tengas acceso al backend:
       
    this.http.post(this.BACKEND_URL, formData)
      .subscribe({
        next: (response) => {
          console.log('✅ Registro exitoso:', response);
          this.loading = false;
          this.submitted = false;
          
          this.registerForm.reset();
          alert('Usuario registrado correctamente');
          this.onClosePopup();
        },
        error: (error) => {
          console.error('💥 Error en registro:', error);
          this.loading = false;
          
          if (error.error) {
            console.error('Detalles del error del servidor:', error.error);
          }
          
          let errorMessage = 'Error al registrar usuario.';
          
          if (error.status === 500) {
            errorMessage = 'Error interno del servidor.';
          } else if (error.status === 400) {
            errorMessage = 'Datos incorrectos.';
          } else if (error.status === 0) {
            errorMessage = 'No se puede conectar al servidor.';
          }
          
          alert(errorMessage);
        }
      });
    */
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Verificar si un campo tiene errores y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  /**
   * Obtener mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors) {
      const errors = field.errors;
      if (errors['required']) return `${fieldName} es obligatorio`;
      if (errors['email']) return 'Email inválido';
      if (errors['minlength']) return `${fieldName} muy corto`;
      if (errors['pattern']) return `${fieldName} formato inválido`;
    }
    return '';
  }

  /**
   * Cerrar el popup
   */
  onClosePopup(): void {
    this.closePopup.emit();
    this.registerForm.reset();
    this.submitted = false;
    this.loading = false;
  }
}