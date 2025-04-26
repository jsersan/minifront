// Importaciones necesarias de Angular
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

// Importación del servicio de autenticación
import { AuthService } from 'src/app/services/auth.service';

// Importación de SweetAlert para notificaciones
import Swal from 'sweetalert2';

// Interfaz de loginForm
interface LoginForm {
    username: FormControl<string | null>;
    password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit {
  
  // FormGroup para manejar el formulario de login
  loginForm: FormGroup;
  
  // Flag para indicar si hay una operación en curso
  loading = false;
  
  // Flag para indicar si el formulario se ha enviado
  submitted = false;
  
  // URL a la que redirigir después del login exitoso
  returnUrl: string = '/';

  // Constructor con inyección de dependencias
  constructor(
    private formBuilder: FormBuilder,     // Para crear formularios reactivos
    private route: ActivatedRoute,        // Para acceder a los parámetros de la ruta
    private router: Router,               // Para la navegación
    private authService: AuthService      // Para el servicio de autenticación
  ) {
    // Redireccionar al home si el usuario ya está logueado
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    // Inicializar el formulario con validadores
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtener la URL de retorno desde los parámetros o usar '/' por defecto
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() { return this.loginForm.controls as unknown as LoginForm; }

  // Método que se ejecuta al enviar el formulario
  onSubmit() {
    this.submitted = true;

    // Detener si el formulario es inválido
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    // Llamar al servicio de autenticación para iniciar sesión
    this.authService.login(
      this.f.username.value ?? '', 
      this.f.password.value ?? ''
    )  
      .subscribe({
        next: (data) => {
          // Redirigir a la URL de retorno en caso de éxito
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          // Mostrar mensaje de error
          Swal.fire({
            title: 'Usuario o contraseña erróneos',
            icon: 'error',
            confirmButtonColor: '#52667a'
          });
          this.loading = false;
        }
      });
  }
  

  // Método para navegar a la página de registro
  goToRegister() {
    this.router.navigate(['/register']);
  }
  
}
