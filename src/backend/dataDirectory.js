// @flow

import path from "path";
import fs from "fs-extra";
import Database from "better-sqlite3";
import {type Project, projectToJSON} from "../core/project";
import {directoryForProjectId} from "../core/project_io";
import * as WeightedGraph from "../core/weightedGraph";
import {type CacheProvider} from "./cache";
import type {
  ProjectStorageProvider,
  ProjectStorageExtras,
} from "./projectStorage";
import {toJSON as pluginsToJSON} from "../analysis/pluginDeclaration";
import {TimelineCred} from "../analysis/timeline/timelineCred";
import {compatWriter} from "./compatIO";

const writers = {
  project: compatWriter(projectToJSON, "Project"),
  weightedGraph: compatWriter(WeightedGraph.toJSON, "WeightedGraph"),
  cred: compatWriter(TimelineCred.toJSON, "TimelineCred"),
  pluginDeclarations: compatWriter(pluginsToJSON, "PluginDeclarations"),
};

/**
 * Represents a SourceCred data directory.
 */
export class DataDirectory implements CacheProvider, ProjectStorageProvider {
  +_sourcecredDirectory: string;
  +_cacheDirectory: string;

  constructor(sourcecredDirectory: string) {
    this._sourcecredDirectory = sourcecredDirectory;
    this._cacheDirectory = path.join(sourcecredDirectory, "cache");
  }

  async database(id: string): Promise<Database> {
    await fs.mkdirp(this._cacheDirectory);
    const file = path.join(this._cacheDirectory, `${id}.db`);
    return new Database(file);
  }

  async storeProject(
    project: Project,
    {weightedGraph, cred, pluginDeclarations}: ProjectStorageExtras
  ): Promise<void> {
    const projectDirectory = directoryForProjectId(
      project.id,
      this._sourcecredDirectory
    );
    const fileName = (name: string) => path.join(projectDirectory, name);
    await fs.mkdirp(projectDirectory);
    writers.project(fileName("project.json"), project);
    if (weightedGraph) {
      writers.weightedGraph(fileName("weightedGraph.json"), weightedGraph);
    }
    if (cred) {
      writers.cred(fileName("cred.json"), cred);
    }
    if (pluginDeclarations) {
      writers.pluginDeclarations(
        fileName("pluginDeclarations.json"),
        pluginDeclarations
      );
    }
  }
}
