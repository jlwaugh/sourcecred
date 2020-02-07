// @flow

import {TaskReporter} from "../../util/taskReporter";
import {type WeightedGraph} from "../../core/weightedGraph";
import {type ReferenceDetector} from "../../core/references";
import {type PluginDeclaration} from "../../analysis/pluginDeclaration";
import {type InitiativeRepository} from "./initiative";
import {weightsForDeclaration} from "../../analysis/pluginDeclaration";
import {createGraph as _createGraph} from "./createGraph";
import {
  type InitiativesDirectory,
  type LoadedInitiativesDirectory,
  loadDirectory as _loadDirectory,
} from "./initiativesDirectory";
import {declaration} from "./declaration";

export interface Loader {
  declaration(): PluginDeclaration;
  loadDirectory: typeof loadDirectory;
  createGraph: typeof createGraph;
}

export default ({
  declaration: () => declaration,
  loadDirectory,
  createGraph,
}: Loader);

export async function loadDirectory(
  dir: InitiativesDirectory,
  reporter: TaskReporter
): Promise<LoadedInitiativesDirectory> {
  reporter.start("initiatives");
  const loadedDir = await _loadDirectory(dir);
  reporter.finish("initiatives");
  return loadedDir;
}

export async function createGraph(
  repo: InitiativeRepository,
  refs: ReferenceDetector
): Promise<WeightedGraph> {
  const graph = _createGraph(repo, refs);
  const weights = weightsForDeclaration(declaration);
  return {graph, weights};
}
