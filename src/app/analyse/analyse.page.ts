import { Component } from '@angular/core';
import * as HighCharts from 'highcharts';

@Component({
  selector: 'app-analyse',
  templateUrl: 'analyse.page.html',
  styleUrls: ['analyse.page.scss']
})
export class analysePage {

  public date: Date = null;
  public sdate: string = null;
  public boAnnee: boolean = false;
  public boBilan: boolean = false;
  public boMois: boolean = true;


  constructor() {
    this.date = new Date();
    this.getDate(this.date.getMonth().toString());
  }

  ionViewWillEnter(){
    let myChart = HighCharts.chart('container', {
      chart: {
          type: 'pie'
      },
      title:{
        text: 'Total'
      },
      series: [{
          name: 'analyse',
          innerSize: '60%',
          data: [{
              name: 'Viande',
              color: '#f42724',
              y: 700
          }, {
              name: 'Lait',
              color:'#24d4f4',
              y: 1000
          }, {
              name: 'Poule',
              color: '#f4ee24',
              y: 4222
          },{
            name: 'test',
            color:'#24d4f4',
            y: 420
        },{
          name: 'test2',
          color:'#24d4f4',
          y: -3007.25
      },]
      }]
    });
    let myChart2 = HighCharts.chart('container2', {
      chart: {
          type: 'pie'
      },
      title:{
        text: 'Postes'
      },
      series: [{
          name: 'analyse',
          innerSize: '60%',
          data: [{
              name: 'poste 1',
              y: 25
          }, {
              name: 'poste 2',
              y: 25
          }, {
              name: 'poste 3',
              y: 25
          },{
            name: 'poste 4',
            y: 25
        },]
      }]
    });
  }

  clickAnnee(){
    this.boAnnee = true;
    this.boBilan = false;
    this.boMois = false;

    this.date = new Date();
    this.sdate = this.date.getFullYear().toString();
  }

  clickMois(){    
    this.boAnnee = false;
    this.boBilan = false;
    this.boMois = true;

    this.date = new Date();
    this.getDate(this.date.getMonth().toString());
  }

  clickBilan(){
    this.boAnnee = false;
    this.boBilan = true;
    this.boMois = false;
    this.sdate = localStorage.getItem("dBilan");
  }
  
add(){
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth();
  let day = d.getDate();
  if(this.boAnnee){
    this.date = new Date(this.date.getFullYear() + 1, this.date.getMonth() , this.date.getDay())
    this.sdate = this.date.getFullYear().toString();
  }
  if(this.boMois){
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 1, this.date.getDay());
    this.getDate(this.date.getMonth().toString());
  }
}  

less(){
  if(this.boAnnee){
    this.date = new Date(this.date.getFullYear() - 1, this.date.getMonth(), this.date.getDay());
    this.sdate = this.date.getFullYear().toString();
  }
  if(this.boMois){
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() - 1, this.date.getDay());
    this.getDate(this.date.getMonth().toString());
  }
}


  getDate(mois: string){
    switch(mois){
      case '12': {
        this.sdate = "Décembre";
        break;

      }
      case '11': {
        this.sdate = "Novembre";
        break;
        
      }
      case '10': {
        this.sdate = "Octobre";
        break;
        
      }
      case '9': {
        this.sdate = "Septembre";
        break;
        
      }
      case '8': {
        this.sdate = "Aout";
        break;
        
      }
      case'7': {
        this.sdate = "Juillet";
        break;
        
      }
      case '6': {
        this.sdate = "Juin";
        break;
        
      }
      case '5': {
        this.sdate = "Mai";
        break;
        
      }
      case '4': {
        this.sdate = "Avril";
        break;
        
      }
      case '3': {
        this.sdate = "Mars";
        break;
        
      }
      case '2': {
        this.sdate = "Février";
        break;
        
      }
      case '1': {
        this.sdate = "Janvier";
        break;
      }
    }
  }
}
