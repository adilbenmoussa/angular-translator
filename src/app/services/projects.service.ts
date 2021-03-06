import { Icu } from './../models/icu';
import { Translation } from './../models/translation';
import { Source, Msg } from './../models/source';
import { BackendService } from './backend.service';
import { Project } from './../models/project';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class ProjectsService {

  /**
   * The list of defined projects
   */
  public projects$ = new ReplaySubject<Project[]>(1);
  private projects: Project[];

  /**
   * The selected translation file
   */
  public currentTranslation$ = new ReplaySubject<Translation>(1);
  private currentTranslation: Translation;

  /**
   * The urrent source
   */
  public currentSource$ = new ReplaySubject<Source>(1);

  /**
   * Does the current project need to be saved
   */
  public needSave$ = new ReplaySubject<boolean>(1);

  constructor(private backend: BackendService) {
    this.projects = this.backend.projectsList();
    this.projects$.next(this.projects);
  }

  public add(p: Project) {
    p.id = 1 + this.projects.reduce((prev: number, curr: Project) => Math.max(prev, curr.id), 0);
    this.projects.push(p);
    this.projects$.next(this.projects);
    this.backend.projectsSave(this.projects);
    return p.id;
  }

  public update(id: number, p: Project) {
    this.projects = this.projects.filter((pr: Project) => pr.id !== id);
    p.id = id;
    this.projects.push(p);
    this.projects$.next(this.projects);
    this.backend.projectsSave(this.projects);
  }

  public delete(id: number) {
    this.projects = this.projects.filter((pr: Project) => pr.id !== id);
    this.projects$.next(this.projects);
    this.backend.projectsSave(this.projects);
  }

  public get(id: number): Project {
    const list = this.projects.filter((p: Project) => p.id === id);
    if (list.length === 1) {
      return list[0];
    } else {
      return null;
    }
  }

  public setCurrentTranslation(tr: Translation) {
    this.currentTranslation = tr;
    this.currentTranslation$.next(tr);
  }

  public setTranslatedMsg(id: string, value: string) {
    const list = this.currentTranslation.msgs.filter((m: Msg) => m.id === id);
    if (list.length > 0) {
      list[0].content = value;
      list[0].icu = Icu.parse(value);
    } else {
      this.currentTranslation.msgs.push({
        id: id,
        content: value,
        icu: Icu.parse(value)
      });
    }
    this.currentTranslation$.next(this.currentTranslation);
    this.needSave$.next(true);
  }

  public setCurrentSource(src: Source) {
    this.currentSource$.next(src);
  }

  public setNeedSave(b: boolean) {
    this.needSave$.next(b);
  }
}
