import { Component, OnInit } from '@angular/core';
import { AdminUser } from '../../entities/admin-user';
import { BaggyBookService } from '../../services/baggy-book.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  standalone: false
})
export class AdminUsersComponent implements OnInit {
  admins: AdminUser[] = [];
  newName = '';
  newPassword = '';
  editingAdmin?: AdminUser;
  editName = '';
  editPassword = '';
  errorMessage = '';

  constructor(private baggyBookService: BaggyBookService) { }

  ngOnInit(): void {
    this.loadAdmins();
  }

  addAdmin(): void {
    const name = this.newName.trim();
    if (!name || !this.newPassword) {
      this.errorMessage = 'Name and password are required.';
      return;
    }

    this.baggyBookService.addAdmin(name, this.newPassword).subscribe({
      next: admin => {
        this.admins = [...this.admins, admin];
        this.newName = '';
        this.newPassword = '';
        this.errorMessage = '';
      },
      error: () => this.errorMessage = 'Unable to add admin user.'
    });
  }

  editAdmin(admin: AdminUser): void {
    this.editingAdmin = admin;
    this.editName = admin.name;
    this.editPassword = '';
    this.errorMessage = '';
  }

  saveAdmin(): void {
    const name = this.editName.trim();
    if (!this.editingAdmin || !name || !this.editPassword) {
      this.errorMessage = 'Name and password are required.';
      return;
    }

    this.baggyBookService.updateAdmin(this.editingAdmin.id, name, this.editPassword).subscribe({
      next: updatedAdmin => {
        this.admins = this.admins.map(admin => admin.id === updatedAdmin.id ? updatedAdmin : admin);
        this.cancelEdit();
      },
      error: () => this.errorMessage = 'Unable to update admin user.'
    });
  }

  deleteAdmin(admin: AdminUser): void {
    this.baggyBookService.deleteAdmin(admin.id).subscribe({
      next: () => {
        this.admins = this.admins.filter(currentAdmin => currentAdmin.id !== admin.id);
        if (this.editingAdmin?.id === admin.id) {
          this.cancelEdit();
        }
      },
      error: () => this.errorMessage = 'Unable to delete admin user.'
    });
  }

  cancelEdit(): void {
    this.editingAdmin = undefined;
    this.editName = '';
    this.editPassword = '';
    this.errorMessage = '';
  }

  private loadAdmins(): void {
    this.baggyBookService.getAdmins().subscribe({
      next: admins => this.admins = admins,
      error: () => this.errorMessage = 'Unable to load admin users.'
    });
  }
}
