import { Component } from '@angular/core';
import * as HighCharts from 'highcharts';
import { BDDProvider } from 'src/services/BDD.service';

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

  public listeOperations: Array<any> = [];
  public listeOperations2: Array<any> = [];
  public listeOperations3: Array<any> = [];
  public listeOperations4: Array<any> = [];

  constructor(public bdd : BDDProvider) {
  }

  async ionViewWillEnter(){
    this.date = new Date();
    this.getDate(this.date.getMonth().toString());
    try{
      let list = await this.bdd.getAnalysesPoste(this.date.getMonth().toString());
      await this.setChart('container', list, 'Exploitation' );
      this.listeOperations = await this.bdd.getAnalysesPosteDetails(this.date.getMonth().toString());

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 3);
      this.setChart('container2', list, 'Atelier Viande' );
      this.listeOperations2 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 3);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 2);
      await this.setChart('container3', list, 'Atelier Lait' );
      this.listeOperations3 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 2);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 1);
      await this.setChart('container4', list, 'Non affectable' );
      this.listeOperations4 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 1);

    }catch(e){
      console.log(e);
    }
  }

  public setChart(container: string, list: any, titre: string){
    let myChart = HighCharts.chart(container, {
      chart: {
          type: 'pie'
      }, 
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: false
              },
              showInLegend: true
          }
      },
      credits: {
          enabled: false
      },
      title:{
        text: titre
      },
      series: [{
          name: 'analyse',
          innerSize: '60%',
          data: list,
          type: undefined
      }]
    });
    
  }

  async clickAnnee(){
    this.boAnnee = true;
    this.boBilan = false;
    this.boMois = false;

    this.date = new Date();
    this.sdate = this.date.getFullYear().toString();
    try{
      let list = await this.bdd.getAnalysesPosteAnnee();
      this.setChart('container', list, 'Exploitation');
      this.listeOperations = await this.bdd.getAnalysesPosteDetailsAnnee();

      list = await this.bdd.getAnalysesAtelierAnnee(3);
      this.setChart('container2', list, 'Atelier Viande' );
      this.listeOperations = await this.bdd.getAnalysesAtelierDetailsAnnee(3);
      list = await this.bdd.getAnalysesAtelierAnnee(2);
      this.setChart('container3', list, 'Atelier Lait' );
      this.listeOperations = await this.bdd.getAnalysesAtelierDetailsAnnee(2);
      list = await this.bdd.getAnalysesAtelierAnnee(1);
      this.setChart('container4', list, 'Non affectable' );
      this.listeOperations = await this.bdd.getAnalysesAtelierDetailsAnnee(1);
      

    }catch(e){
      console.log(e);
    }
  }

  async clickMois(){    
    this.boAnnee = false;
    this.boBilan = false;
    this.boMois = true;

    this.date = new Date();
    this.getDate(this.date.getMonth().toString());
    try{
      let list = await this.bdd.getAnalysesPoste(this.date.getMonth().toString());
      this.setChart('container', list, 'Exploitation');
      this.listeOperations = await this.bdd.getAnalysesPosteDetails(this.date.getMonth().toString());

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 3);
      this.setChart('container2', list, 'Atelier Viande' );
      this.listeOperations2 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 3);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 2);
      await this.setChart('container3', list, 'Atelier Lait' );
      this.listeOperations3 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 2);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 1);
      await this.setChart('container4', list, 'Non affectable' );
      this.listeOperations4 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 1);


    }catch(e){
      console.log(e);
    }
  }

  clickBilan(){
    this.boAnnee = false;
    this.boBilan = true;
    this.boMois = false;
    this.sdate = localStorage.getItem("dBilan");
  }
  
async add(){
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
    try{
      let list = await this.bdd.getAnalysesPoste(this.date.getMonth().toString());
      this.setChart('container', list, 'Exploitation');
      this.listeOperations = await this.bdd.getAnalysesPosteDetails(this.date.getMonth().toString());

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 3);
      this.setChart('container2', list, 'Atelier Viande' );
      this.listeOperations2 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 3);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 2);
      await this.setChart('container3', list, 'Atelier Lait' );
      this.listeOperations3 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 2);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 1);
      await this.setChart('container4', list, 'Non affectable' );
      this.listeOperations4 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 1);

    }catch(e){
      console.log(e);
    }
  }
}  

async less(){
  if(this.boAnnee){
    this.date = new Date(this.date.getFullYear() - 1, this.date.getMonth(), this.date.getDay());
    this.sdate = this.date.getFullYear().toString();
  }
  if(this.boMois){
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() - 1, this.date.getDay());
    this.getDate(this.date.getMonth().toString());
    try{
      let list = await this.bdd.getAnalysesPoste(this.date.getMonth().toString());
      this.setChart('container', list, 'Exploitation');
      this.listeOperations = await this.bdd.getAnalysesPosteDetails(this.date.getMonth().toString());

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 3);
      this.setChart('container2', list, 'Atelier Viande' );
      this.listeOperations2 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 3);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 2);
      await this.setChart('container3', list, 'Atelier Lait' );
      this.listeOperations3 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 2);

      list = await this.bdd.getAnalysesAtelier(this.date.getMonth().toString(), 1);
      await this.setChart('container4', list, 'Non affectable' );
      this.listeOperations4 = await this.bdd.getAnalysesAtelierDetails(this.date.getMonth().toString(), 1);



    }catch(e){
      console.log(e);
    }
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
