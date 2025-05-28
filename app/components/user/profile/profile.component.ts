// profile.component.ts - ARCHIVO COMPLETO

// Importaciones necesarias de Angular
import { Component, OnInit } from '@angular/core';
// Importación para trabajar con formularios reactivos
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Importación de servicios necesarios
import { AuthService } from '../../../services/auth.service';
// Importación de modelos de datos
import { User } from '../../../models/user';
// Importación para alertas
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // Propiedad para almacenar datos del usuario actual
  currentUser: User | null = null;
  
  // FormGroup para manejar el formulario de actualización de perfil
  profileForm: FormGroup;

  // Constructor con inyección de dependencias
  constructor(
    private formBuilder: FormBuilder,     // Para crear formularios reactivos
    private authService: AuthService     // Para obtener/actualizar datos del usuario
  ) {
    // Obtener el usuario actual desde el servicio de autenticación
    this.currentUser = this.authService.currentUserValue;
    
    // Inicializar el formulario con los datos actuales del usuario
    this.profileForm = this.formBuilder.group({
      username: [this.currentUser?.username, Validators.required],
      password: [''],  // Campo opcional, vacío por defecto
      email: [this.currentUser?.email, [Validators.required, Validators.email]],
      nombre: [this.currentUser?.nombre, Validators.required],
      direccion: [this.currentUser?.direccion, Validators.required],
      ciudad: [this.currentUser?.ciudad, Validators.required],
      cp: [this.currentUser?.cp, Validators.required]
    });
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    console.log('✅ ProfileComponent inicializado - el historial se maneja en HistorialPedidosComponent');
    // Ya no necesitamos cargar pedidos aquí, se hace en HistorialPedidosComponent
  }

  // Método para actualizar los datos del perfil
  updateProfile() {
    // Solicitar confirmación de contraseña antes de actualizar
    Swal.fire({
      title: 'Ingresa tu contraseña actual',
      input: 'password',
      inputPlaceholder: 'Contraseña actual',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#52667a',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.value) {
        // Si el usuario proporcionó la contraseña, proceder con la actualización
        if (this.currentUser) {
          // Crear objeto usuario con los datos del formulario
          const updatedUser: User = {
            ...this.profileForm.value,
            id: this.currentUser.id
          };
          
          // Si no se ingresó nueva contraseña, eliminar esa propiedad
          if (!updatedUser.password) {
            delete updatedUser.password;
          }
          
          // Llamar al servicio para actualizar los datos
          this.authService.updateUser(updatedUser).subscribe({
            next: (data) => {
              // Mostrar mensaje de éxito
              Swal.fire({
                title: 'Datos actualizados con éxito',
                icon: 'success',
                confirmButtonColor: '#52667a'
              });
            },
            error: (error) => {
              // Mostrar mensaje de error
              Swal.fire({
                title: 'Error al actualizar los datos',
                icon: 'error',
                confirmButtonColor: '#52667a'
              });
            }
          });
        }
      }
    });
  }
}