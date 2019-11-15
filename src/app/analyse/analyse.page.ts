import { Component } from '@angular/core';
import * as HighCharts from 'highcharts';

@Component({
  selector: 'app-analyse',
  templateUrl: 'analyse.page.html',
  styleUrls: ['analyse.page.scss']
})
export class analysePage {
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
          data: [{
              name: 'Viande',
              y: 25
          }, {
              name: 'Lait',
              y: 25
          }, {
              name: 'Poule',
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
