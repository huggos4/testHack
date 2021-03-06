﻿import { Injectable,isDevMode } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { insertDT } from '../assets/bdd/donneesTech';
import { insertBQ } from '../assets/bdd/donneesBanque';
import { insertPO } from '../assets/bdd/donneesPoste';
import { insertAT } from '../assets/bdd/donneesAtelier';
import { insertAF } from '../assets/bdd/donneesAffectation';

@Injectable()
export class BDDProvider {
    protected db: any;
    private listeTables: Array<String> = [];
    protected readonly versionBDD = "20190924";
    protected lastSync = "19500101";
    public premiereCo = false;

    constructor(private sqlite: SQLite) {
        this.listeTables = ['airbnb'];
        this.getBDD().then((data) => { this.db = data; });
    } 


    public isBDDMAJ(): boolean {
        let booMAJ: boolean=false;
        //version actuelle
        let vBDD = localStorage.getItem("versionBDD");
        if (vBDD && vBDD < this.versionBDD){
            booMAJ = true;
        }
        return booMAJ;
    }

    public async getBDD(): Promise<any> {
        if (this.db || this.db != null || this.db != undefined) {
            return this.db;
        }
        else {
            if (isDevMode()) {
                return new Promise((resolve, reject) => {
                    (<any>window).sqlitePlugin = {};
                    (<any>window).sqlitePlugin.openDatabase = function () {
                        return (<any>window).openDatabase('hackatontest.db', '1.0', 'hackatontest', 10000000);
                    };
                    this.db = (<any>window).sqlitePlugin.openDatabase();
                    //Ajout d'une fonction pour la compatibilité avec WebSQL
                    this.db.executeSql = (sql, params, callback): Promise<any> => {
                        return new Promise((resolve2, reject2) => {
                            this.db.transaction((tx) => {
                                tx.executeSql(sql, params, (tx, result) => {
                                    if (callback) { callback(result); }
                                    resolve2(result);
                                }, (tx, e) => { reject2(e); });
                            });
                        });
                    };
                    resolve(this.db);
                });
            } else {
                this.db = await this.sqlite.create({
                    name: 'hackatontest.db',
                    location: 'default'
                });
                return this.db;
            }
        }        
    }

    async initBDD(booForce: boolean = false) {
        let vBDD = localStorage.getItem("versionBDD");

        if (!vBDD || booForce) {
            await this.getBDD();
            await this.deleteBDD();
            await this.createBDD();
            localStorage.setItem("versionBDD", this.versionBDD);
            localStorage.removeItem("lastSync");

        } else if (vBDD && vBDD < this.versionBDD) {
            //MAJ de la BDD
            await this.majBDD(vBDD, this.versionBDD);
        }
    }

    private async createBDD() {
        await new Promise((resolve, reject) => {
            this.db.transaction(async (tx: SQLiteObject) => {
                try {
                    let lProm: Array<Promise<any>> = [];
                    //creation des tables
                    //table elevage 
                    
                    console.log("ok");

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Transac(idTransaction integer PRIMARY KEY AUTOINCREMENT,  montantTransaction real,  libTransaction text,  dateTransaction text,  idCompte integer)', []));
                     
                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Poste(idPoste integer PRIMARY KEY AUTOINCREMENT,  libPoste text,  codePoste text, couleurPoste text)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Atelier(idAtelier integer PRIMARY KEY AUTOINCREMENT,  libAtelier text,  codeAtelier text, couleurAtelier text)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Affectation(  idAtelier integer,  idPoste integer,  idTransaction integer, pourcentageAffectation numeric)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS DonneesTechniques(  idDonnees integer PRIMARY KEY AUTOINCREMENT,  dateDonnees text,  Poids numeric,  Nuchep text,  Nubovi text,  Sexe text,  CodeRace text,  CauseSortie text,  idTransaction integer)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Compte(idCompte integer PRIMARY KEY AUTOINCREMENT,  login text,  mdp text,  libCompte text,  codeBanque text,  typeCompte text)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE Transaction ADD FOREIGN KEY(idCompte) REFERENCES Compte (idCompte)', []));
 
                    // lProm.push(tx.executeSql('ALTER TABLE Affectation ADD FOREIGN KEY(idAtelier) REFERENCES Atelier (idAtelier)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE Affectation ADD FOREIGN KEY(idPoste) REFERENCES Poste (idPoste)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE Affectation ADD FOREIGN KEY(idTransaction) REFERENCES Transaction (idTransaction)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE DonneesTechniques ADD FOREIGN KEY (idTransaction) REFERENCES Transaction (idTransaction)', []));
                    
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                    //just a test
                    await this.recupDonneesBanque();
                    await this.recupDonneesTechnique();
                    await this.recupDonneesPoste();
                    await this.recupDonneesAtelier();
                    await this.recupDonneesAffectation();

                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });        
    }

    private async deleteBDD() {
        await new Promise((resolve, reject) => {
           this.db.transaction(async (tx: SQLiteObject) => {
                try {
                    let lProm: Array<Promise<any>> = [];
                    if (!isDevMode()) {
                        lProm.push(tx.executeSql('PRAGMA writable_schema = 1', []));
                        lProm.push(tx.executeSql("delete from sqlite_master where type in ('table', 'index', 'trigger')", []));
                        lProm.push(tx.executeSql("PRAGMA writable_schema = 0", []));
                    } else {
                        this.listeTables.forEach((sTable) => {
                            lProm.push(tx.executeSql("DROP TABLE " + sTable, []));
                        });
                    }
                    await Promise.all(lProm);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
        if (!isDevMode()) {
            await this.db.executeSql("VACUUM", []);
            await this.db.executeSql("PRAGMA INTEGRITY_CHECK", []);
        }    
    }


    private async recupDonneesTechnique(){
        let dbTMP = await this.getBDD();
            dbTMP.transaction(async (tx: SQLiteObject) => {
                try {
                    let lProm: Array<Promise<any>> = [];
                    insertDT.forEach((script: string)=>{
                        lProm.push(tx.executeSql(script, []));
                    });
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            });
    }

    private async recupDonneesBanque(){
        let dbTMP = await this.getBDD();
            dbTMP.transaction(async (tx: SQLiteObject) => {
                try { 
                    let lProm: Array<Promise<any>> = [];
                    console.log(insertBQ);
                    insertBQ.forEach((script: string)=>{
                        lProm.push(tx.executeSql(script, []));
                    });
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            });
    }
    
    private async recupDonneesPoste(){
        let dbTMP = await this.getBDD();
            dbTMP.transaction(async (tx: SQLiteObject) => {
                try { 
                    let lProm: Array<Promise<any>> = [];
                    console.log(insertPO);
                    insertPO.forEach((script: string)=>{
                        lProm.push(tx.executeSql(script, []));
                    });
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }); 
    }

    private async recupDonneesAtelier(){
        let dbTMP = await this.getBDD();
            dbTMP.transaction(async (tx: SQLiteObject) => {
                try { 
                    let lProm: Array<Promise<any>> = [];
                    console.log(insertAT);
                    insertAT.forEach((script: string)=>{
                        lProm.push(tx.executeSql(script, []));
                    });
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }); 
    }

    private async recupDonneesAffectation(){
        let dbTMP = await this.getBDD();
            dbTMP.transaction(async (tx: SQLiteObject) => {
                try { 
                    let lProm: Array<Promise<any>> = [];
                    console.log(insertAF);
                    insertAF.forEach((script: string)=>{
                        lProm.push(tx.executeSql(script, []));
                    });
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }); 
    }

    private async majBDD(versionAncien: string, versionMAJ: string) {
        console.log("detection localBDD < vBDD");
        //exemple de MAJ : Si la version précédent la MAJ de l'application est antérieure ou égale à "20180404"
        //on passe les scripts ci-dessous (ALTER, etc...)
        if (versionAncien <= versionMAJ) {
            //MAJ ICI
            let dbTMP = await this.getBDD();
            dbTMP.transaction(async (tx: SQLiteObject) => {
                try {
                    let lProm: Array<Promise<any>> = [];
                    if(versionAncien <= "20190723") {
                            lProm.push(tx.executeSql('ALTER TABLE elevage ADD COLUMN LONGITUDE character varying(10)', []));
                            lProm.push(tx.executeSql('ALTER TABLE elevage ADD COLUMN LATITUDE character varying(10)', []));
                            lProm.push(tx.executeSql('ALTER TABLE installation ADD COLUMN LAC2 integer', []));
                    } 
                    if (versionAncien <= "20190924") {
                        lProm.push(tx.executeSql('ALTER TABLE verification ADD COLUMN INSTALLATEUR character varying(100)', []));
                    }
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);
                } catch (e) { 
                    console.log(e);
                    throw e;
                }
            });
        }

        //TODO SUPPRIMER !!
        if (versionMAJ == "20190723") {
            await this.initBDD(true);
        }

        
        

    }
   
    public async insertCompte(compte: any) {
        let sRequete = "INSERT INTO Compte(login, mdp, codeBanque, typeCompte, libCompte)VALUES (?,?,?,?,'Compte chèque')";
        await new Promise((resolve, reject) => {
            try {
                this.db.transaction(async (tx: SQLiteObject) => {
                    await tx.executeSql(sRequete, [compte.NUM, compte.MDP, compte.CODE, compte.TYPE]);
                    resolve();
                });
            } catch (e) {
                //console.log(e)
                reject(e);
            }
        });
    }

    public async getComptes() {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete = 'SELECT * from Compte';
        let res = await this.db.executeSql(sRequete, []);
        let listeRes: Array<any> = [];
        let num, lib, codeBanque, type: string;
        for (var i = 0; i < res.rows.length; i++) {
            listeRes.push(res.rows.item(i));
            lib = listeRes[i].libCompte;
            num = listeRes[i].login;
            codeBanque = listeRes[i].codeBanque;
            type = listeRes[i].typeCompte;
            
        }
        console.log(listeRes);
        return listeRes;
    }

    public async insertAtelier(atelier:any) {
        let sRequete = "INSERT INTO Atelier(libAtelier,codeAtelier)VALUES (?,?)";
        await new Promise((resolve, reject) => {
            try {
                this.db.transaction(async (tx: SQLiteObject) => {
                    await tx.executeSql(sRequete, [atelier.libAtelier, atelier.codeAtelier]);
                    resolve();
                });
            } catch (e) {
                //console.log(e)
                reject(e);
            }
        });
    }

    public async insertPoste() {
        let sRequete = "INSERT INTO Poste(libPoste,codePoste)VALUES ('Achat Nourriture', 'ANOU'),('Achats divers','ADIV')";
        await new Promise((resolve, reject) => {
            try {
                this.db.transaction(async (tx: SQLiteObject) => {
                    await tx.executeSql(sRequete);
                    resolve();
                });
            } catch (e) {
                //console.log(e)
                reject(e);
            }
        });
    }
      public async getOperations(idCompte?:any) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete;
        if (!idCompte){
             sRequete ='SELECT DISTINCT Transac.idTransaction, montantTransaction, SUBSTR(libTransaction, 1, 40) as libTransaction, dateTransaction, (substr(dateTransaction,7)||substr(dateTransaction,4,2)||substr(dateTransaction,1,2)) as date, Transac.idCompte, libAtelier, libPoste from Transac, Affectation, Atelier, Poste, Compte WHERE Transac.idTransaction = Affectation.idTransaction AND Poste.idPoste = Affectation.idPoste AND Atelier.idAtelier = Affectation.idAtelier ORDER BY date DESC';
        }
        else {
             sRequete = 'SELECT DISTINCT Transac.idTransaction, montantTransaction, SUBSTR(libTransaction, 1, 40) as libTransaction, dateTransaction, (substr(dateTransaction,7)||substr(dateTransaction,4,2)||substr(dateTransaction,1,2)) as date, Transac.idCompte, libAtelier, libPoste from Transac , Affectation, Atelier, Poste, Compte WHERE Compte.idCompte = ? AND  Transac.idTransaction = Affectation.idTransaction AND Poste.idPoste = Affectation.idPoste AND Atelier.idAtelier = Affectation.idAtelier AND Transac.idCompte = Compte.idCompte ORDER BY date DESC';
        }
        let res;
        if (!idCompte){
            try{
                res = await this.db.executeSql(sRequete);     
            }
           catch(e){
               console.log(e);
           }
        }
        else {
            try{
                res = await this.db.executeSql(sRequete, [idCompte]);    
            }
           catch(e){
               console.log(e);
           }
            
        }
       
        let listeRes: Array<any> = [];
        let montant, libelleTransac, date, libellePoste, libelleAtelier: string;
        for (var i = 0; i < res.rows.length; i++) {
            listeRes.push(res.rows.item(i));
            montant = listeRes[i].montantTransaction;
            libelleTransac = listeRes[i].montantTransaction;
            date = listeRes[i].dateTransaction;
            libellePoste = listeRes[i].libellePoste;
            libelleAtelier = listeRes[i].libelleAtelier;
            
        }
        console.log(listeRes);
        return listeRes;
        
    }

    public async getAnalysesPoste(mois: string) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        if(mois.length == 1){
            mois = '0'+ mois;
        }
        console.log(mois);
        let sRequete1 = 'SELECT  ROUND(SUM(t.montantTransaction),2) somme, p.idPoste, p.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Poste p ON p.idPoste = a.idPoste '+
        ' WHERE t.montantTransaction > 0 AND substr(t.dateTransaction,4,2) = ? ' +
        ' GROUP BY p.idPoste,  p.libPoste ' +
        ' ORDER BY somme desc';
        let res1 = await this.db.executeSql(sRequete1, [mois]);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'green', y:item.somme});
        } 

        let sRequete2 = 'SELECT  ROUND(SUM(t.montantTransaction),2) somme, p.idPoste, p.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Poste p ON p.idPoste = a.idPoste '+
        ' WHERE t.montantTransaction < 0 AND substr(t.dateTransaction,4,2) = ? ' +
        ' GROUP BY p.idPoste,  p.libPoste ' +
        ' ORDER BY somme desc';
        let res2 = await this.db.executeSql(sRequete2, [mois]);
        for (var i = 0; i < res2.rows.length; i++) {
            item = res2.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'red', y:Math.abs(item.somme)});
        }
        console.log(listeRes);
        return listeRes;
    }

    public async getOperation(idOperation:any) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete;
        let operation:any;
        sRequete = 'SELECT Transac.idTransaction, montantTransaction, libTransaction, dateTransaction, (substr(dateTransaction,7)||substr(dateTransaction,4,2)||substr(dateTransaction,1,2)) as date, Transac.idCompte, Atelier.idAtelier as idAtelier, libAtelier, Poste.idPoste as idPoste, libPoste from Transac , Affectation, Atelier, Poste, Compte WHERE Transac.idTransaction = ? AND  Transac.idTransaction = Affectation.idTransaction AND Poste.idPoste = Affectation.idPoste AND Atelier.idAtelier = Affectation.idAtelier AND Transac.idCompte = Compte.idCompte ORDER BY date DESC';
        let res;
            try{
                res = await this.db.executeSql(sRequete, [idOperation]);     
            }
           catch(e){
               console.log(e);
           }
           console.log(res);
        operation =res.rows.item(0);
        return operation;
        
    }

    public async getPostes() {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete;
        let listeRes:Array<any> = [];
        sRequete = 'SELECT * FROM Poste';
        let res;
            try{
                res = await this.db.executeSql(sRequete);     
            }
           catch(e){
               console.log(e);
           }
           for (var i = 0; i < res.rows.length; i++) {
            listeRes.push(res.rows.item(i));
        };
        return listeRes;
        
    }

    public async getAteliers() {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete;
        let listeRes:Array<any> = [];
        sRequete = 'SELECT * FROM Atelier';
        let res;
            try{
                res = await this.db.executeSql(sRequete);     
            }
           catch(e){
               console.log(e);
           }
           for (var i = 0; i < res.rows.length; i++) {
            listeRes.push(res.rows.item(i));
        };
        return listeRes;
        
    }

    public async insertAffectation(idAtelier:any,idPoste:any,idOperation){
        
        let sRequete = "UPDATE Affectation SET idAtelier=?, idPoste=? WHERE idTransaction = ?";
        console.log(idAtelier);
        console.log(idPoste);
        console.log(idOperation);
        await new Promise((resolve, reject) => {
            try {
                this.db.transaction(async (tx: SQLiteObject) => {
                    await tx.executeSql(sRequete, [idAtelier, idPoste, idOperation]);
                    resolve();
                });
            } catch (e) {
                //console.log(e)
                reject(e);
            }
        });
    }

    
    public async getAnalysesPosteAnnee() {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete1 = 'SELECT ROUND(SUM(t.montantTransaction),2) somme, p.idPoste, p.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Poste p ON p.idPoste = a.idPoste '+
        ' WHERE t.montantTransaction > 0 ' +
        ' GROUP BY p.idPoste,  p.libPoste ' +
        ' ORDER BY somme desc';
        let res1 = await this.db.executeSql(sRequete1, []);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'green', y:item.somme});
        } 

        let sRequete2 = 'SELECT  ROUND(SUM(t.montantTransaction),2) somme, p.idPoste, p.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Poste p ON p.idPoste = a.idPoste '+
        ' WHERE t.montantTransaction < 0 ' +
        ' GROUP BY p.idPoste,  p.libPoste ' +
        ' ORDER BY somme desc';
        let res2 = await this.db.executeSql(sRequete2, []);
        for (var i = 0; i < res2.rows.length; i++) {
            item = res2.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'red', y:Math.abs(item.somme)});
        }
        console.log(listeRes);
        return listeRes;
    }

    
    public async getAnalysesAtelierAnnee(idAtelier: number) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete1 = 'SELECT  ROUND(SUM(t.montantTransaction),2) somme, p.idAtelier, pp.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' WHERE t.montantTransaction > 0 AND p.idAtelier = ? ' +
        ' GROUP BY p.idAtelier,  pp.libPoste ' +
        ' ORDER BY somme desc';
        let res1 = await this.db.executeSql(sRequete1, [idAtelier]);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'green', y:item.somme});
        } 

        let sRequete2 = 'SELECT  ROUND(SUM(t.montantTransaction),2) somme, p.idAtelier, pp.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' WHERE t.montantTransaction < 0 AND p.idAtelier = ? ' +
        ' GROUP BY p.idAtelier,  pp.libPoste ' +
        ' ORDER BY somme desc';
        let res2 = await this.db.executeSql(sRequete2, [idAtelier]);
        for (var i = 0; i < res2.rows.length; i++) {
            item = res2.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'red', y:Math.abs(item.somme)});
        } 
        console.log(listeRes);
        return listeRes;
    }
    
    public async getAnalysesAtelier(mois: string, idAtelier: number) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        if(mois.length == 1){
            mois = '0'+ mois;
        }
        let sRequete1 = 'SELECT  ROUND(SUM(t.montantTransaction),2) somme, p.idAtelier, pp.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' WHERE t.montantTransaction > 0 AND substr(t.dateTransaction,4,2) = ? AND p.idAtelier = ? ' +
        ' GROUP BY p.idAtelier,  pp.libPoste ' +
        ' ORDER BY somme desc';
        let res1 = await this.db.executeSql(sRequete1, [mois, idAtelier]);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'green', y:item.somme});
        } 

        let sRequete2 = 'SELECT  ROUND(SUM(t.montantTransaction),2) somme, p.idAtelier, pp.libPoste ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' WHERE t.montantTransaction < 0 AND substr(t.dateTransaction,4,2) = ?  AND p.idAtelier = ? ' +
        ' GROUP BY p.idAtelier,  pp.libPoste ' +
        ' ORDER BY somme desc';
        let res2 = await this.db.executeSql(sRequete2, [mois, idAtelier]);
        for (var i = 0; i < res2.rows.length; i++) {
            item = res2.rows.item(i);
            listeRes.push({name:item.somme + '€ ' + item.libPoste, color: 'red', y:Math.abs(item.somme)});
        } 
        console.log(listeRes);
        return listeRes;
    } 

    
    public async getAnalysesPosteDetails(mois: string) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        if(mois.length == 1){
            mois = '0'+ mois;
        }
        let sRequete1 = 'SELECT t.idTransaction, t.montantTransaction, t.libTransaction, t.dateTransaction, (substr(t.dateTransaction,7)||substr(t.dateTransaction,4,2)||substr(t.dateTransaction,1,2)) as date, t.idCompte, p.idAtelier, p.libAtelier, pp.idPoste, pp.libPoste  ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' WHERE substr(t.dateTransaction,4,2) = ? ' +
        ' ORDER BY date desc';
        let res1 = await this.db.executeSql(sRequete1, [mois]);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push(item);
        } 
        console.log("ok");
        console.log(listeRes);
        return listeRes;
    } 

    
    public async getAnalysesPosteDetailsAnnee() {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete1 = 'SELECT t.idTransaction, t.montantTransaction, t.libTransaction, t.dateTransaction, (substr(t.dateTransaction,7)||substr(t.dateTransaction,4,2)||substr(t.dateTransaction,1,2)) as date, t.idCompte, p.idAtelier, p.libAtelier, pp.idPoste, pp.libPoste  ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' ORDER BY date desc'; 
        let res1 = await this.db.executeSql(sRequete1, []);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push(item);
        } 
        console.log(listeRes);
        return listeRes;
    } 

    public async getAnalysesAtelierDetails(mois: string, idAtelier: number) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        if(mois.length == 1){
            mois = '0'+ mois;
        }
        let sRequete1 = 'SELECT t.idTransaction, t.montantTransaction, t.libTransaction, t.dateTransaction, (substr(t.dateTransaction,7)||substr(t.dateTransaction,4,2)||substr(t.dateTransaction,1,2)) as date, t.idCompte, p.idAtelier, p.libAtelier, pp.idPoste, pp.libPoste  ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' WHERE substr(t.dateTransaction,4,2) = ? AND p.idAtelier = ? ' +
        ' ORDER BY date desc';
        let res1 = await this.db.executeSql(sRequete1, [mois, idAtelier]);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push(item);
        } 
        console.log(listeRes);
        return listeRes;
    } 
    
    public async getAnalysesAtelierDetailsAnnee(idAtelier: number) {
        if (!this.db || this.db == null ||  this.db == undefined) {
            await this.getBDD();
        }
        let sRequete1 = 'SELECT t.idTransaction, t.montantTransaction, t.libTransaction, t.dateTransaction, (substr(t.dateTransaction,7)||substr(t.dateTransaction,4,2)||substr(t.dateTransaction,1,2)) as date, t.idCompte, p.idAtelier, p.libAtelier, pp.idPoste, pp.libPoste  ' + 
        ' FROM Transac t LEFT JOIN Affectation a on a.idTransaction = t.idTransaction '+
        ' LEFT JOIN Atelier p ON p.idAtelier = a.idAtelier '+
        ' LEFT JOIN Poste pp ON a.idPoste = pp.idPoste '+
        ' WHERE p.idAtelier = ? ' +
        ' ORDER BY date desc';
        let res1 = await this.db.executeSql(sRequete1, [idAtelier]);
        let listeRes: Array<any> = [];
        let item = null;
        for (var i = 0; i < res1.rows.length; i++) {
            item = res1.rows.item(i);
            listeRes.push(item);
        } 
        console.log(listeRes);
        return listeRes;
    } 
}  