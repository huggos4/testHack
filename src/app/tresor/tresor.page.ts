import { Component } from '@angular/core';

@Component({
  selector: 'app-tresor',
  templateUrl: 'tresor.page.html',
  styleUrls: ['tresor.page.scss']
})
export class tresorPage {
  public titre;
  public url;
  constructor() {}

  async ionViewWillEnter(){
      this.titre="Trésorerie";
      this.url="../assets/blanc.jpg";
  }

  changePage(){
    this.titre="Stock";
    this.url="../assets/blanc.jpg";
  }
}
