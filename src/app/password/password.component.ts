import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  index: string


  ngOnInit(): void {
  }

  constructor(public dialogRef: MatDialogRef<PasswordComponent>, @Inject(MAT_DIALOG_DATA) public data:any) {
    
  }

  close(): void {
    this.dialogRef.close();
    console.log(this.data);
  }
}
