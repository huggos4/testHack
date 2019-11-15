import { Component } from '@angular/core';
import * as HighCharts from 'highcharts';

@Component({
  selector: 'app-analyse',
  templateUrl: 'analyse.page.html',
  styleUrls: ['analyse.page.scss']
})
export class analysePage {

  public date: string = new Date().toString();

  constructor() {}

  ionViewWillEnter(){
    let myChart = HighCharts.chart('container', {
      chart: {
          type: 'pie'
      },
      title:{
        text: 'Ateliers'
      },
      series: [{
          name: 'analyse',
          innerSize: '60%',
          data: [{
              name: 'Viande',
              color: '#f42724',
              y: 25
          }, {
              name: 'Lait',
              color:'#24d4f4',
              y: 25
          }, {
              name: 'Poule',
              color: '#f4ee24',
              y: 50
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

}
