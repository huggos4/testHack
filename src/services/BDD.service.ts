import { Injectable,isDevMode } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { insertDT } from '../assets/bdd/donneesTech';

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
                     
                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Poste(idPoste integer PRIMARY KEY AUTOINCREMENT,  libPoste text,  codePoste text)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Atelier(idAtelier integer PRIMARY KEY AUTOINCREMENT,  libAtelier text,  codeAtelier text)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Affectation(  idAtelier integer,  idPoste integer,  idTransaction integer)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS DonneesTechniques(  idDonnees integer PRIMARY KEY AUTOINCREMENT,  dateDonnees text,  Poids numeric,  Nuchep text,  Nubovi text,  Sexe text,  CodeRace text,  CauseSortie text,  idTransaction integer)', []));

                    lProm.push(tx.executeSql('CREATE TABLE IF NOT EXISTS Compte(idCompte integer PRIMARY KEY AUTOINCREMENT,  login text,  mdp text,  libCompte text,  codeBanque text,  typeCompte text)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE Transaction ADD FOREIGN KEY(idCompte) REFERENCES Compte (idCompte)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE Affectation ADD FOREIGN KEY(idAtelier) REFERENCES Atelier (idAtelier)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE Affectation ADD FOREIGN KEY(idPoste) REFERENCES Poste (idPoste)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE Affectation ADD FOREIGN KEY(idTransaction) REFERENCES Transaction (idTransaction)', []));

                    // lProm.push(tx.executeSql('ALTER TABLE DonneesTechniques ADD FOREIGN KEY (idTransaction) REFERENCES Transaction (idTransaction)', []));
                    
                    //on attend la fin de l'execution de tous les ordres sql
                    await Promise.all(lProm);

                    await this.recupDonneesTechnique();

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
        let sRequete = "INSERT INTO Compte(login, mdp, codeBanque, typeCompte)VALUES (?,?,?,?)";
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
} 