import { Injectable } from '@angular/core';
import { Report } from './reportModel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  reports: Report[] = [];

  // add
  addReport(report: Report) {
    this.reports.push(report);
  }

  // get
  getReport() {
    return this.reports;
  }

  // clear
  clearReport() {
    this.reports = [];
    return this.reports;
  }

  constructor(private http: HttpClient) { }
}
