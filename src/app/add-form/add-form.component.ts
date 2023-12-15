import { Component, OnInit, Inject, ViewChild  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { ReportService } from '../report.service';
import { Report } from '../reportModel';
import { MatTable } from '@angular/material/table';
import {MatSort, Sort} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatTableDataSource} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatPaginator} from '@angular/material/paginator';
import { DialogComponent } from '../dialog/dialog.component';

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
//const pigsArray: numPigs[] = []


@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.css']
})
export class AddFormComponent implements OnInit {
  formData = {} as Report;
  form: FormGroup
  //sortedData: tableData[]

  dataSource = new MatTableDataSource(tableDataArray);
  displayedColumns: string[] = ['location','name','dateTime','status','info','retrieve','delete'];

  @ViewChild(MatTable,{static:true}) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatButton) button: MatButton;
  @ViewChild('paginator') paginator:MatPaginator;

  public reportForm: FormGroup;

  ngOnInit(): void {
      
  }

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<AddFormComponent>, @Inject(MAT_DIALOG_DATA) public input:any, private fb: FormBuilder, private http: HttpClient, public reportService: ReportService) {
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

  submit() {
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

    /* console.log(pigsArray.find(e=>e.location === loc));
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
    } */

    
    this.http.post('https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/',
    {"key": data.uuid, "data": data}).subscribe((data:any)=> {
      console.log(data);
    })
    this.reportService.addReport(data);
    this.dataSource.data = tableDataArray;
    //this.table.renderRows();
    console.log(data);
    
    //this.generateMarkers();
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

  /* generateMarkers() {
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
  } */

  delete() {
    this.http.delete('https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/' + '1670220049516')
    .subscribe(()=>console.log('delete successful'));
  }

  retrieve(index: number) {
    tableDataArray[index].status = 'Retrieved';
    let dataUpdate = this.reportService.reports[index];
    let url = 'https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/' + this.reportService.reports[index].uuid;
    this.http.put(url, {"key": this.reportService.reports[index].uuid, "data": dataUpdate}).subscribe();
  }

  deleteRow(index: number) {
    console.log("index: ", index);
    let url = 'https://272.selfip.net/apps/dUuKRpKqJ0/collections/data/documents/' + this.reportService.reports[index].uuid;
    this.http.delete(url).subscribe(()=>console.log('delete successful'));

    tableDataArray.splice(index, 1);

    /* let ind = pigsArray.map(e => e.location).indexOf(this.reportService.reports[index].location);
    if (pigsArray[ind].count != 1) {
      pigsArray[ind].count--;
    } else {
      pigsArray.splice(ind, 1);
    } */

    this.dataSource.data = tableDataArray;
    this.reportService.reports.splice(index, 1);
    this.table.renderRows();

    //this.generateMarkers();
  }

  moreInfo(index: number) {
    console.log(index);
    console.log(this.reportService.reports);
    this.dialog.open(DialogComponent, {
      width: '250px',
      data: { name: this.reportService.reports[index].reporter },
    });
  }

  close(): void {
    this.dialogRef.close();
    console.log(this.input);
  }

}
