
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { map, filter, scan } from 'rxjs/operators';
import { FormBuilder, FormGroup, AbstractControl, FormControl } from '@angular/forms';
//import 'rxjs/add/operator/map';
import { ReportService } from './report.service';
import { Report } from './reportModel';

import { DatePipe } from '@angular/common'
import { MatTable } from '@angular/material/table';
import {MatSort, Sort} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatPaginator} from '@angular/material/paginator';

import { DialogComponent } from './dialog/dialog.component';
import { AddFormComponent } from './add-form/add-form.component';
import { PasswordComponent } from './password/password.component';

// need to add to make leaflet icons work
import { icon, Marker } from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
}); 
Marker.prototype.options.icon = iconDefault;

export interface tableData {
  location: string;
  reporter: string;
  dateTime: string;
  status: string;
  actions: string;
}

export interface numPigs {
  location: string;
  latitude: number;
  longitude: number;
  count: number;
}

const tableDataArray: tableData[] = []
var pigsArray: numPigs[] = []
var marker: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'angular-project';
  private map: L.Map
  form: FormGroup
  sortedData: tableData[]

  public reportForm: FormGroup;


 /*  myName: string = "";
  inputPhone: string = "";
  inputLocation: string = "";
  inputLatitude: string = "";
  inputLongitude: string = ""; */
  //dateTime: string = "";

  dataSource = new MatTableDataSource(tableDataArray);
  displayedColumns: string[] = ['location','name','dateTime','status','info','retrieve','delete'];

  @ViewChild(MatTable,{static:true}) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatButton) button: MatButton;
  @ViewChild('paginator') paginator:MatPaginator;
  @ViewChild('reportID') reportID?: HTMLElement;

  /* sortData(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  } */

  sortData() {
    let sortFunction = (items: tableData[], sort: MatSort): tableData[] => {
      if (!sort.active || sort.direction === '') {
        return items;
      }

      return items.sort((a: tableData, b: tableData) => {
        let comparatorResult = 0;
        switch (sort.active) {
          case 'reporter':
            comparatorResult = a.reporter.localeCompare(b.reporter);
            break;
          case 'location':
            comparatorResult = a.location.localeCompare(b.location);
            break;
          case 'dateTime':
            comparatorResult = a.dateTime.localeCompare(b.dateTime);
            break;
          case 'status':
            comparatorResult = a.status.localeCompare(b.status);
            break;
          default:
            comparatorResult = a.location.localeCompare(b.location);
            break;
        }
        return comparatorResult * (sort.direction == 'asc' ? 1 : -1);
      });
    };

    return sortFunction;
  }

  constructor(public dialog: MatDialog, private _liveAnnouncer: LiveAnnouncer, private fb: FormBuilder, private http: HttpClient, public reportService: ReportService) {
    this.reportService.reports = [];
    this.form = this.fb.group({
      name: [''],
      avatar: [null],
    });
    this.reportForm = this.fb.group({
      myName: "",
      inputPhone: "",
      inputLocation: "",
      inputLatitude: Number,
      inputLongitude: Number
    })
  }

  /* onSubmit() {

    this.myName=this.reportForm.get('inputName')?.value;
    console.log(this.myName);
  } */

  // TODO: 
  // find a way to identify each unique user added
  // generate a table every time a report is posted/deleted
  // each column can be sortd, so store location, reporter, time reported, and status into an object which contains each of these attributes
  // store into an objects array and make a sort function which sorts by one of the attributes passed in

  // add error handling 
  submitForm() {
    var formData: any = new FormData();
    let date: Date = new Date();
    const data = {} as Report;
    const tableData = {} as tableData;
    

    let name = this.reportForm.get('myName')?.value;
    let phone = this.reportForm.get('inputPhone')?.value;
    let loc = this.reportForm.get('inputLocation')?.value;
    let lat = this.reportForm.get('inputLatitude')?.value;
    let long = this.reportForm.get('inputLongitude')?.value;
    let dateString = date.toISOString();

    data.reporter = name;
    data.uuid = date.getTime().toString();
    data.phone = phone;
    data.location = loc;
    data.latitude = lat;
    data.longitude = long;
    data.dateTime = dateString;
    data.status = 'Ready For Pickup';

    tableData.location = loc;
    tableData.reporter = name;
    tableData.dateTime = dateString;
    tableData.status = 'Ready for Pickup';
    tableDataArray.push(tableData);

    console.log(pigsArray.find(e=>e.location === loc));
    if(!pigsArray.find(e=>e.location === loc)) {
      const pigs = {} as numPigs;
      pigs.location = loc;
      pigs.latitude = lat;
      pigs.longitude = long;
      pigs.count = 1;
      pigsArray.push(pigs);
      console.log("pigsArray: ", pigsArray);
    } else {
      let index = pigsArray.findIndex(({location}) => location === loc);
      pigsArray[index].count++;
    }

    
    this.http.post('https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/',
    {"key": data.uuid, "data": data}).subscribe((data:any)=> {
      console.log(data);
    })
    this.reportService.addReport(data);
    this.dataSource.data = tableDataArray;
    this.table.renderRows();
    console.log(data);
    
    this.generateMarkers();
  }

  /* L.marker([49.2276, -123.0076]).addTo(this.map)
    .bindPopup("<b>Metrotown</b><br />cases reported.").openPopup();

    L.marker([49.1867, -122.8490]).addTo(this.map)
    .bindPopup("<b>SFU Surrey</b><br />cases reported.").openPopup();
   */

  /* refresh() {
    this.myService.doSomething().subscribe((data: myDataType[])=>{
      this.dataSource.data = data;
    })
  } */

  generateMarkers() {
    if (pigsArray.length === 0) {
      this.map.removeLayer(marker)
    }
    // loop through pigs array and use its lat/long values & location name to add markers on the map
    for (let i in pigsArray) {
      if (pigsArray[i].count == 1) {
        marker = L.marker([pigsArray[i].latitude, pigsArray[i].longitude]).addTo(this.map)
        .bindPopup("<b>" + pigsArray[i].location + "</b><br />" + pigsArray[i].count + " pig reported.").openPopup();
      } else {
        marker = L.marker([pigsArray[i].latitude, pigsArray[i].longitude]).addTo(this.map)
        .bindPopup("<b>" + pigsArray[i].location + "</b><br />" + pigsArray[i].count + " pigs reported.").openPopup();
      }
    }
  }

  get(index: number) {
    let url = 'https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/' + tableDataArray[index].reporter.toString();
    this.http.get<Report>(url)
    .subscribe((data:any)=> {
      console.log("retrived: ", data);
    })
    console.log("reportService: ", this.reportService.getReport());
  }

  retrieve(index: number) {
    tableDataArray[index].status = 'Retrieved';
    let dataUpdate = this.reportService.reports[index];
    let url = 'https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/' + this.reportService.reports[index].uuid;
    this.http.put(url, {"key": this.reportService.reports[index].uuid, "data": dataUpdate}).subscribe();
  }

  delete() {
    this.http.delete('https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/' + '1670226050897')
    .subscribe(()=>console.log('delete successful'));
  }
  
  moreInfo(index: number) {
    console.log(index);
    console.log(this.reportService.reports);
    this.dialog.open(DialogComponent, {
      width: '250px',
      data: { name: this.reportService.reports[index].reporter },
    });
  }

  //verify: boolean;
  hash(value: string): boolean {
    this.http.get<Object>('https://api.hashify.net/hash/md5/hex?value=' + value)
    .subscribe((data:any)=> {
      console.log(data.Digest);
      if (data.Digest == "84892b91ef3bf9d216bbc6e88d74a77c") {
        console.log("Correct");
        return true;
      } else {
        alert("Incorrect Password");
        return false;
      }
    })
    return true;
  }

  password: string;
  checkPassRetrieve(index: number) {
    //this.verify = false;
    let dialogRef = this.dialog.open(PasswordComponent, {
      width: '250px',
      data: { password: this.password }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.password = result;
      console.log(this.password);
      if (this.hash(this.password)) {
        console.log("passed");
        this.retrieve(index);
        //this.verify = true;
      } else {
        alert("Incorrect password.");
      }
    })
  }

  checkPassDel(index: number) {
    //this.verify = false;
    let dialogRef = this.dialog.open(PasswordComponent, {
      width: '250px',
      data: { password: this.password }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.password = result;
      console.log(this.password);
      if (this.hash(this.password)) {
        console.log("passed");
        this.deleteRow(index);
        //this.verify = true;
      } else {
        alert("Incorrect password.");
      }
    })
  }

  deleteRow(index: number) {
    console.log("index: ", index);
    let url = 'https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/' + this.reportService.reports[index].uuid;
    this.http.delete(url).subscribe(()=>console.log('delete successful'));

    tableDataArray.splice(index, 1);

    let ind = pigsArray.map(e => e.location).indexOf(this.reportService.reports[index].location);
    if (pigsArray[ind].count != 1) {
      pigsArray[ind].count--;
    } else {
      pigsArray.splice(ind, 1);
    }

    this.dataSource.data = tableDataArray;
    this.reportService.reports.splice(index, 1);
    this.table.renderRows();

    this.generateMarkers();
  }

  ngAfterViewInit(): void { 
    this.addCollection();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.map = L.map('mapid').setView([49.2, -123], 11);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiZGsyNzcyIiwiYSI6ImNsYjYyZjcwYTBjZDM0MHE4OW9uNmc1cHMifQ.zk5kgu2H1puSa62jtvTHww', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1
    }).addTo(this.map);

  }

  addCollection() {
    this.http.post('https://272.selfip.net/apps/dUuKRpKqJ0/collections/',
    {"key":"data","readers":null,"writers":null}).subscribe((data:any)=>{
      console.log(data)
    })
  }

  removeCollection() {
    this.http.delete('https://272.selfip.net/apps/dUuKRpKqJ0/collections/data1/',
    {})
  }

}
